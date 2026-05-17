# TradeX — Technical Documentation

## 1. Project Overview

**TradeX** is a full-stack, real-time stock trading simulation platform built on the MERN stack. It allows users to create an account, track live Indian stock market data (NSE/BSE), execute simulated buy/sell orders, and manage their portfolio — all through a modern, responsive web interface.

### What Makes This Project Stand Out
- Uses **real-time market data** from Yahoo Finance, not dummy/mock data.
- **WebSocket-based live updates** via Socket.io — the server pushes price changes to all connected clients every 15 seconds.
- **Secure cookie-based authentication** (httpOnly JWT cookies) that works seamlessly across two separate React applications running on different ports.
- **Joi schema validation** on every API endpoint to ensure data integrity before it hits the database.
- Proper **weighted average cost calculation** when buying the same stock multiple times.
- **Full Buy & Sell flow** with holding quantity validation, live price fetching, and sell-from-holdings capability.

---

## 2. Architecture

```
┌─────────────────────┐     ┌─────────────────────┐
│   Frontend (React)  │     │   Dashboard (React)  │
│   Port 3000         │     │   Port 3001          │
│                     │     │                      │
│  Landing Page       │     │  Watchlist, Holdings  │
│  Signup / Login     │     │  Orders, Positions    │
│  About, Pricing     │     │  Funds, Charts        │
└────────┬────────────┘     └────────┬─────────────┘
         │  HTTP + Cookies           │  HTTP + Cookies
         │                           │  WebSocket (Socket.io)
         └───────────┬───────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Backend (Express)   │
         │   Port 3002           │
         │                       │
         │  REST API             │
         │  Socket.io Server     │
         │  JWT Auth             │
         │  Joi Validation       │
         └───────────┬───────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
  ┌──────────────┐    ┌─────────────────┐
  │   MongoDB    │    │  Yahoo Finance  │
  │   Atlas      │    │  API (External) │
  │              │    │                 │
  │  Users       │    │  Live Quotes    │
  │  Holdings    │    │  NIFTY / SENSEX │
  │  Orders      │    │  Stock Search   │
  │  Positions   │    │                 │
  └──────────────┘    └─────────────────┘
```

### Why Three Separate Applications?
The project is split into three independent applications:
1. **Frontend (Port 3000)**: The public-facing marketing website. Anyone can visit it. Contains the home page, about, pricing, support, and the signup/login flow.
2. **Dashboard (Port 3001)**: The private, authenticated trading interface. Only logged-in users can access it. Contains the watchlist, portfolio, order execution, and real-time market data.
3. **Backend (Port 3002)**: The API server that serves both the frontend and the dashboard. Handles authentication, database operations, Yahoo Finance integration, and Socket.io broadcasting.

This separation mirrors how real companies build products — e.g., Zerodha has a public website (zerodha.com) and a separate trading app (Kite). It also demonstrates the ability to share authentication state across different origins using secure cookies.

---

## 3. Tech Stack Breakdown

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend UI | React.js 18 | Component-based UI rendering |
| Routing | React Router v6 | SPA navigation without page reloads |
| HTTP Client | Axios | API requests with `withCredentials` for cookie support |
| Real-Time | Socket.io Client | WebSocket connection for live market data |
| Charts | Chart.js + react-chartjs-2 | Portfolio visualization (Doughnut, Bar charts) |
| UI Library | Material UI (MUI) | Icons, tooltips, and pre-built components |
| Server | Express.js 5 | REST API framework |
| Real-Time Server | Socket.io | WebSocket server for broadcasting market data |
| Database | MongoDB Atlas + Mongoose | Cloud-hosted NoSQL database with ODM |
| Auth | JWT + bcryptjs | Token-based authentication with password hashing |
| Validation | Joi | Schema-based request body validation |
| Market Data | yahoo-finance2 v3 | Live stock quotes, index data, and stock search |

---

## 4. Key Features — Deep Dive

### 4.1 Authentication System

**Flow:**
```
User submits login form
        │
        ▼
Frontend sends POST /login with { email, password }
        │
        ▼
Joi middleware validates email format + password exists
        │  (rejects with 400 if invalid)
        ▼
AuthController checks email exists in MongoDB
        │
        ▼
bcrypt.compare() verifies password against hashed version
        │
        ▼
JWT token created with userId, set as httpOnly cookie
        │
        ▼
Cookie automatically sent with every future request
```

**Why httpOnly Cookies instead of localStorage?**
- `httpOnly` cookies **cannot be accessed by JavaScript** (`document.cookie` won't return it), which prevents XSS (Cross-Site Scripting) attacks from stealing tokens.
- `localStorage` tokens are vulnerable — any injected script can read `localStorage.getItem("token")` and steal the user's session.
- Cookies with `sameSite: "lax"` work across different ports on localhost, enabling seamless auth between frontend (3000) and dashboard (3001).

**Interview Talking Point:** *"I chose httpOnly cookies over localStorage for JWT storage because localStorage is accessible to any JavaScript running on the page, making it vulnerable to XSS attacks. httpOnly cookies are invisible to client-side JS and are automatically sent with every HTTP request, which also simplifies the code — no need to manually attach tokens to headers."*

---

### 4.2 Real-Time Data with Socket.io

**How it works:**

```
Backend (Server)                          Dashboard (Client)
      │                                        │
      │  ┌─ Every 15 seconds ──────────┐       │
      │  │                              │       │
      │  │  Fetch NIFTY 50 + SENSEX    │       │
      │  │  Fetch 10 stock prices      │       │
      │  │                              │       │
      │  └──────────────────────────────┘       │
      │                                        │
      ├──── io.emit("indicesUpdate") ──────────►│  TopBar updates
      │                                        │
      ├──── io.emit("stocksUpdate") ───────────►│  WatchList updates
      │                                        │
      │  On new client connection:              │
      ├──── broadcastMarketData() ─────────────►│  Immediate data
      │                                        │
```

**Before (Polling):** The dashboard called `GET /api/indices` every 30 seconds using `setInterval`. This means:
- Unnecessary HTTP overhead (headers, connection setup) every 30 seconds.
- The client asks "do you have new data?" even when nothing changed.
- 30-second delay worst case before seeing new prices.

**After (WebSocket Push):** The server maintains a persistent connection and **pushes** data when it's ready:
- Single persistent TCP connection (no repeated HTTP overhead).
- Server decides when to send data — no wasted requests.
- 15-second update interval, easily configurable.
- Connection status indicator (green/red dot) shows users the live state.

**Interview Talking Point:** *"I replaced HTTP polling with WebSockets using Socket.io because financial applications need low-latency data delivery. With polling, the client wastes requests asking for data that hasn't changed. With WebSockets, the server pushes updates only when new data is available, reducing bandwidth and improving responsiveness."*

---

### 4.3 Order Execution & Portfolio Management

**Buy Flow:**
```
User clicks "Buy" on RELIANCE.NS (Qty: 5, Price: ₹1,436)
        │
        ▼
Joi validates: symbol exists, qty > 0, price > 0, mode = BUY
        │
        ▼
JWT cookie verified → userId extracted
        │
        ▼
Order saved to MongoDB: { userId, symbol, name, qty, price, mode: "BUY" }
        │
        ▼
Check if user already holds RELIANCE.NS
        │
   ┌────┴────┐
   │         │
  Yes        No
   │         │
   ▼         ▼
Update:    Create:
Weighted   { symbol: "RELIANCE.NS",
Average      qty: 5,
Calculation  avg: 1436 }
```

**Weighted Average Cost Formula:**
When a user buys the same stock again, the average cost is recalculated:
```
newAvg = (existingAvg × existingQty + newPrice × newQty) / (existingQty + newQty)
```

**Example:**
- First buy: 5 shares of RELIANCE at ₹1,436 → avg = ₹1,436
- Second buy: 3 shares of RELIANCE at ₹1,500 → avg = (1436×5 + 1500×3) / (5+3) = **₹1,460**

**Sell Flow:**
```
User clicks "Sell" on a holding (Holdings page or Watchlist)
        │
        ▼
SellActionWindow opens (red-themed modal)
        │
        ▼
Fetches live market price + user's current holding qty
        │
        ▼
User enters quantity to sell (defaults to full holding)
        │
        ▼
Client-side validation: qty ≤ holdingQty, qty > 0
        │
        ▼
Joi validates: symbol, qty (positive int), price (positive), mode = SELL
        │
        ▼
Backend checks holdings: does user own enough shares?
        │
   ┌────┴────┐
   │         │
  qty > 0   qty = 0
   │         │
   ▼         ▼
 Update:   Delete:
 Reduce    Remove holding
 qty       from database
```

**Two Ways to Sell:**
1. **From Watchlist** — Hover over a stock → click the red "Sell" button.
2. **From Holdings Page** — Each holding row has a red "Sell" button for quick exit.

**Context Provider Architecture:**
The `GeneralContextProvider` wraps the entire dashboard (WatchList + all Routes), exposing `openBuyWindow()` and `openSellWindow()` to any child component via React's Context API. Opening one window automatically closes the other.

```
<GeneralContextProvider>        ← Provides buy/sell window controls
  <WatchList />                 ← ✅ Can open Buy & Sell
  <div className="content">
    <Holdings />                ← ✅ Can open Sell
    <Orders />                  ← ✅ Inside context
    <Funds />                   ← ✅ Inside context
  </div>
  {isBuyWindowOpen && <BuyActionWindow />}
  {isSellWindowOpen && <SellActionWindow />}
</GeneralContextProvider>
```

**Interview Talking Point:** *"The buy/sell system uses a weighted average cost model, which is the industry standard used by brokers like Zerodha and Groww. The sell feature validates holding quantity on both the client and server side — preventing overselling. I used React's Context API to share the buy/sell modal state across the entire dashboard, allowing users to sell from multiple entry points (watchlist and holdings table)."*

---

### 4.4 Joi Request Validation

**Why Joi?**
Manual validation (`if (!email || !password)`) is:
- Error-prone and inconsistent.
- Hard to maintain across multiple routes.
- Doesn't provide detailed, user-friendly error messages.

**How it's implemented:**
```javascript
// Define the schema once
const orderSchema = Joi.object({
  symbol: Joi.string().trim().uppercase().required(),
  qty: Joi.number().integer().positive().min(1).required(),
  price: Joi.number().positive().required(),
  mode: Joi.string().valid("BUY", "SELL").required(),
});

// Use as middleware — one line in the route
app.post("/newOrder", validate(orderSchema), async (req, res) => {
  // req.body is guaranteed to be clean and valid here
});
```

**What it catches:**
| Input | Error Message |
|-------|--------------|
| `qty: -5` | "Quantity must be greater than 0" |
| `qty: 2.5` | "Quantity must be a whole number" |
| `mode: "EXCHANGE"` | "Mode must be either BUY or SELL" |
| `email: "notanemail"` | "Please provide a valid email address" |
| `password: "ab"` | "Password must be at least 6 characters" |
| Unknown fields | Automatically stripped (security) |

**Interview Talking Point:** *"I used Joi for input validation because it acts as a single source of truth for what valid data looks like. The validate() middleware factory I wrote is reusable — you define the schema once and apply it to any route with one line. It also uses `stripUnknown: true` to prevent mass-assignment attacks by removing any unexpected fields from the request body."*

---

### 4.5 Live Price Enrichment

When the dashboard requests holdings (`GET /allHoldings`), the backend doesn't just return the static data from MongoDB. It:

1. Fetches the user's holdings from the database (symbol, qty, avg cost).
2. Calls Yahoo Finance API for the **live current price** of each stock.
3. Calculates P&L, net change %, and day change % dynamically.
4. Returns the enriched data to the frontend.

This means the holdings page always shows **real-time profit/loss** without storing prices in the database.

---

## 5. Database Schema Design

```
┌──────────────┐       ┌──────────────────┐
│    Users     │       │    Holdings      │
├──────────────┤       ├──────────────────┤
│ _id          │◄──────│ userId (ref)     │
│ email        │       │ symbol           │
│ username     │       │ name             │
│ password     │       │ qty              │
│ createdAt    │       │ avg              │
└──────────────┘       │ createdAt        │
       │               └──────────────────┘
       │
       │               ┌──────────────────┐
       ├───────────────►│    Orders        │
       │               ├──────────────────┤
       │               │ userId (ref)     │
       │               │ symbol           │
       │               │ name             │
       │               │ qty              │
       │               │ price            │
       │               │ mode (BUY/SELL)  │
       │               │ status           │
       │               │ createdAt        │
       │               └──────────────────┘
       │
       │               ┌──────────────────┐
       └───────────────►│   Positions     │
                       ├──────────────────┤
                       │ userId (ref)     │
                       │ symbol           │
                       │ name             │
                       │ product (MIS/CNC)│
                       │ qty              │
                       │ avg              │
                       │ createdAt        │
                       └──────────────────┘
```

**Key Design Decision:** All collections have a `userId` field referencing the User collection. This ensures **data isolation** — User A can never see User B's holdings or orders. This is achieved using a compound unique index:
```javascript
HoldingsSchema.index({ userId: 1, symbol: 1 }, { unique: true });
```
This also prevents duplicate holdings — a user can only have one holding entry per stock symbol.

---

## 6. API Endpoints

### Authentication
| Method | Endpoint | Middleware | Description |
|--------|----------|------------|-------------|
| POST | `/signup` | `validate(signupSchema)` | Create account + set JWT cookie |
| POST | `/login` | `validate(loginSchema)` | Verify credentials + set JWT cookie |
| POST | `/logout` | — | Clear JWT cookie |
| GET | `/verify` | — | Check if JWT cookie is valid |

### Market Data
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quote/:symbol` | Get live quote for a single stock |
| GET | `/api/quotes?symbols=X,Y` | Get live quotes for multiple stocks |
| GET | `/api/indices` | Get live NIFTY 50 and SENSEX data |
| GET | `/api/search?q=tata` | Search for stocks by name/symbol |

### Portfolio (Requires Authentication)
| Method | Endpoint | Middleware | Description |
|--------|----------|------------|-------------|
| GET | `/allHoldings` | JWT cookie | Get user's holdings with live prices |
| GET | `/allPositions` | JWT cookie | Get user's positions with live prices |
| GET | `/allOrders` | JWT cookie | Get user's order history |
| POST | `/newOrder` | JWT cookie + `validate(orderSchema)` | Execute a buy/sell order |

### WebSocket Events
| Event | Direction | Data |
|-------|-----------|------|
| `indicesUpdate` | Server → Client | `{ nifty: {...}, sensex: {...} }` |
| `stocksUpdate` | Server → Client | `[{ symbol, name, price, change, ... }]` |

---

## 7. Security Measures

| Threat | Protection |
|--------|-----------|
| XSS (token theft) | `httpOnly: true` cookie — JS cannot access the token |
| CSRF | `sameSite: "lax"` — cookie only sent for same-site or top-level navigation |
| Password cracking | `bcrypt` with 12 salt rounds — computationally expensive to brute-force |
| Injection attacks | Joi validation strips unknown fields and enforces strict data types |
| Unauthorized data access | Every DB query filters by `userId` extracted from JWT |
| CORS abuse | Explicit `origin` whitelist: only localhost:3000 and localhost:3001 |

---

## 8. Interview Q&A Preparation

**Q: Why did you choose MongoDB over SQL for this project?**
> Stock portfolios have a flexible schema — different stocks have different attributes. MongoDB's document model lets me store and query user-specific data efficiently. The compound index `{ userId, symbol }` gives me fast lookups for "does this user already hold this stock?" — which is critical for the buy/sell flow.

**Q: How does authentication work across two different React apps?**
> Both apps run on localhost but on different ports (3000 and 3001). Since cookies are scoped by domain (not port), a cookie set by the backend (localhost:3002) is automatically sent by both the frontend and the dashboard when they make requests to the backend. I use `sameSite: "lax"` and `withCredentials: true` on Axios to make this work.

**Q: What happens if the Yahoo Finance API goes down?**
> I use `Promise.allSettled()` instead of `Promise.all()` when fetching stock prices. This means if one stock's API call fails, the rest still succeed. For holdings enrichment, if a live price can't be fetched, I fall back to the user's average purchase price so the page still renders.

**Q: How would you scale this for production?**
> 1. Replace the 15-second polling of Yahoo Finance with a proper market data feed.
> 2. Add Redis for caching frequently requested stock prices.
> 3. Use Socket.io rooms to send each user only the stocks they're watching (currently broadcasts everything).
> 4. Deploy the three apps behind an Nginx reverse proxy on a single domain with path-based routing.
> 5. Move from `sameSite: lax` to `sameSite: strict` with HTTPS and `secure: true` cookies.

**Q: Why Socket.io instead of Server-Sent Events (SSE)?**
> Socket.io provides bidirectional communication — right now I only push data, but if I add features like "alert me when RELIANCE crosses ₹1,500", the client would need to send messages to the server too. Socket.io also handles reconnection, fallback to polling, and room-based broadcasting out of the box.

---

## 9. Resume Bullet Points

Use these for your resume's project section:

- Built a **full-stack MERN trading platform** with real-time market data integration via Yahoo Finance API, serving live stock quotes and index data for NSE/BSE markets.
- Implemented **WebSocket-based real-time data delivery** using Socket.io, replacing HTTP polling and reducing client-server data latency by ~50%.
- Designed a **secure, cross-origin authentication system** using JWT stored in httpOnly cookies with bcrypt password hashing, supporting seamless session sharing across two independent React applications.
- Built a **Joi-powered validation middleware** layer that enforces strict input schemas on all API endpoints, preventing invalid data from reaching the database.
- Engineered a **dynamic portfolio engine** that enriches static holdings data with live market prices to calculate real-time P&L using weighted average cost methodology.
- Developed **user-scoped database schemas** with compound unique indexes in MongoDB, ensuring complete data isolation between users.
- Implemented a **complete Buy & Sell trading flow** with dual entry points (watchlist and holdings table), client-server holding validation, and React Context-based modal state management.

---

## 10. Running the Project

```bash
# Terminal 1 — Backend (must start first)
cd backend
npm install
npm start                 # Runs on http://localhost:3002

# Terminal 2 — Frontend Landing Page
cd frontend
npm install
npm start                 # Runs on http://localhost:3000

# Terminal 3 — Trading Dashboard
cd dashboard
npm install
npm start                 # Runs on http://localhost:3001
```

### Environment Variables (backend/.env)
```
MONGO_URL=your_mongodb_connection_string
TOKEN_KEY=your_jwt_secret_key
PORT=3002
```

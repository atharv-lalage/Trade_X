# TradeX 📈

TradeX is a modern, full-stack stock trading platform that allows users to manage their portfolios, track real-time stock market data, and execute simulated trades seamlessly.

## 🚀 Features

- **Real-Time Market Data via WebSockets**: Live stock prices and indices (NIFTY 50, SENSEX) pushed to the dashboard in real-time using **Socket.io**, eliminating the need for polling.
- **Secure Authentication**: JWT-based authentication system with secure HTTP-only cookies and bcrypt password hashing.
- **Request Validation**: All API inputs validated using **Joi** schemas — ensuring data integrity for signups, logins, and order placement.
- **Dynamic Dashboard**:
  - **Watchlist**: Search and add live stocks to your watchlist with real-time price updates.
  - **Buy & Sell**: Execute trades from the watchlist or directly from the Holdings page with live price validation and holding quantity checks.
  - **Holdings & Positions**: Automatically tracks your investments and calculates real-time margins and P&L based on Live Traded Prices (LTP).
  - **Funds**: Dynamic margin and balance calculations based on your actual portfolio.
- **Modern UI/UX**: Responsive and sleek React-based user interfaces for both the main landing page and the trading dashboard.

## 🛠️ Tech Stack

### Frontend
- **React.js** (Frontend Landing Page & Trading Dashboard)
- **Socket.io Client** for real-time WebSocket data
- **React Router** for seamless navigation
- **Axios** for API requests
- **Chart.js** for visual portfolio analytics

### Backend
- **Node.js & Express.js**
- **Socket.io** for real-time market data broadcasting
- **MongoDB & Mongoose** (Database & User-scoped Schemas)
- **yahoo-finance2** (Live Stock Market API)
- **Joi** for request validation
- **JSON Web Tokens (JWT)** for Authentication

## 📂 Project Structure

The project is divided into three main applications:
1. `backend/`: The Express backend server that manages the database, API endpoints, and authentication.
2. `frontend/`: The public-facing landing page where users can learn about TradeX, view pricing, and log in or sign up.
3. `dashboard/`: The secure, authenticated trading dashboard for active users to manage their portfolio.

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) installed
- A [MongoDB](https://www.mongodb.com/) cluster (or local instance)

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd TradeX
```

### 2. Setup the Backend
```bash
cd backend
npm install
```
- Create a `.env` file inside the `backend` directory with the following variables:
  ```env
  MONGO_URL=your_mongodb_connection_string
  TOKEN_KEY=your_super_secret_jwt_key
  PORT=3002
  ```
- Start the backend server:
  ```bash
  npm start
  ```

### 3. Setup the Frontend (Landing Page)
Open a new terminal window:
```bash
cd frontend
npm install
npm start
```
*The frontend will run on `http://localhost:3000`*

### 4. Setup the Dashboard
Open a third terminal window:
```bash
cd dashboard
npm install
npm start
```
*The dashboard will run on `http://localhost:3001`*

## 💡 How to Use
1. Start all three servers as detailed above.
2. Visit `http://localhost:3000` and click on **Sign up for free** to create an account.
3. Once logged in, click **Dashboard** in the navigation bar.
4. Search for an NSE/BSE stock (e.g., `RELIANCE.NS`, `TCS.NS`) and add it to your watchlist.
5. Hover over a stock and click **Buy** to purchase shares at live market price.
6. Navigate to the **Holdings** page to see your portfolio with real-time P&L.
7. Click the **Sell** button on any holding to sell shares — or use the Sell button in the watchlist.

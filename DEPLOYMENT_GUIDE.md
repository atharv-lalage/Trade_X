# TradeX — Free Deployment Guide

Deploying a MERN stack application with three separate folders (`frontend`, `dashboard`, `backend`) requires hosting the backend on a server platform and the React apps on static hosting platforms. 

Here is the step-by-step guide to deploying TradeX for **free** using **Render** (for the Backend) and **Vercel** (for the React apps).

---

## ⚠️ Phase 1: Code Changes Required Before Deploying

Right now, your React apps use hardcoded URLs (`http://localhost:3002`) and your backend CORS/Cookies are configured for `localhost`. You must change these to be dynamic for production.

### 1. Update Frontend & Dashboard API URLs
In both `frontend` and `dashboard`, you need to replace `http://localhost:3002` with an environment variable.

**Example Change in `dashboard/src/services/stockApi.js`:**
```javascript
// BEFORE:
const API_BASE = "http://localhost:3002";

// AFTER:
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:3002";
```
*(You will need to find all instances of `"http://localhost:3002"` in your `.jsx` files and replace them with `API_BASE` or `process.env.REACT_APP_API_URL`)*.

### 2. Update Backend CORS and Cookie Settings
Since your backend will be on Render (e.g., `tradex-api.onrender.com`) and your React apps on Vercel (e.g., `tradex.vercel.app`), they will be on different domains.

**In `backend/index.js` (CORS Setup):**
```javascript
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,   // e.g., "https://tradex-frontend.vercel.app"
  process.env.DASHBOARD_URL   // e.g., "https://tradex-dashboard.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Do the same for Socket.io CORS
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
```

**In `backend/Controllers/AuthController.js` (Cookie Settings):**
Cross-domain cookies require `secure: true` and `sameSite: "none"`.
```javascript
// Change cookie options in Login and Signup:
res.cookie("token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // true in production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 3 * 24 * 60 * 60 * 1000,
  path: "/",
});
```

### 3. Push to GitHub
Once you make these changes, commit and push your entire `TradeX` folder to a public or private GitHub repository.

---

## 🚀 Phase 2: Deploying the Backend (Render)

Render is great for Node.js backends and natively supports WebSockets (Socket.io).

1. Go to [Render.com](https://render.com/) and sign up with GitHub.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `TradeX` repository.
4. Fill in the deployment details:
   - **Name**: `tradex-backend`
   - **Root Directory**: `backend` *(⚠️ Very Important!)*
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: Free
5. Scroll down to **Environment Variables** and add:
   - `MONGO_URL`: *<Your MongoDB Atlas Connection String>*
   - `TOKEN_KEY`: *<Your JWT Secret>*
   - `NODE_ENV`: `production`
   - `FRONTEND_URL`: *(Leave blank for now, we will fill this in Phase 3)*
   - `DASHBOARD_URL`: *(Leave blank for now)*
6. Click **Create Web Service**. Wait 2-3 minutes for it to build.
7. Copy your deployed backend URL (e.g., `https://tradex-backend-xyz.onrender.com`).

---

## 💻 Phase 3: Deploying Frontend & Dashboard (Vercel)

Vercel is the best free platform for React applications.

### Deploying the Frontend:
1. Go to [Vercel.com](https://vercel.com/) and sign up with GitHub.
2. Click **Add New...** → **Project**.
3. Import your `TradeX` GitHub repository.
4. In the configuration screen:
   - **Project Name**: `tradex-home`
   - **Framework Preset**: Create React App
   - **Root Directory**: Edit this and select the `frontend` folder.
5. Open **Environment Variables** and add:
   - `REACT_APP_API_URL`: *<Your Render Backend URL>* (e.g., `https://tradex-backend-xyz.onrender.com`)
6. Click **Deploy**.
7. Once deployed, copy the Frontend URL (e.g., `https://tradex-home.vercel.app`).

### Deploying the Dashboard:
1. Go back to Vercel dashboard and click **Add New...** → **Project**.
2. Import the `TradeX` GitHub repository again.
3. In the configuration screen:
   - **Project Name**: `tradex-dashboard`
   - **Framework Preset**: Create React App
   - **Root Directory**: Edit this and select the `dashboard` folder.
4. Open **Environment Variables** and add:
   - `REACT_APP_API_URL`: *<Your Render Backend URL>*
   - `REACT_APP_FRONTEND_URL`: *<Your Vercel Frontend URL>*
5. Click **Deploy**.
6. Once deployed, copy the Dashboard URL (e.g., `https://tradex-dashboard.vercel.app`).

---

## 🔗 Phase 4: Connecting Everything

Now that everything is deployed, you need to tell the Backend to accept requests from your new Vercel URLs.

1. Go back to your [Render.com](https://render.com/) dashboard.
2. Open your `tradex-backend` service.
3. Go to **Environment** on the left menu.
4. Update the variables you left blank earlier:
   - `FRONTEND_URL`: *<Your Vercel Frontend URL>*
   - `DASHBOARD_URL`: *<Your Vercel Dashboard URL>*
5. Save the changes. Render will automatically restart your backend.

### 🎉 You're Done!
Visit your Vercel Frontend URL. You should be able to sign up, which will seamlessly direct you to the Vercel Dashboard URL, communicating with your live Render backend in real-time.

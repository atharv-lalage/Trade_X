require("dotenv").config();

const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const authRoute = require("./Routes/AuthRoute");
const YahooFinance = require("yahoo-finance2").default;
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// Baseline stock prices for mock fallback
const MOCK_BASELINES = {
  "^NSEI": { name: "NIFTY 50", price: 22450.75, prevClose: 22400.00 },
  "^BSESN": { name: "SENSEX", price: 73950.40, prevClose: 73800.00 },
  "RELIANCE.NS": { name: "RELIANCE INDUSTRIES LTD", price: 2450.25, prevClose: 2435.00 },
  "TCS.NS": { name: "TCS LTD", price: 3850.60, prevClose: 3865.00 },
  "INFY.NS": { name: "INFOSYS LTD", price: 1420.80, prevClose: 1410.00 },
  "HDFCBANK.NS": { name: "HDFC BANK LTD", price: 1520.10, prevClose: 1530.00 },
  "ICICIBANK.NS": { name: "ICICI BANK LTD", price: 1080.45, prevClose: 1075.00 },
  "WIPRO.NS": { name: "WIPRO LTD", price: 450.15, prevClose: 452.00 },
  "ITC.NS": { name: "ITC LTD", price: 430.50, prevClose: 428.00 },
  "BHARTIARTL.NS": { name: "BHARTI AIRTEL LTD", price: 1210.90, prevClose: 1205.00 },
  "SBIN.NS": { name: "STATE BANK OF INDIA", price: 780.35, prevClose: 785.00 },
  "LT.NS": { name: "LARSEN & TOUBRO LTD", price: 3450.80, prevClose: 3430.00 },
  "PHYSICSWALLAH.NS": { name: "PHYSICSWALLAH LIMITED", price: 113.85, prevClose: 110.00 }
};

// State to store active mock prices that fluctuate slightly
const activeMockPrices = {};

const getMockQuote = (symbol) => {
  const cleanSymbol = symbol.trim().toUpperCase();
  let baseline = MOCK_BASELINES[cleanSymbol];
  if (!baseline) {
    const foundKey = Object.keys(MOCK_BASELINES).find(key => 
      key.includes(cleanSymbol) || MOCK_BASELINES[key].name.toUpperCase().includes(cleanSymbol)
    );
    baseline = foundKey ? MOCK_BASELINES[foundKey] : {
      name: cleanSymbol.replace(".NS", ""),
      price: 150.00,
      prevClose: 150.00
    };
  }

  if (!activeMockPrices[cleanSymbol]) {
    activeMockPrices[cleanSymbol] = baseline.price;
  }

  // Fluctuate the price slightly (+/- 0.15% max per tick)
  const changePercent = (Math.random() - 0.5) * 0.003; 
  activeMockPrices[cleanSymbol] = activeMockPrices[cleanSymbol] * (1 + changePercent);

  const price = activeMockPrices[cleanSymbol];
  const prevClose = baseline.prevClose;
  const change = price - prevClose;
  const changePercentVal = (change / prevClose) * 100;

  return {
    symbol: cleanSymbol,
    shortName: baseline.name,
    regularMarketPrice: price,
    regularMarketChange: change,
    regularMarketChangePercent: changePercentVal,
    regularMarketDayHigh: price * 1.01,
    regularMarketDayLow: price * 0.99,
    regularMarketOpen: prevClose * 1.002,
    regularMarketPreviousClose: prevClose,
    regularMarketVolume: Math.floor(Math.random() * 5000000) + 100000,
  };
};

const safeGetQuote = async (symbol) => {
  try {
    const quote = await yahooFinance.quote(symbol);
    if (!quote || !quote.regularMarketPrice) {
      throw new Error("Invalid quote data from API");
    }
    return quote;
  } catch (error) {
    return getMockQuote(symbol);
  }
};

const { validate, orderSchema } = require("./Middlewares/validation");

const { HoldingsModel } = require("./model/HoldingsModel");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");

const PORT = process.env.PORT || 3002;
const uri = process.env.MONGO_URL;

const app = express();
const server = http.createServer(app);

// ─── Socket.io Setup ────────────────────────────────────────────────────

const parseOrigins = (urlStr) => {
  if (!urlStr) return [];
  return urlStr
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean);
};

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  ...parseOrigins(process.env.FRONTEND_URL),
  ...parseOrigins(process.env.DASHBOARD_URL),
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/", authRoute);

// ─── Stock Market Data Routes (Yahoo Finance) ──────────────────────────

// Get quote for a single stock symbol (e.g., RELIANCE.NS, AAPL, TCS.NS)
app.get("/api/quote/:symbol", async (req, res) => {
  try {
    const quote = await safeGetQuote(req.params.symbol);
    res.json({
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || quote.symbol,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      open: quote.regularMarketOpen,
      prevClose: quote.regularMarketPreviousClose,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      isDown: quote.regularMarketChange < 0,
    });
  } catch (error) {
    console.error("Quote error:", error.message);
    res.status(500).json({ error: "Failed to fetch quote for " + req.params.symbol });
  }
});

// Get quotes for multiple symbols (comma-separated query param)
app.get("/api/quotes", async (req, res) => {
  try {
    const symbols = req.query.symbols?.split(",") || [];
    if (symbols.length === 0) {
      return res.status(400).json({ error: "No symbols provided" });
    }

    const results = await Promise.allSettled(
      symbols.map((s) => safeGetQuote(s.trim()))
    );

    const quotes = results
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => {
        const q = r.value;
        return {
          symbol: q.symbol,
          name: q.shortName || q.longName || q.symbol,
          price: q.regularMarketPrice,
          change: q.regularMarketChange,
          changePercent: q.regularMarketChangePercent,
          high: q.regularMarketDayHigh,
          low: q.regularMarketDayLow,
          prevClose: q.regularMarketPreviousClose,
          volume: q.regularMarketVolume,
          isDown: q.regularMarketChange < 0,
        };
      });

    res.json(quotes);
  } catch (error) {
    console.error("Quotes error:", error.message);
    res.status(500).json({ error: "Failed to fetch quotes" });
  }
});

// Get NIFTY 50 and SENSEX index data
app.get("/api/indices", async (req, res) => {
  try {
    const [nifty, sensex] = await Promise.allSettled([
      safeGetQuote("^NSEI"),
      safeGetQuote("^BSESN"),
    ]);

    const format = (result, fallbackName) => {
      if (result.status === "fulfilled" && result.value) {
        const q = result.value;
        return {
          name: q.shortName || fallbackName,
          price: q.regularMarketPrice,
          change: q.regularMarketChange,
          changePercent: q.regularMarketChangePercent,
          isDown: q.regularMarketChange < 0,
        };
      }
      return { name: fallbackName, price: 0, change: 0, changePercent: 0, isDown: false };
    };

    res.json({
      nifty: format(nifty, "NIFTY 50"),
      sensex: format(sensex, "SENSEX"),
    });
  } catch (error) {
    console.error("Indices error:", error.message);
    res.status(500).json({ error: "Failed to fetch indices" });
  }
});

// Search for stocks by name or symbol
app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: "Search query required" });
    }

    const results = await yahooFinance.search(query);
    const stocks = (results.quotes || [])
      .filter((q) => q.quoteType === "EQUITY")
      .slice(0, 10)
      .map((q) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange,
      }));

    res.json(stocks);
  } catch (error) {
    console.error("Search error:", error.message);
    res.status(500).json({ error: "Search failed" });
  }
});

// ─── Auth helper: extract userId from JWT cookie ───────────────────────

const jwt = require("jsonwebtoken");

const getUserId = (req) => {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    return decoded.id;
  } catch {
    return null;
  }
};

// ─── Portfolio Data Routes (Auth Protected) ─────────────────────────────

// GET holdings for current user, enriched with live prices
app.get("/allHoldings", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  try {
    const holdings = await HoldingsModel.find({ userId });

    if (holdings.length === 0) {
      return res.json([]);
    }

    // Fetch live prices for all held stocks
    const symbols = holdings.map((h) => h.symbol);
    const liveResults = await Promise.allSettled(
      symbols.map((s) => safeGetQuote(s))
    );

    const enriched = holdings.map((h, i) => {
      const live = liveResults[i];
      let livePrice = h.avg; // fallback to avg if API fails
      let change = 0;
      let changePercent = 0;

      if (live.status === "fulfilled" && live.value) {
        livePrice = live.value.regularMarketPrice || h.avg;
        change = live.value.regularMarketChange || 0;
        changePercent = live.value.regularMarketChangePercent || 0;
      }

      const curValue = livePrice * h.qty;
      const investment = h.avg * h.qty;
      const pnl = curValue - investment;
      const netPercent = investment > 0 ? (pnl / investment) * 100 : 0;

      return {
        _id: h._id,
        symbol: h.symbol,
        name: h.name,
        qty: h.qty,
        avg: h.avg,
        price: livePrice,
        net: `${netPercent >= 0 ? "+" : ""}${netPercent.toFixed(2)}%`,
        day: `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`,
        isLoss: change < 0,
        curValue,
        pnl,
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error("Holdings error:", error.message);
    res.status(500).json({ error: "Failed to fetch holdings" });
  }
});

// GET positions for current user
app.get("/allPositions", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  try {
    const positions = await PositionsModel.find({ userId });

    if (positions.length === 0) {
      return res.json([]);
    }

    const symbols = positions.map((p) => p.symbol);
    const liveResults = await Promise.allSettled(
      symbols.map((s) => safeGetQuote(s))
    );

    const enriched = positions.map((p, i) => {
      const live = liveResults[i];
      let livePrice = p.avg;
      let changePercent = 0;

      if (live.status === "fulfilled" && live.value) {
        livePrice = live.value.regularMarketPrice || p.avg;
        changePercent = live.value.regularMarketChangePercent || 0;
      }

      const curValue = livePrice * p.qty;
      const investment = p.avg * p.qty;
      const pnl = curValue - investment;

      return {
        _id: p._id,
        product: p.product,
        symbol: p.symbol,
        name: p.name,
        qty: p.qty,
        avg: p.avg,
        price: livePrice,
        day: `${changePercent >= 0 ? "+" : ""}${changePercent.toFixed(2)}%`,
        isLoss: pnl < 0,
        pnl,
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error("Positions error:", error.message);
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

// GET orders for current user
app.get("/allOrders", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  try {
    const orders = await OrdersModel.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// POST buy or sell a stock (validated by Joi middleware)
app.post("/newOrder", validate(orderSchema), async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Not authenticated" });

  // req.body is already validated & sanitized by Joi
  const { symbol, name, qty, price, mode } = req.body;

  const quantity = Number(qty);
  const orderPrice = Number(price);

  try {
    // Fetch real stock name if not provided
    let stockName = name || symbol;
    if (!name) {
      try {
        const quote = await yahooFinance.quote(symbol);
        stockName = quote.shortName || quote.longName || symbol;
      } catch { /* use symbol as fallback */ }
    }

    // Save the order
    const newOrder = new OrdersModel({
      userId,
      symbol,
      name: stockName,
      qty: quantity,
      price: orderPrice,
      mode,
      status: "COMPLETE",
    });
    await newOrder.save();

    if (mode === "BUY") {
      // Upsert holding: if exists, update qty and weighted avg
      const existing = await HoldingsModel.findOne({ userId, symbol });

      if (existing) {
        const totalQty = existing.qty + quantity;
        const newAvg =
          (existing.avg * existing.qty + orderPrice * quantity) / totalQty;

        existing.qty = totalQty;
        existing.avg = newAvg;
        await existing.save();
      } else {
        await HoldingsModel.create({
          userId,
          symbol,
          name: stockName,
          qty: quantity,
          avg: orderPrice,
        });
      }

      res.json({
        success: true,
        message: `Bought ${quantity} shares of ${stockName} at ₹${orderPrice}`,
      });
    } else if (mode === "SELL") {
      const existing = await HoldingsModel.findOne({ userId, symbol });

      if (!existing || existing.qty < quantity) {
        return res.status(400).json({
          error: `Insufficient holdings. You have ${existing ? existing.qty : 0} shares of ${symbol}`,
        });
      }

      existing.qty -= quantity;

      if (existing.qty === 0) {
        await HoldingsModel.deleteOne({ _id: existing._id });
      } else {
        await existing.save();
      }

      res.json({
        success: true,
        message: `Sold ${quantity} shares of ${stockName} at ₹${orderPrice}`,
      });
    } else {
      res.status(400).json({ error: "Invalid mode. Use BUY or SELL." });
    }
  } catch (error) {
    console.error("Order error:", error.message);
    res.status(500).json({ error: "Order failed" });
  }
});

// ─── Socket.io Real-Time Market Data Broadcasting ──────────────────────

// Default watchlist symbols to broadcast prices for
const BROADCAST_SYMBOLS = [
  "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS",
  "WIPRO.NS", "ITC.NS", "BHARTIARTL.NS", "SBIN.NS", "LT.NS",
];

// Fetch and broadcast market data to all connected clients
const broadcastMarketData = async () => {
  try {
    // Fetch indices
    const [niftyResult, sensexResult] = await Promise.allSettled([
      safeGetQuote("^NSEI"),
      safeGetQuote("^BSESN"),
    ]);

    const formatIndex = (result, fallbackName) => {
      if (result.status === "fulfilled" && result.value) {
        const q = result.value;
        return {
          name: q.shortName || fallbackName,
          price: q.regularMarketPrice,
          change: q.regularMarketChange,
          changePercent: q.regularMarketChangePercent,
          isDown: q.regularMarketChange < 0,
        };
      }
      return { name: fallbackName, price: 0, change: 0, changePercent: 0, isDown: false };
    };

    io.emit("indicesUpdate", {
      nifty: formatIndex(niftyResult, "NIFTY 50"),
      sensex: formatIndex(sensexResult, "SENSEX"),
    });

    // Fetch watchlist stock prices
    const quoteResults = await Promise.allSettled(
      BROADCAST_SYMBOLS.map((s) => safeGetQuote(s))
    );

    const stockPrices = quoteResults
      .filter((r) => r.status === "fulfilled" && r.value)
      .map((r) => {
        const q = r.value;
        return {
          symbol: q.symbol,
          name: q.shortName || q.longName || q.symbol,
          price: q.regularMarketPrice,
          change: q.regularMarketChange,
          changePercent: q.regularMarketChangePercent,
          high: q.regularMarketDayHigh,
          low: q.regularMarketDayLow,
          prevClose: q.regularMarketPreviousClose,
          volume: q.regularMarketVolume,
          isDown: q.regularMarketChange < 0,
        };
      });

    io.emit("stocksUpdate", stockPrices);

    console.log(`[Socket.io] Broadcasted market data to ${io.engine.clientsCount} client(s)`);
  } catch (error) {
    console.error("[Socket.io] Broadcast error:", error.message);
  }
};

io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Send initial data immediately on connection
  broadcastMarketData();

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Broadcast market data every 15 seconds
setInterval(broadcastMarketData, 15000);

// ─── Server Startup ─────────────────────────────────────────────────────

mongoose
  .connect(uri)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("DB connected!");
      console.log("Socket.io ready for real-time connections");
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err);
    // Start server even without DB for stock API to work
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without DB)`);
      console.log("Socket.io ready for real-time connections");
    });
  });

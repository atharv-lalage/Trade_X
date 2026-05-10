import axios from "axios";

const API_BASE = "http://localhost:3002";

// Fetch quote for a single stock
export const getQuote = (symbol) =>
  axios.get(`${API_BASE}/api/quote/${symbol}`).then((res) => res.data);

// Fetch quotes for multiple symbols
export const getQuotes = (symbols) =>
  axios
    .get(`${API_BASE}/api/quotes?symbols=${symbols.join(",")}`)
    .then((res) => res.data);

// Fetch NIFTY 50 and SENSEX index data
export const getIndices = () =>
  axios.get(`${API_BASE}/api/indices`).then((res) => res.data);

// Search for stocks
export const searchStocks = (query) =>
  axios.get(`${API_BASE}/api/search?q=${query}`).then((res) => res.data);

// Default watchlist symbols (Indian NSE stocks)
export const DEFAULT_WATCHLIST = [
  "RELIANCE.NS",
  "TCS.NS",
  "INFY.NS",
  "HDFCBANK.NS",
  "ICICIBANK.NS",
  "WIPRO.NS",
  "ITC.NS",
  "BHARTIARTL.NS",
  "SBIN.NS",
  "LT.NS",
];

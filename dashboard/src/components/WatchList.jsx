import React, { useState, useEffect, useContext, useCallback } from "react";
import GeneralContext from "./GeneralContext";
import { Tooltip, Grow } from "@mui/material";
import {
  BarChartOutlined,
  KeyboardArrowDown,
  KeyboardArrowUp,
  MoreHoriz,
} from "@mui/icons-material";
import { getQuotes, searchStocks, DEFAULT_WATCHLIST } from "../services/stockApi";
import { DoughnutChart } from "./DoughnutChart";

const WatchList = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [watchlistSymbols, setWatchlistSymbols] = useState(() => {
    const saved = localStorage.getItem("tradex_watchlist");
    return saved ? JSON.parse(saved) : DEFAULT_WATCHLIST;
  });

  // Fetch stock data for watchlist
  const fetchWatchlistData = useCallback(async () => {
    if (watchlistSymbols.length === 0) {
      setStocks([]);
      setLoading(false);
      return;
    }
    try {
      const data = await getQuotes(watchlistSymbols);
      setStocks(data);
    } catch (error) {
      console.error("Failed to fetch watchlist:", error);
    } finally {
      setLoading(false);
    }
  }, [watchlistSymbols]);

  useEffect(() => {
    fetchWatchlistData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchWatchlistData, 30000);
    return () => clearInterval(interval);
  }, [fetchWatchlistData]);

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem("tradex_watchlist", JSON.stringify(watchlistSymbols));
  }, [watchlistSymbols]);

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    try {
      const results = await searchStocks(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  // Add stock to watchlist
  const addToWatchlist = (symbol) => {
    if (!watchlistSymbols.includes(symbol)) {
      setWatchlistSymbols([...watchlistSymbols, symbol]);
    }
    setSearchQuery("");
    setShowSearchResults(false);
    setSearchResults([]);
  };

  // Remove stock from watchlist
  const removeFromWatchlist = (symbol) => {
    setWatchlistSymbols(watchlistSymbols.filter((s) => s !== symbol));
    setStocks(stocks.filter((s) => s.symbol !== symbol));
  };

  // Chart data
  const labels = stocks.map((s) => s.name || s.symbol);
  const data = {
    labels,
    datasets: [
      {
        label: "Price",
        data: stocks.map((s) => s.price),
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(153, 102, 255, 0.5)",
          "rgba(255, 159, 64, 0.5)",
          "rgba(46, 204, 113, 0.5)",
          "rgba(231, 76, 60, 0.5)",
          "rgba(52, 152, 219, 0.5)",
          "rgba(155, 89, 182, 0.5)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(46, 204, 113, 1)",
          "rgba(231, 76, 60, 1)",
          "rgba(52, 152, 219, 1)",
          "rgba(155, 89, 182, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="watchlist-container">
      <div className="search-container" style={{ position: "relative" }}>
        <input
          type="text"
          name="search"
          id="search"
          placeholder="Search eg: Reliance, TCS, Infosys..."
          className="search"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
          onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
        />
        <span className="counts">{stocks.length} / 50</span>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "4px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 1000,
              maxHeight: "250px",
              overflowY: "auto",
            }}
          >
            {searchResults.map((result, i) => (
              <div
                key={i}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  borderBottom: "1px solid #f0f0f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "background 0.15s",
                }}
                onMouseDown={() => addToWatchlist(result.symbol)}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f8ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <div>
                  <strong style={{ fontSize: "0.85rem" }}>{result.symbol}</strong>
                  <p style={{ margin: 0, fontSize: "0.75rem", color: "#888" }}>
                    {result.name} • {result.exchange}
                  </p>
                </div>
                <span style={{ color: "#4184f3", fontSize: "0.8rem" }}>+ Add</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
          Loading market data...
        </div>
      ) : (
        <ul className="list">
          {stocks.map((stock, index) => (
            <WatchListItem
              stock={stock}
              key={stock.symbol || index}
              onRemove={() => removeFromWatchlist(stock.symbol)}
            />
          ))}
          {stocks.length === 0 && (
            <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
              No stocks in watchlist. Search to add stocks.
            </div>
          )}
        </ul>
      )}

      {stocks.length > 0 && <DoughnutChart data={data} />}
    </div>
  );
};

export default WatchList;

const WatchListItem = ({ stock, onRemove }) => {
  const [showWatchlistActions, setShowWatchlistActions] = useState(false);

  const handleMouseEnter = () => {
    setShowWatchlistActions(true);
  };

  const handleMouseLeave = () => {
    setShowWatchlistActions(false);
  };

  const formatPrice = (num) => {
    if (!num && num !== 0) return "—";
    return num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  };

  const formatPercent = (num) => {
    if (!num && num !== 0) return "";
    const sign = num >= 0 ? "+" : "";
    return `${sign}${num.toFixed(2)}%`;
  };

  return (
    <li onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <div className="item">
        <p className={stock.isDown ? "down" : "up"}>
          {stock.name || stock.symbol}
        </p>
        <div className="itemInfo">
          <span className="percent">{formatPercent(stock.changePercent)}</span>
          {stock.isDown ? (
            <KeyboardArrowDown className="down" />
          ) : (
            <KeyboardArrowUp className="up" />
          )}
          <span className="price">{formatPrice(stock.price)}</span>
        </div>
      </div>
      {showWatchlistActions && (
        <WatchListActions uid={stock.symbol} onRemove={onRemove} />
      )}
    </li>
  );
};

const WatchListActions = ({ uid, onRemove }) => {
  const generalContext = useContext(GeneralContext);

  const handleBuyClick = () => {
    generalContext.openBuyWindow(uid);
  };

  return (
    <span className="actions">
      <span>
        <Tooltip
          title="Buy (B)"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={handleBuyClick}
        >
          <button className="buy">Buy</button>
        </Tooltip>
        <Tooltip
          title="Sell (S)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="sell">Sell</button>
        </Tooltip>
        <Tooltip
          title="Analytics (A)"
          placement="top"
          arrow
          TransitionComponent={Grow}
        >
          <button className="action">
            <BarChartOutlined className="icon" />
          </button>
        </Tooltip>
        <Tooltip
          title="Remove"
          placement="top"
          arrow
          TransitionComponent={Grow}
          onClick={onRemove}
        >
          <button className="action">
            <MoreHoriz className="icon" />
          </button>
        </Tooltip>
      </span>
    </span>
  );
};

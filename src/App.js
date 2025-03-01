import React, { useEffect, useState } from "react";
import { getAccessToken } from "./api/spotifyAuth";
import { redirectToSpotifyAuth } from "./api/auth";
import { refreshAccessToken } from "./api/refreshToken";
import { fetchSpotifyData } from "./api/spotify";
import SpotifyChart from "./components/SpotifyChart";
import "./App.css"; // Import the CSS file
import SpotifyPlayer from "./api/spotifyplayer";

const App = () => {
  const [token, setToken] = useState(null);
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState("all");
  const [type, setType] = useState("tracks"); // "tracks" or "artists"
  const [timeRange, setTimeRange] = useState("long_term"); // "short_term", "medium_term", "long_term"
  const [deviceId, setDeviceId] = useState(localStorage.getItem("spotify_device_id"));

  useEffect(() => {
    console.log("📌 Device ID in App.js:", deviceId);
    const _token = getAccessToken();
    window.location.hash = ""; // Clear token from URL for security
    if (_token) {
      setToken(_token);
      localStorage.setItem("spotify_token", _token);
    } else {
      const savedToken = localStorage.getItem("spotify_token");
      if (savedToken) setToken(savedToken);
    }
  }, []);

  const handleLogin = () => {
    redirectToSpotifyAuth(); // Redirects user to Spotify login
  };

  const handleRefreshToken = async () => {
    await refreshAccessToken();
    const newToken = getAccessToken();
    setToken(newToken);
  };

  useEffect(() => {
    if (token) {
      fetchSpotifyData(token, type, timeRange).then(setData);
    }
  }, [token, type, timeRange]);

  const filteredData = filter === "all" ? data : data.filter(d => d.artist === filter);

  useEffect(() => {
    console.log("📌 Device ID in App.js:", deviceId);
  }, [deviceId]);

  return (
    <div className="App">
      {/* HEADER SECTION */}
      <div className="App-header">
        <h1>My Spotify Listening Trends</h1>
      </div>

      {/* TOGGLE BUTTONS FOR TYPE */}
      <div className="toggle-buttons">
        <button onClick={() => setType("tracks")} className={type === "tracks" ? "active" : ""}>Tracks</button>
        <button onClick={() => setType("artists")} className={type === "artists" ? "active" : ""}>Artists</button>
      

      {/* TOGGLE BUTTONS FOR TIME RANGE */}
      
        <button onClick={() => setTimeRange("short_term")} className={timeRange === "short_term" ? "active" : ""}>Last 4 Weeks</button>
        <button onClick={() => setTimeRange("medium_term")} className={timeRange === "medium_term" ? "active" : ""}>Last 6 Months</button>
        <button onClick={() => setTimeRange("long_term")} className={timeRange === "long_term" ? "active" : ""}>All Time</button>
      </div>

      {/* SEARCH INPUT */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search artist..."
          onChange={(e) => setFilter(e.target.value.toLowerCase())}
        />
      </div>

      {/* AUTH BUTTON / CHART DISPLAY */}
      {!token ? (
        <button onClick={handleLogin}>
          Login to Spotify
        </button>
      ) : data.length > 0 ? (
        <>
          <SpotifyChart data={filteredData} type={type} token={token} deviceId={deviceId} />
          <SpotifyPlayer token={token} setDeviceId={setDeviceId} />
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default App;

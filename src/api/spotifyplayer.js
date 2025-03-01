import React, { useEffect, useState } from "react";

const SpotifyPlayer = ({ token, setDeviceId }) => {
  const [player, setPlayer] = useState(null);

  useEffect(() => {
    if (!token) {
      console.log("❌ No token available, skipping Web Player setup.");
      return;
    }

    console.log("🔄 Initializing Spotify Web Playback SDK...");

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log("🎵 Spotify SDK Loaded.");

      const player = new window.Spotify.Player({
        name: "My Spotify Web Player",
        getOAuthToken: cb => { cb(token); },
        volume: 0.5
      });

      player.addListener("ready", ({ device_id }) => {
        console.log("✅ Web Player Ready - Device ID:", device_id); // Debugging
        setDeviceId(device_id); // Save in App.js
        localStorage.setItem("spotify_device_id", device_id); // Store device ID in localStorage
      });

      player.addListener("not_ready", ({ device_id }) => {
        console.log("⚠️ Web Player Not Ready - Device ID:", device_id);
      });

      player.connect().then(success => {
        if (success) {
          console.log("✅ Successfully connected to Spotify Player!");
        } else {
          console.error("❌ Failed to connect Spotify Player.");
        }
      });

      setPlayer(player);
    };

    return () => {
      if (player) player.disconnect();
    };
  }, [token, setDeviceId]);

  return (
      console.log('Spotify Web Player {player ? "Ready 🎵" : "Loading..."}')
  );
};

export default SpotifyPlayer;

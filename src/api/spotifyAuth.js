const CLIENT_ID = "2892203726614a98b52e8fd501fb5387";
const REDIRECT_URI = "https://jjwhite224.github.io/SpotBubbles";
const SCOPES = ["user-top-read",  "streaming", // Required for Web Playback SDK
    "user-read-email",
    "user-read-private",
    "user-modify-playback-state",
    "user-read-playback-state"];
const TOKEN_EXPIRY_TIME = 3600 * 1000; // 1 hour in milliseconds

export const getAuthUrl = () => {
    const authEndpoint = "https://accounts.spotify.com/authorize";
    return `${authEndpoint}?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
     REDIRECT_URI
    )}&scope=${SCOPES.join("%20")}&show_dialog=true`;
    // Log the URL being generated
  };
// Extracts token from URL hash
export const getAccessTokenFromUrl = () => {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  return params.get("access_token");
};

// Store token when received
export const storeAccessToken = () => {
  const token = getAccessTokenFromUrl();
  if (token) {
    localStorage.setItem("spotify_access_token", token);
    localStorage.setItem("spotify_token_timestamp", Date.now());
    window.history.pushState({}, null, "/"); // Remove token from URL
  }
};

// Get token and reauthenticate if expired
export const getAccessToken = () => {
  const storedToken = localStorage.getItem("spotify_access_token");
  const tokenTimestamp = localStorage.getItem("spotify_token_timestamp");

  if (!storedToken || !tokenTimestamp) {
    window.location.href = getAuthUrl(); // Redirect to login
    return null;
  }

  const expiresIn = TOKEN_EXPIRY_TIME - (Date.now() - Number(tokenTimestamp));
  if (expiresIn <= 0) {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_token_timestamp");
    window.location.href = getAuthUrl(); // Force re-authentication
    return null;
  }

  return storedToken;
};

// Call on page load to check token status
storeAccessToken();


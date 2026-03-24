const CLIENT_ID = "2892203726614a98b52e8fd501fb5387";
const REDIRECT_URI = "https://jjwhite224.github.io/SpotBubbles/";
const SCOPES = [
  "user-top-read",
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state"
];
const TOKEN_EXPIRY_TIME = 3600 * 1000;

const generateCodeVerifier = () => {
  const array = new Uint8Array(64);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
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

const generateCodeChallenge = async (codeVerifier) => {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const generateState = () => {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
};

export const getAuthUrl = async () => {
  const authEndpoint = "https://accounts.spotify.com/authorize";
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateState();

  localStorage.setItem("spotify_code_verifier", codeVerifier);
  localStorage.setItem("spotify_auth_state", state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(" "),
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    state,
    show_dialog: "true"
  });

  return `${authEndpoint}?${params.toString()}`;
};

export const redirectToSpotifyLogin = async () => {
  const authUrl = await getAuthUrl();
  window.location.href = authUrl;
};

export const exchangeCodeForToken = async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const returnedState = params.get("state");

  if (!code) return null;

  const savedState = localStorage.getItem("spotify_auth_state");
  const codeVerifier = localStorage.getItem("spotify_code_verifier");

  if (!returnedState || returnedState !== savedState) {
    throw new Error("State mismatch. Authentication may be invalid.");
  }

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Token exchange failed:", data);
    throw new Error(data.error_description || "Failed to exchange code for token.");
  }

  localStorage.setItem("spotify_access_token", data.access_token);
  localStorage.setItem("spotify_token_timestamp", Date.now().toString());

  if (data.refresh_token) {
    localStorage.setItem("spotify_refresh_token", data.refresh_token);
  }

  window.history.replaceState({}, document.title, window.location.pathname);
  return data.access_token;
};

export const getAccessToken = () => {
  const token = localStorage.getItem("spotify_access_token");
  const timestamp = localStorage.getItem("spotify_token_timestamp");

  if (!token || !timestamp) return null;

  const expiresIn = TOKEN_EXPIRY_TIME - (Date.now() - Number(timestamp));
  if (expiresIn <= 0) {
    localStorage.removeItem("spotify_access_token");
    localStorage.removeItem("spotify_token_timestamp");
    return null;
  }

  return token;
};

export const logoutSpotify = () => {
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_token_timestamp");
  localStorage.removeItem("spotify_refresh_token");
  localStorage.removeItem("spotify_code_verifier");
  localStorage.removeItem("spotify_auth_state");
};
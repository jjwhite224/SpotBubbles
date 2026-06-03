const CLIENT_ID = process.env.REACT_APP_CLIENT_ID || "4538b1c9bbc84a708b45046da5612f9c";
const SCOPES = ["user-read-recently-played"]; // Add required scopes

const getClientRedirectUri = () => {
  if (typeof window === 'undefined') return process.env.REACT_APP_REDIRECT_URI || "https://jjwhite224.github.io/SpotBubbles/#";
  const origin = window.location.origin;
  const path = window.location.pathname || '/';
  const cleanPath = path.split('?')[0].split('#')[0].replace(/\/\/$/, '');

  if (origin.includes("localhost")) {
    return process.env.REACT_APP_REDIRECT_URI || `${origin}${cleanPath}`;
  }

  if (origin.includes("jjwhite224.github.io")) {
    const hashPath = cleanPath.endsWith("/") ? `${cleanPath}#` : `${cleanPath}/#`;
    return `${origin}${hashPath}`;
  }

  return `${origin}${cleanPath}`;
};

const REDIRECT_URI = getClientRedirectUri();

const encodeStateValue = (value) => {
  const json = JSON.stringify(value);
  const base64 = btoa(json);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const decodeStateValue = (value) => {
  try {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + (4 - (normalized.length % 4)) % 4, '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

// Generates a random code verifier (for PKCE)
const generateCodeVerifier = () => {
  let array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const generateState = () => {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
};

// Hashes the code verifier to generate a code challenge
const generateCodeChallenge = async (codeVerifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

// Redirects user to Spotify for authentication
export const redirectToSpotifyAuth = async () => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const rawState = generateState();
  const state = encodeStateValue({ state: rawState, codeVerifier });

  localStorage.setItem("spotify_code_verifier", codeVerifier); // Save code verifier
  localStorage.setItem("spotify_auth_state", rawState);
  localStorage.setItem("spotify_redirect_uri", REDIRECT_URI);

  const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${SCOPES.join("%20")}&code_challenge_method=S256&code_challenge=${codeChallenge}` +
    `&state=${encodeURIComponent(state)}`;

  window.location.href = authUrl; // Redirect to Spotify login
};




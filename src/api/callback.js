const BACKEND_URL = (typeof window !== 'undefined' && window.location && window.location.hostname && window.location.hostname.includes('localhost'))
  ? 'http://localhost:3000'
  : 'https://spotbubbles.onrender.com'; // Your backend server URL

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

const parseParams = (paramString) => {
  const normalized = paramString.startsWith("?") || paramString.startsWith("#")
    ? paramString.slice(1)
    : paramString;
  return new URLSearchParams(normalized);
};

const getAuthCodeFromUrl = () => {
  let code = parseParams(window.location.search).get("code");
  if (code) return code;
  code = parseParams(window.location.hash).get("code");
  return code;
};

const getStateFromUrl = () => {
  let state = parseParams(window.location.search).get("state");
  if (state) return state;
  state = parseParams(window.location.hash).get("state");
  return state;
};

const extractCodeVerifier = () => {
  const stateValue = getStateFromUrl();
  if (!stateValue) return null;
  const decoded = decodeStateValue(stateValue);
  return decoded?.codeVerifier || null;
};

const exchangeCodeForToken = async () => {
  const authCode = getAuthCodeFromUrl();
  let codeVerifier = localStorage.getItem("spotify_code_verifier");
  const stateCodeVerifier = extractCodeVerifier();

  if (!codeVerifier && stateCodeVerifier) {
    console.log('[callback] Recovered code verifier from state.');
    codeVerifier = stateCodeVerifier;
  }

  console.log('[callback] authCode=', authCode, 'codeVerifierExists=', !!codeVerifier, 'stateCodeVerifierExists=', !!stateCodeVerifier);

  if (!authCode) return;
  if (!codeVerifier) {
    console.warn('[callback] Missing code verifier. Please start login from the app login button.');
    return;
  }

  try {
    const response = await fetch(`${BACKEND_URL}/exchange-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        authCode,
        codeVerifier,
        redirectUri: localStorage.getItem("spotify_redirect_uri") || `${window.location.origin}${window.location.pathname}${window.location.hash}`,
      }),
    });

    const data = await response.json();
    console.log('[callback] exchange response:', data);
    if (data.access_token) {
      localStorage.setItem("spotify_access_token", data.access_token);
      localStorage.setItem("spotify_refresh_token", data.refresh_token);
      localStorage.setItem("spotify_token_timestamp", Date.now());
      const baseUrl = `${window.location.origin}${process.env.PUBLIC_URL || window.location.pathname}`;
      window.location.href = baseUrl;
    }
  } catch (error) {
    console.error("Error exchanging code for token:", error);
  }
};

exchangeCodeForToken();

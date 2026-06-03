const TOKEN_EXPIRY_TIME = 3600 * 1000;

const getClientRedirectUri = () => {
  if (typeof window === 'undefined') return undefined;
  const origin = window.location.origin;
  const path = window.location.pathname || '/';
  // Ensure pathname ends with no extra query/hash
  const cleanPath = path.split('?')[0].split('#')[0];
  return `${origin}${cleanPath}`;
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

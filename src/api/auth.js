const CLIENT_ID = "2892203726614a98b52e8fd501fb5387"; // Your Client ID
const REDIRECT_URI = "https://jjwhite224.github.io/SpotBubbles/"; // Update this to match your app's URL
const SCOPES = ["user-read-recently-played"]; // Add required scopes

// Generates a random code verifier (for PKCE)
const generateCodeVerifier = () => {
  let array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
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

  localStorage.setItem("spotify_code_verifier", codeVerifier); // Save code verifier

  const authUrl = `https://accounts.spotify.com/authorize?` +
    `client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${SCOPES.join("%20")}&code_challenge_method=S256&code_challenge=${codeChallenge}`;

  window.location.href = authUrl; // Redirect to Spotify login
};

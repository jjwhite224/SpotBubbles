const BACKEND_URL = "https://spotbubbles.onrender.com"; // Your backend server URL

const getAuthCodeFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
};

const exchangeCodeForToken = async () => {
  const authCode = getAuthCodeFromUrl();
  const codeVerifier = localStorage.getItem("spotify_code_verifier");

  if (!authCode || !codeVerifier) return;

  try {
    const response = await fetch(`${BACKEND_URL}/exchange-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authCode, codeVerifier }),
    });

    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem("spotify_access_token", data.access_token);
      localStorage.setItem("spotify_refresh_token", data.refresh_token);
      localStorage.setItem("spotify_token_timestamp", Date.now());
      window.location.href = "/"; // Redirect to home page
    }
  } catch (error) {
    console.error("Error exchanging code for token:", error);
  }
};

exchangeCodeForToken();

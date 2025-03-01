const BACKEND_URL = "http://localhost:3001";

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("spotify_refresh_token");
  if (!refreshToken) return;

  try {
    const response = await fetch(`${BACKEND_URL}/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await response.json();
    if (data.access_token) {
      localStorage.setItem("spotify_access_token", data.access_token);
      localStorage.setItem("spotify_token_timestamp", Date.now());
    }
  } catch (error) {
    console.error("Error refreshing access token:", error);
  }
};

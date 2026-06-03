import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000; // Default to 3000 if PORT is not set
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI || "https://jjwhite224.github.io/SpotBubbles/#"; // Ensure this matches frontend or set in .env for local testing
const ALLOWED_REDIRECT_URIS = [
  REDIRECT_URI,
  "https://spotbubbles.onrender.com",
  "https://jjwhite224.github.io/SpotBubbles/#",
  "https://jjwhite224.github.io/SpotBubbles",
].filter(Boolean);

const getRedirectUri = (uri) => {
  if (uri && ALLOWED_REDIRECT_URIS.includes(uri)) return uri;
  return REDIRECT_URI;
};

console.log(`[server] default REDIRECT_URI=${REDIRECT_URI}`);
console.log(`[server] allowed redirect URIs=${ALLOWED_REDIRECT_URIS.join(', ')}`);

app.post("/exchange-token", async (req, res) => {
  const { authCode, codeVerifier, redirectUri } = req.body;
  console.log('[/exchange-token] Received body:', req.body);

  const tokenRedirectUri = getRedirectUri(redirectUri);
  console.log(`[server] using redirect_uri=${tokenRedirectUri}`);

  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("client_secret", CLIENT_SECRET);
  params.append("grant_type", "authorization_code");
  params.append("code", authCode);
  params.append("redirect_uri", tokenRedirectUri);
  params.append("code_verifier", codeVerifier);

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const data = await response.json();
    console.log('[/exchange-token] Spotify response:', data);
    res.json(data);
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/refresh-token", async (req, res) => {
    const { refreshToken } = req.body;
  console.log('[/refresh-token] Received body:', req.body);
  
    const params = new URLSearchParams();
    params.append("client_id", CLIENT_ID);
    params.append("client_secret", CLIENT_SECRET);
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refreshToken);
  
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params,
      });
  
      const data = await response.json();
      console.log('[/refresh-token] Spotify response:', data);
      res.json(data);
    } catch (error) {
      console.error("Error refreshing token:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  



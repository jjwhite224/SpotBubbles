import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://github.com/jjwhite224/SpotBubbles.git"; // Ensure this matches frontend

app.post("/exchange-token", async (req, res) => {
  const { authCode, codeVerifier } = req.body;

  const params = new URLSearchParams();
  params.append("client_id", CLIENT_ID);
  params.append("grant_type", "authorization_code");
  params.append("code", authCode);
  params.append("redirect_uri", REDIRECT_URI);
  params.append("code_verifier", codeVerifier);

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error exchanging code for token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/refresh-token", async (req, res) => {
    const { refreshToken } = req.body;
  
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
      res.json(data);
    } catch (error) {
      console.error("Error refreshing token:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  

app.listen(3001, () => console.log("Server running on http://localhost:3001"));

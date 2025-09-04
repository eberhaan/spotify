const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express(); // Zuerst app initialisieren

// CORS für alle Domains erlauben
app.use(cors());
app.use(express.json()); // Optional, falls JSON-Daten gesendet werden

// Spotify Credentials aus Environment Variables
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

let accessToken = null;

// Access Token holen
async function getAccessToken() {
  const response = await axios.post(
    "https://accounts.spotify.com/api/token",
    "grant_type=client_credentials",
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  accessToken = response.data.access_token;
}

// Suche Songs
app.get("/search", async (req, res) => {
  const q = req.query.q;
  if (!accessToken) await getAccessToken();

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        q
      )}&type=track&limit=10`,
      {
        headers: { Authorization: "Bearer " + accessToken },
      }
    );

    const results = response.data.tracks.items.map((track) => ({
      title: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      url: track.external_urls.spotify,
      preview: track.preview_url,
    }));

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));


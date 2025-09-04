// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

// === 1. CORS für LimeSurvey erlauben ===
// Ersetze die URL mit deiner LimeSurvey-Domain
app.use(cors({
    origin: [
        "https://umfrage.umit-tirol.at/index.php/845248?lang=de", // z.B. https://survey.uni.de
        "https://*.limesurvey.org"            // optional für alle LimeSurvey-Instanzen
    ],
    methods: ["GET"]
}));

// === Spotify API Credentials ===
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

let accessToken = null;

// === Access Token holen ===
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

// === Suche Songs Endpoint ===
app.get("/search", async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: "Kein Suchbegriff angegeben" });

  if (!accessToken) await getAccessToken();

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=10`,
      { headers: { Authorization: "Bearer " + accessToken } }
    );

    const results = response.data.tracks.items.map(track => ({
      title: track.name,
      artist: track.artists.map(a => a.name).join(", "),
      url: track.external_urls.spotify,
      preview: track.preview_url,
      id: track.id
    }));

    res.json(results);

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

// === Server starten ===
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));


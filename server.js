// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");

// ==============================
// 1️⃣ App erstellen
// ==============================
const app = express();

// ==============================
// 2️⃣ CORS für LimeSurvey erlauben
// ==============================
app.use(cors({
    origin: [
        "https://umfrage.umit-tirol.at/index.php/845248?lang=de", // <- hier deine LimeSurvey-URL eintragen
    ],
    methods: ["GET"]
}));

// ==============================
// 3️⃣ Spotify API Credentials
// ==============================
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

let accessToken = null;

// ==============================
// 4️⃣ Access Token holen
// ==============================
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

// ==============================
// 5️⃣ Suche Songs
// ==============================
app.get("/search", async (req, res) => {
    let q = req.query.q || "";

    // 🔹 Query auf max. 250 Zeichen begrenzen
    if (q.length > 250) {
        console.warn("Query gekürzt auf 250 Zeichen:", q.substring(0, 250));
        q = q.substring(0, 250);
    }

    if (!accessToken) await getAccessToken();

    try {
        const response = await axios.get(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=track&limit=10`,
            {
                headers: { Authorization: "Bearer " + accessToken },
            }
        );

        const results = response.data.tracks.items.map((track) => ({
            title: track.name,
            artist: track.artists.map((a) => a.name).join(", "),
            url: track.external_urls.spotify,
            id: track.id,
            preview: track.preview_url,
        }));

        res.json(results);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: error.message });
    }
});

// ==============================
// 6️⃣ Server starten
// ==============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));

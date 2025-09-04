app.get("/search", async (req, res) => {
  let q = req.query.q || "";
  
  // Kürze Query auf maximal 250 Zeichen
  if (q.length > 250) q = q.substring(0, 250);
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

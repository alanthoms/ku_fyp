const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const TMDB_API_KEY = process.env.TMDB_API_KEY; // Your TMDB API Key
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"; // Image URL for posters

// Movie search endpoint
app.get("/search/:movie", async (req, res) => {
  const movieName = req.params.movie;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/search/movie?query=${movieName}&api_key=${TMDB_API_KEY}`
    );

    const movies = response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      poster: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null
    }));

    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: "Error fetching data" });
  }
});

// Movie recommendation endpoint
app.get("/recommend/:movieId", async (req, res) => {
  const movieId = req.params.movieId;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${TMDB_API_KEY}`
    );

    const recommendations = response.data.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      poster: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null
    }));

    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ error: "Error fetching recommendations" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));

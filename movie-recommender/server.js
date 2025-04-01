const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
//app.use(cors());
app.use(cors({
  origin: "http://localhost:3000", // Specify your frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"], // Ensure Authorization is allowed
}));
app.use(express.json());

const pool = require("./db"); // Import PostgreSQL connection/ allows us to query the database

//ROUTES//

//create a watchlist
//async function

/*
app.post("/watchlists", authenticateUser, async (req, res) => {
  try {
    console.log(req.body);//test to see posts
  } catch (error) {
    console.error(error.message);
  }
})
*/
const TMDB_API_KEY = process.env.TMDB_API_KEY; // Your TMDB API Key
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"; // Image URL for posters

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Use environment variable

// Middleware to verify user token
const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(403).json({ error: "Invalid token" });
  }
};


//ROUTES//

// ✅ User Registration
app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
      [username, email, hashedPassword]
    );
    res.json({ message: "User registered!", user: result.rows[0] });
  } catch (error) {
    console.error("❌ Registration Error:", error); // ✅ Log the actual error
    res.status(500).json({ error: "Registration failed" });
  }
});

// ✅ User Login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (user.rows.length === 0) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, user: { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email } });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// ✅ Add a new review
app.post("/api/reviews", authenticateUser, async (req, res) => {
  const { movieId, review, rating } = req.body;

  try {
    await pool.query(
      "INSERT INTO reviews (user_id, movie_id, review, rating) VALUES ($1, $2, $3, $4)",
      [req.userId, movieId, review, rating]
    );
    res.json({ message: "Review added!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add review" });
  }
});

// ✅ Get reviews for a movie
app.get("/api/reviews/:movieId", async (req, res) => {
  try {
    const reviews = await pool.query("SELECT * FROM reviews WHERE movie_id = $1", [req.params.movieId]);
    res.json(reviews.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

// ✅ Create a new watchlist
app.post("/api/watchlists", authenticateUser, async (req, res) => {
  const { name } = req.body;
  try {
    console.log('Creating watchlist for userId:', req.userId);  // Log the userId
    const result = await pool.query(
      "INSERT INTO watchlists (user_id, name) VALUES ($1, $2) RETURNING id, name",
      [req.userId, name]
    );
    res.json({ message: "Watchlist created!", watchlist: result.rows[0] });
  } catch (error) {
    console.error("❌ Error creating watchlist:", error.message); // Log the error message
    res.status(500).json({ error: "Failed to create watchlist" });
  }
});


// ✅ Get all watchlists of a user
app.get("/api/watchlists", authenticateUser, async (req, res) => {
  try {
    const watchlists = await pool.query("SELECT * FROM watchlists WHERE user_id = $1", [req.userId]);
    res.json(watchlists.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch watchlists" });
  }
});

// ✅ Add movie to a watchlist
app.post("/api/watchlists/:watchlistId/movies", authenticateUser, async (req, res) => {
  const { movieId } = req.body;
  try {
    await pool.query("INSERT INTO watchlist_movies (watchlist_id, movie_id) VALUES ($1, $2)", [
      req.params.watchlistId,
      movieId,
    ]);
    res.json({ message: "Movie added to watchlist!" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add movie" });
  }
});

// ✅ Get movies in a watchlist
app.get("/api/watchlists/:watchlistId/movies", authenticateUser, async (req, res) => {
  try {
    const movies = await pool.query("SELECT * FROM watchlist_movies WHERE watchlist_id = $1", [req.params.watchlistId]);
    res.json(movies.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch watchlist movies" });
  }
});


// ✅ Update an existing watchlist
app.put("/api/watchlists/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const result = await pool.query(
      "UPDATE watchlists SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
      [name, id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Watchlist not found or you don't have permission to update it" });
    }

    res.json({ message: "Watchlist updated successfully", watchlist: result.rows[0] });
  } catch (error) {
    console.error("❌ Error updating watchlist:", error.message);
    res.status(500).json({ error: "Failed to update watchlist" });
  }
});



//Delete
app.delete("/api/watchlists/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("DELETE FROM watchlists WHERE id = $1 AND user_id = $2 RETURNING *", [id, req.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Watchlist not found or you don't have permission to delete it" });
    }
    res.json({ message: "Watchlist deleted successfully", watchlist: result.rows[0] });
  } catch (error) {
    console.error("❌ Error deleting watchlist:", error.message);
    res.status(500).json({ error: "Failed to delete watchlist" });
  }
});


// ✅ Movie search endpoint
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

// ✅ Movie recommendation endpoint
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

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

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

//  User Registration
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
    console.error(" Registration Error:", error); // Log the actual error
    res.status(500).json({ error: error.message || "Registration failed" });
  }
});

//  User Login
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
//post cause adding, request and response, async to wait for the database to respond
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

// Get reviews for a movie
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


//  Get all watchlists of a user
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
    const movies = await pool.query(
      "SELECT id, watchlist_id, movie_id, ticked FROM watchlist_movies WHERE watchlist_id = $1",
      [req.params.watchlistId]
    );
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
    // Step 1: Delete all movies linked to this watchlist
    await pool.query("DELETE FROM watchlist_movies WHERE watchlist_id = $1", [id]);

    // Step 2: Now delete the watchlist itself
    const result = await pool.query(
      "DELETE FROM watchlists WHERE id = $1 AND user_id = $2 RETURNING *",
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Watchlist not found or you don't have permission to delete it" });
    }

    res.json({ message: "Watchlist deleted successfully", watchlist: result.rows[0] });
  } catch (error) {
    console.error("Error deleting watchlist:", error.message);
    res.status(500).json({ error: "Failed to delete watchlist" });
  }
});


//  Movie search endpoint
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

// ✅ Movie detail endpoint
app.get("/movie/:movieId", async (req, res) => {
  const { movieId } = req.params;
  try {
    const response = await axios.get(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}`
    );

    const movie = response.data;
    res.json({
      id: movie.id,
      title: movie.title,
      year: movie.release_date?.split("-")[0],
      runtime: movie.runtime,
      overview: movie.overview,
      poster: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
    });
  } catch (error) {
    console.error("❌ Error fetching movie details:", error.message);
    res.status(500).json({ error: "Error fetching movie details" });
  }
});

// ✅ Toggle tick for a movie
app.put("/api/watchlists/:watchlistId/movies/:movieId/tick", authenticateUser, async (req, res) => {
  const { watchlistId, movieId } = req.params;
  const { ticked } = req.body;
  try {
    await pool.query(
      "UPDATE watchlist_movies SET ticked = $1 WHERE watchlist_id = $2 AND movie_id = $3",
      [ticked, watchlistId, movieId]
    );
    res.json({ message: "Tick status updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update tick status" });
  }
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


// Helper function to get user's reviews
const getUserReviews = async (userId) => {
  const userReviews = await pool.query(
    "SELECT movie_id, review, rating FROM reviews WHERE user_id = $1",
    [userId]
  );
  return userReviews.rows;
};

//  Get all reviews for the logged-in user
app.get("/api/myreviews", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;

    const userReviews = await getUserReviews(userId); // reuse your helper function!

    res.json(userReviews); // send straight back
  } catch (error) {
    console.error("Error fetching user reviews:", error.message);
    res.status(500).json({ error: "Failed to fetch user reviews" });
  }
});



// Get 3 movie recommendations based on user's reviews
app.get("/api/recommendations", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Fetch all reviews by this user
    const userReviews = await getUserReviews(userId);

    // 2. Fetch movie name rating and review for each movie_id
    const detailedReviews = await Promise.all(
      userReviews.map(async (r) => {
        const movieDetails = await axios.get(`http://localhost:5000/movie/${r.movie_id}`);
        return {
          title: movieDetails.data.title,
          rating: r.rating,
          review: r.review,
        };
      })
    );

    // 3. Prepare text for OpenAI prompt
    const combinedReviews = detailedReviews.map(r =>
      `Movie: '${r.title}' (Rating: ${r.rating}/10) - Review: "${r.review}"`
    ).join("\n");

    // 4. Send to OpenAI
    const aiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant recommending exactly 3 movies based on a user's detailed reviews and ratings. Only return a JSON array of 3 TMDB movie IDs like [123, 456, 789]. No explanations, no text around it."
          },
          {
            role: "user",
            content: `Here are my past movie reviews and ratings:\n\n${combinedReviews}\n\nRecommend 3 movies.`
          }
        ],
        temperature: 0.7,
        max_tokens: 200,
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const recommendedIds = JSON.parse(aiResponse.data.choices[0].message.content);

    // 5. Fetch full movie details
    const detailedMovies = await Promise.all(
      recommendedIds.map(async (movieId) => {
        const movieDetails = await axios.get(`http://localhost:5000/movie/${movieId}`);
        return movieDetails.data;
      })
    );

    res.json(detailedMovies);

  } catch (error) {
    console.error("Error getting recommendations:", error.message);
    res.status(500).json({ error: "Failed to generate recommendations" });
  }
});


// 
app.delete("/api/reviews/:reviewId", authenticateUser, async (req, res) => {
  const { reviewId } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM reviews WHERE id = $1 AND user_id = $2 RETURNING *",
      [reviewId, req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Review not found or unauthorized" });
    }

    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting review:", error.message);
    res.status(500).json({ error: "Failed to delete review" });
  }
});

// Get user settings
app.get("/api/user/settings", authenticateUser, async (req, res) => {
  try {
    const result = await pool.query("SELECT settings FROM users WHERE id = $1", [req.userId]);
    res.json(result.rows[0]?.settings || {});
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});



// Update user settings
app.put("/api/user/settings", authenticateUser, async (req, res) => {
  const { backgroundColor } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET settings = jsonb_set(coalesce(settings, '{}'), '{backgroundColor}', to_jsonb($1::text)) WHERE id = $2 RETURNING settings",
      [backgroundColor, req.userId]
    );
    res.json({ message: "Settings updated!", settings: result.rows[0].settings });
  } catch (error) {
    console.error("Failed to update settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});


// Get count of reviews for current user (more efficient than fetching all reviews)
app.get("/api/user/reviews/count", authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM reviews WHERE user_id = $1",
      [req.userId]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error("Failed to fetch review count:", error);
    res.status(500).json({ error: "Failed to fetch review count" });
  }
});



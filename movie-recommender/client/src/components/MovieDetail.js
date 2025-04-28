import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const MovieDetail = () => {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [userReview, setUserReview] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [isEditing, setIsEditing] = useState(false);


  const [watchlists, setWatchlists] = useState([]);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieResponse = await axios.get(`http://localhost:5000/movie/${movieId}`);
        const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/${movieId}`);
        const watchlistsResponse = await axios.get("http://localhost:5000/api/watchlists", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const movieData = movieResponse.data;
        setMovie({
          id: movieData.id,
          title: movieData.title,
          year: movieData.release_date ? movieData.release_date.split("-")[0] : "Unknown",
          runtime: movieData.runtime,
          overview: movieData.overview,
          poster: movieData.poster,
        });

        const review = reviewsResponse.data.find(r => r.user_id === user.id);
        if (review) {
          setUserReview(review);
          setReviewText(review.review);
          setRating(review.rating);
          setIsEditing(true);
        }
        setWatchlists(watchlistsResponse.data);
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };

    fetchMovieDetails();
  }, [movieId, user.id]);

  const handleAddToWatchlist = async () => {
    console.log("Trying to add movie:", { selectedWatchlistId, movieId: movie.id });
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:5000/api/watchlists/${selectedWatchlistId}/movies`,
        { movieId: movie.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("🎥 Movie added to watchlist!");
    } catch (error) {
      console.error("Failed to add to watchlist", error);
      alert("Failed to add movie to watchlist!");
    }
  };

  const handleSubmitReview = async (e) => {

    e.preventDefault();
    console.log("Adding movie to watchlist:", selectedWatchlistId, movie.id);
    try {
      await axios.post("http://localhost:5000/api/reviews", {
        movieId: movie.id,
        review: reviewText,
        rating: rating,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Review submitted!");
      setIsEditing(true);
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };

  const handleDeleteReview = async () => {
    //const confirmDelete = window.confirm("Are you sure you want to delete your review?");
    //if (!confirmDelete) return;  // If the user cancels, stop.

    try {
      await axios.delete(`http://localhost:5000/api/reviews/${userReview.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Review deleted!");
      setUserReview(null);
      setIsEditing(false);
      setReviewText("");
      setRating(5);
    } catch (error) {
      console.error("Failed to delete review:", error.message);
    }
  };

  if (!movie) return <p>Loading movie details...</p>;

  return (

    <div
      className="movie-detail-page fade-in"
      style={{
        backgroundImage: `url(${movie.poster})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="movie-detail-overlay">
        <div className="movie-detail-container">
          <img src={movie.poster} alt={movie.title} className="movie-detail-poster" />
          <div className="movie-detail-info">
            <h1>{movie.title}</h1>
            <p>{movie.year}, {movie.runtime} mins</p>
            <p className="overview">{movie.overview}</p>

            <div className="watchlist-controls">
              <select
                value={selectedWatchlistId}
                onChange={(e) => setSelectedWatchlistId(e.target.value)}
              >
                <option value="">-- Select Watchlist --</option>
                {watchlists.map((watchlist) => (
                  <option key={watchlist.id} value={watchlist.id}>
                    {watchlist.name}
                  </option>
                ))}
              </select>
              <button onClick={handleAddToWatchlist}>Add to Watchlist</button>
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div className="review-section">
          {isEditing ? (
            <>
              <h2>Your Review</h2>
              <p>{reviewText}</p>
              <p>Rating: {rating}/10</p>
              <button onClick={handleDeleteReview}>Delete Review</button>
            </>
          ) : (
            <>
              <h2>Write a Review</h2>
              <form onSubmit={handleSubmitReview}>
                <textarea
                  placeholder="Write your review here..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                />
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={rating}
                  onChange={(e) => setRating(parseInt(e.target.value))}
                />
                <button type="submit">Submit Review</button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );

};

export default MovieDetail;

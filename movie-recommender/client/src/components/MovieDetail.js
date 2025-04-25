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

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieResponse = await axios.get(`http://localhost:5000/movie/${movieId}`);
        const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/${movieId}`);

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
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };

    fetchMovieDetails();
  }, [movieId, user.id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
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

  if (!movie) return <p>Loading movie details...</p>;

  return (
    <div>
      <div>
        <img src={movie.poster} alt={movie.title} />
        <div>
          <h1>{movie.title}</h1>
          <p>{movie.year}, {movie.runtime} mins</p>
          <p>{movie.overview}</p>
        </div>
      </div>

      <div>
        {isEditing ? (
          <>
            <h2>Your Review</h2>
            <p>{reviewText}</p>
            <p>Rating: {rating}/10</p>
          </>
        ) : (
          <>
            <p>You haven't written a review for this film.</p>
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
  );
};

export default MovieDetail;

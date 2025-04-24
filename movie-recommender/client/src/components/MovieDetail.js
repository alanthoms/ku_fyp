import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const TMDB_API_KEY = "YOUR_TMDB_API_KEY_HERE"; // Replace with your TMDB API key
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

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
        const movieResponse = await await axios.get(`http://localhost:5000/movie/${movieId}`);
        const reviewsResponse = await axios.get(`http://localhost:5000/api/reviews/${movieId}`);

        const movieData = movieResponse.data;
        console.log("Fetched movie:", movieData);
        setMovie({
          id: movieData.id,
          title: movieData.title,
          year: movieData.release_date ? movieData.release_date.split("-")[0] : "Unknown",
          runtime: movieData.runtime,
          overview: movieData.overview,
          poster: movieData.poster, // backend already sent full URL
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
    <div className="container mx-auto p-4 text-white">
      <div className="flex flex-wrap gap-8">
        <img src={movie.poster} alt={movie.title} className="w-64 rounded" />
        <div>
          <h1 className="text-4xl font-bold">{movie.title}</h1>
          <p className="text-xl mt-2">{movie.year}, {movie.runtime} mins</p>
          <p className="mt-4 text-lg">{movie.overview}</p>
        </div>
      </div>

      <div className="mt-8 bg-purple-800 p-4 rounded">
        {isEditing ? (
          <>
            <h2 className="text-lg">Your Review</h2>
            <p>{reviewText}</p>
            <p>Rating: {rating}/10</p>
          </>
        ) : (
          <>
            <p>You haven't written a review for this film.</p>
            <form onSubmit={handleSubmitReview} className="mt-4">
              <textarea
                className="w-full p-2 rounded"
                placeholder="Write your review here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                required
              />
              <input
                type="number"
                min="1"
                max="10"
                className="w-full p-2 mt-2 rounded"
                value={rating}
                onChange={(e) => setRating(parseInt(e.target.value))}
              />
              <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Submit Review</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default MovieDetail;

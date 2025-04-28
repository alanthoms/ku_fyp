import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/myreviews/details", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(response.data);
      } catch (error) {
        console.error("Failed to fetch reviews:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) return <p>Loading your reviews...</p>;

  if (reviews.length === 0) return <p>You haven't written any reviews yet.</p>;

  return (
    <div className="container">
      <h2>Your Reviews</h2>
      <div className="movie-row-list">
        {reviews.map((review) => (
          <div
            key={review.movie_id}
            className="movie-row"
            onClick={() => navigate(`/movie/${review.movie_id}`)}
            style={{ cursor: 'pointer' }} // Makes it clear it's clickable
          >
            <div className="movie-info">
              {review.poster ? (
                <img
                  src={review.poster}
                  alt={review.movie_title}
                  className="movie-row-poster"
                />
              ) : (
                <div className="no-poster">
                  <span>No Image</span>
                </div>
              )}
              <div className="movie-text">
                <h3 className="movie-title">{review.movie_title}</h3>
                <p>Rating: {review.rating}/10</p>
                <p>Review: {review.review}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserReviews;

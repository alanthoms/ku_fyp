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
    <div>
      <h2>Your Reviews</h2>
      <div>
        {reviews.map((review) => (
          <div
            key={review.movie_id}
            onClick={() => navigate(`/movie/${review.movie_id}`)}
          >
            {review.poster ? (
              <img
                src={review.poster}
                alt={review.movie_title}
              />
            ) : (
              <div>
                <span>No Image</span>
              </div>
            )}
            <h3>{review.movie_title}</h3>
            <p>Rating: {review.rating}/10</p>
            <p>Review: {review.review}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserReviews;

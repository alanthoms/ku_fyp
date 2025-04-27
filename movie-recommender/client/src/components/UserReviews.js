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
        const response = await axios.get("http://localhost:5000/api/myreviews", {
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
    <div className="reviews-container">
      <h2 className="text-2xl font-bold mb-4">📝 Your Reviews</h2>
      <div className="review-grid">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="review-card"
            onClick={() => navigate(`/movie/${review.movie_id}`)}
            style={{ cursor: "pointer", border: "1px solid #ddd", padding: "1rem", borderRadius: "8px", marginBottom: "1rem" }}
          >
            <p><strong>Rating:</strong> {review.rating}/10</p>
            <p><strong>Review:</strong> {review.review}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserReviews;
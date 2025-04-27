import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/recommendations", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecommendations(response.data);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err.message);
      }
    };

    fetchRecommendations();
  }, []);

  if (recommendations.length === 0) {
    return <p>No recommendations available yet.</p>;
  }

  return (
    <div>
      <h2>🎬 Recommended for You</h2>
      <div className="movie-list">
        {recommendations.map((movie) => (
          <div
            key={movie.id}
            className="movie-card"
            onClick={() => navigate(`/movie/${movie.id}`)}
            style={{ cursor: "pointer" }}
          >
            {movie.poster ? (
              <img src={movie.poster} alt={movie.title} className="movie-poster" />
            ) : (
              <div className="no-poster">No Image</div>
            )}
            <p>{movie.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations;
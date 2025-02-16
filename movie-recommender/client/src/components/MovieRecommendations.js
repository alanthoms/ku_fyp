import React, { useState, useEffect } from "react";
import axios from "axios";

const MovieRecommendations = ({ movieId }) => {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    if (movieId) {
      axios.get(`http://localhost:5000/recommend/${movieId}`).then((response) => {
        setRecommendations(response.data);
      });
    }
  }, [movieId]);

  return (
    <div>
      <h2>🎥 Recommended Movies</h2>
      <div className="movie-list">
        {recommendations.map((movie) => (
          <div key={movie.id} className="movie-card">
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

export default MovieRecommendations;

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
    <div className="p-4">
      <h2>Recommended Movies</h2>
      <ul>
        {recommendations.map((movie) => (
          <li key={movie.id}>{movie.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default MovieRecommendations;

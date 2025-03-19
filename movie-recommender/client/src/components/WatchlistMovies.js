import React, { useEffect, useState } from "react";
import axios from "axios";

const WatchlistMovies = ({ watchlistId }) => {
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token for authentication
        const response = await axios.get(`http://localhost:5000/api/watchlists/${watchlistId}/movies`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMovies(response.data);
      } catch (err) {
        setError("Failed to fetch movies.");
      }
    };

    fetchMovies();
  }, [watchlistId]);

  return (
    <div>
      <h2>Movies in Watchlist</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {movies.length > 0 ? (
        <ul>
          {movies.map((movie) => (
            <li key={movie.id}>
              <strong>{movie.title}</strong>
              {movie.poster ? <img src={movie.poster} alt={movie.title} width="100" /> : <p>No Image</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p>No movies in this watchlist.</p>
      )}
    </div>
  );
};

export default WatchlistMovies;

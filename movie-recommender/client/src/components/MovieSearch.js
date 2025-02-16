import React, { useState } from "react";
import axios from "axios";
import "../App.css";



const MovieSearch = ({ onMovieSelect }) => {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);

  const searchMovies = async () => {
    if (!query) return;
    const response = await axios.get(`http://localhost:5000/search/${query}`);
    console.log("API Response:", response.data); // ✅ Debugging: Print API response
    setMovies(response.data);
  };


  return (
    <div>
      <input
        type="text"
        placeholder="Search for a movie..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button onClick={searchMovies}>🔍 Search</button>

      <div className="movie-list">
        {movies.map((movie) => (
          <div key={movie.id} className="movie-card" onClick={() => onMovieSelect(movie.id)}>
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

export default MovieSearch;

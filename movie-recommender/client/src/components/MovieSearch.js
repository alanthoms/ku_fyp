import React, { useState } from "react";
import axios from "axios";

const MovieSearch = ({ onMovieSelect }) => {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);

  const searchMovies = async () => {
    const response = await axios.get(`http://localhost:5000/search/${query}`);
    setMovies(response.data);
  };

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search for a movie..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 rounded"
      />
      <button onClick={searchMovies} className="ml-2 p-2 bg-blue-500 text-white rounded">
        Search
      </button>
      <ul>
        {movies.map((movie) => (
          <li key={movie.id} onClick={() => onMovieSelect(movie.id)}>
            {movie.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MovieSearch;

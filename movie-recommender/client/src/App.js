import React, { useState } from "react";
import MovieSearch from "./components/MovieSearch";
import MovieRecommendations from "./components/MovieRecommendations";

function App() {
  const [selectedMovie, setSelectedMovie] = useState(null);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Movie Recommender</h1>
      <MovieSearch onMovieSelect={setSelectedMovie} />
      {selectedMovie && <MovieRecommendations movieId={selectedMovie} />}
    </div>
  );
}

export default App;

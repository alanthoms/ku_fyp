import React, { useState } from "react";
import MovieSearch from "./MovieSearch";
import MovieRecommendations from "./MovieRecommendations";

function Dashboard() {
  const [selectedMovie, setSelectedMovie] = useState(null);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Movie Recommender</h1>
      {/* ✅ Pass onMovieSelect as a prop */}
      <MovieSearch onMovieSelect={setSelectedMovie} />
      {selectedMovie && <MovieRecommendations movieId={selectedMovie} />}
    </div>
  );
}

export default Dashboard;

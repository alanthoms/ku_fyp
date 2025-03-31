import React, { useState } from "react";
import MovieSearch from "./MovieSearch";
import MovieRecommendations from "./MovieRecommendations";
import Watchlists from "./Watchlists"; // ✅ Import the Watchlists component
import CreateWatchlist from "./CreateWatchlist"; // ✅ Import the form component

function Dashboard() {
  const [selectedMovie, setSelectedMovie] = useState(null);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Movie Recommender</h1>

      {/* ✅ Watchlists Component */}
      <Watchlists />

      {/* ✅ Create Watchlist Form */}
      <CreateWatchlist />


      {/* ✅ Pass onMovieSelect as a prop */}
      <MovieSearch onMovieSelect={setSelectedMovie} />

      {/* ✅ Show Recommendations if a movie is selected */}
      {selectedMovie && <MovieRecommendations movieId={selectedMovie} />}
    </div>
  );
}

export default Dashboard;

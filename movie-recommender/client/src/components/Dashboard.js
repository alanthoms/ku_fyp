import React, { useState } from "react";
import MovieSearch from "./MovieSearch";
import { getUser, logout } from "./logout.js";
import { useNavigate } from "react-router-dom";
import MovieRecommendations from "./MovieRecommendations";
import Watchlists from "./Watchlists"; // ✅ Import the Watchlists component
import CreateWatchlist from "./CreateWatchlist"; // ✅ Import the form component
import MovieDetail from "./MovieDetail";
import Recommendations from "./Recommendations";
//<Route path="/movie/:movieId" element={<MovieDetail />} />

//
{/* ✅ Show Recommendations if a movie is selected */ }
//{selectedMovie && <MovieRecommendations movieId={selectedMovie} />}
function Dashboard() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const user = getUser();
  const navigate = useNavigate(); // React Router navigation

  const handleMovieSelect = (movieId) => {
    navigate(`/movie/${movieId}`); // Navigate to MovieDetail page
  };
  return (

    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold">Movie Recommender</h1>
      <div>
        <span className="text-gray-500 mr-4">Hi, {user?.username}</span>
        <button
          onClick={logout}
          className="logout-button"
        >
          Logout
        </button>
      </div>

      {/* ⭐ Show Recommendations after greeting */}
      <Recommendations />

      {/* ✅ Watchlists Component */}
      <Watchlists />

      {/* ✅ Create Watchlist Form */}
      <CreateWatchlist />


      {/* ✅ Pass onMovieSelect as a prop */}
      <MovieSearch onMovieSelect={setSelectedMovie} />

    </div>
  );
}

export default Dashboard;

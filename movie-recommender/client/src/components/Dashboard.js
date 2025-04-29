import React, { useEffect, useState } from "react";
import MovieSearch from "./MovieSearch";
import { getUser, logout } from "./logout.js";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import MovieRecommendations from "./MovieRecommendations";
import Watchlists from "./Watchlists"; //  Import the Watchlists component
import CreateWatchlist from "./CreateWatchlist"; //  Import the form component
import MovieDetail from "./MovieDetail";
import Recommendations from "./Recommendations";
import UserReviews from "./UserReviews";
import PersonalSettings from "./PersonalSettings"; // Import the PersonalSettings component
//<Route path="/movie/:movieId" element={<MovieDetail />} />

//
{/* ✅ Show Recommendations if a movie is selected */ }
//{selectedMovie && <MovieRecommendations movieId={selectedMovie} />}
function Dashboard() {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const user = getUser();
  const navigate = useNavigate(); // React Router navigation

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/user/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const settings = res.data;

        console.log(settings.backgroundColor)
        if (settings && settings.backgroundColor) {
          console.log("Applying backgroundColor from settings:", settings.backgroundColor);
          document.body.style.backgroundColor = settings.backgroundColor;
        } else {
          console.warn("No backgroundColor in settings, applying fallback.");
          document.body.style.backgroundColor = "#121212"; // fallback only if really missing
        }
      } catch (error) {
        console.error("Failed to fetch settings:", error);
        document.body.style.backgroundColor = "#121212"; // fallback only on error
        document.body.className = "default-bg";
      }
    };
    console.log(document.body.style.backgroundColor);
    fetchUserSettings();
  }, []); //  run once on Dashboard load

  const handleViewReviews = () => {
    navigate("/user-reviews");// naviagate to UserReviews page
  };

  const handleMovieSelect = (movieId) => {
    navigate(`/movie/${movieId}`); // Navigate to MovieDetail page
  };
  return (

    <div className="container mx-auto p-4 fade-in" >
      <div>
        <span className="text-gray-500 mr-4">Hi, {user?.username}</span>
        <button onClick={logout} className="logout-button" >Logout</button>
        <button onClick={() => navigate("/Settings")}> Customise</button>
      </div>


      {/*  Show Recommendations after greeting */}
      <Recommendations />

      <button
        onClick={handleViewReviews}
        className="btn btn-primary mt-4"
      >
        View My Reviews
      </button>
      {/*  Watchlists Component */}
      <Watchlists />

      {/* Create Watchlist Form */}
      <CreateWatchlist />


      {/*  Pass onMovieSelect as a prop */}
      <MovieSearch onMovieSelect={setSelectedMovie} />

    </div>
  );
}

export default Dashboard;

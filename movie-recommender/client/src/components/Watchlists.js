import React, { useEffect, useState } from "react";
import axios from "axios";
import EditWatchlist from "./EditWatchlist";



const Watchlists = () => {
  const [watchlists, setWatchlists] = useState([]);
  const [error, setError] = useState(null);


  //delete function
  const deleteWatchlist = async (id) => {
    try {
      const token = localStorage.getItem("token"); // Get authentication token
      const response = await axios.delete(`http://localhost:5000/api/watchlists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response); // Log response for debugging
      setWatchlists(watchlists.filter(watchlist => watchlist.id !== id)); // Remove the deleted watchlist from the state
    } catch (err) {
      console.error("Error deleting watchlist:", err.message); // Log the error message
    }
  }

  useEffect(() => {
    const fetchWatchlists = async () => {
      try {
        const token = localStorage.getItem("token"); // Get authentication token
        const response = await axios.get("http://localhost:5000/api/watchlists", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWatchlists(response.data);
      } catch (err) {
        setError("Failed to fetch watchlists.");
      }
    };

    fetchWatchlists();
  }, []); //thing at the end makes it one request only


  console.log(watchlists);
  return (
    <div>
      <h2>My Watchlists</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {watchlists.length > 0 ? (
          watchlists.map((watchlist) => (
            <li key={watchlist.id} className="watchlist-item">
              <span className="watchlist-name">{watchlist.name}</span>

              <div className="button-container">
                <div><EditWatchlist watchlist={watchlist} /></div>
                <button className="delete-button"
                  onClick={() => deleteWatchlist(watchlist.id)}>Delete</button>
              </div>
            </li>
          ))
        ) : (
          <p>No watchlists found.</p>
        )}
      </ul>
    </div>
  );
};

export default Watchlists;

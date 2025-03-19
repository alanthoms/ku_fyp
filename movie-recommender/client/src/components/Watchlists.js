import React, { useEffect, useState } from "react";
import axios from "axios";

const Watchlists = () => {
  const [watchlists, setWatchlists] = useState([]);
  const [error, setError] = useState(null);

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
  }, []);

  return (
    <div>
      <h2>My Watchlists</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {watchlists.length > 0 ? (
          watchlists.map((watchlist) => <li key={watchlist.id}>{watchlist.name}</li>)
        ) : (
          <p>No watchlists found.</p>
        )}
      </ul>
    </div>
  );
};

export default Watchlists;

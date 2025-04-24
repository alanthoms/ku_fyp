import React, { useState } from 'react';

const EditWatchlist = ({ watchlist }) => {
  const [watchlistName, setWatchlistName] = useState(watchlist.name);

  const updateWatchlistName = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token"); // Get authentication token
      const response = await fetch(`http://localhost:5000/api/watchlists/${watchlist.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ name: watchlistName }),
      });

      if (!response.ok) {
        throw new Error("Failed to update watchlist");
      }

      // Close the modal manually
      document.getElementById(`id${watchlist.id}`).classList.remove("show");
      document.body.classList.remove("modal-open");
      document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());

      // Reload the page
      window.location.reload();
    } catch (err) {
      console.error("Error updating watchlist:", err.message);
    }
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        data-toggle="modal"
        data-target={`#id${watchlist.id}`}
      >
        Edit
      </button>
      <div className="modal fade" id={`id${watchlist.id}`} tabIndex="-1" role="dialog" aria-hidden="true" onClick={() => setWatchlistName(watchlist.name)}>
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">Edit Watchlist</h4>
              <button type="button" className="close" data-dismiss="modal" onClick={() => setWatchlistName(watchlist.name)}>&times;</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                className="form-control"
                value={watchlistName}
                onChange={(e) => setWatchlistName(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={updateWatchlistName} // No e needed, already handled inside function
              >
                Save
              </button>
              <button type="button" className="btn btn-danger" data-dismiss="modal" onClick={() => setWatchlistName(watchlist.name)}>
                Close</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditWatchlist;

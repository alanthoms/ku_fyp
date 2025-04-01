//import { application } from "express";
import React, { useState } from "react";

const CreateWatchlist = () => {
  const [watchlistName, setWatchlistName] = useState("");//usestate to show default value


  const onSubmitForm = async (e) => {
    e.preventDefault();//dont want to refresh

    try {
      const body = { watchlistName };

      const token = localStorage.getItem("token"); // Get authentication token
      const response = await fetch("http://localhost:5000/api/watchlists", {

        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Use the token in Authorization header
        },
        body: JSON.stringify({
          name: watchlistName,
        })
      })
      console.log(response);
      window.location.reload(); // Reload the page to see the new watchlist 
    } catch (err) {
      console.error(err.message);
    }
  }

  //fragment idk
  return <>
    <h1>Add New Watchlist</h1>
    <form className="d-flex" onSubmit={onSubmitForm}>
      <input type="text" placeholder="Enter New Watchlist Name" className="form-control" value={watchlistName} onChange={e => setWatchlistName(e.target.value)} />
      <button type="submit" className="btn btn-success">Create</button>
    </form>
  </>;
};

export default CreateWatchlist;
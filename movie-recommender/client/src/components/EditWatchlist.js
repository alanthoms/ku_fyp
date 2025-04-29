import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditWatchlist = ({ watchlist }) => {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  const tickSound = new Audio('../ding.mp3');
  const openModal = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/watchlists/${watchlist.id}/movies`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const detailedMovies = await Promise.all(
        response.data.map(async (entry) => {
          const backendRes = await axios.get(`http://localhost:5000/movie/${entry.movie_id}`);
          return {
            id: backendRes.data.id,
            title: backendRes.data.title,
            poster: backendRes.data.poster,
            ticked: entry.ticked, //
          };
        })
      );
      setMovies(detailedMovies);
    } catch (err) {
      console.error("Failed to fetch movies:", err.message);
    }
  };

  const handleTick = async (movieId) => {
    const movie = movies.find(m => m.id === movieId);
    const newTickedState = !movie.ticked;

    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/watchlists/${watchlist.id}/movies/${movieId}/tick`, {
        ticked: newTickedState
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMovies(prevMovies =>
        prevMovies.map(m => m.id === movieId ? { ...m, ticked: newTickedState } : m)
      );
      tickSound.play();
    } catch (err) {
      console.error("Failed to update ticked status:", err.message);
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
    document.getElementById(`id${watchlist.id}`).classList.remove("show");
    document.body.classList.remove("modal-open");
    document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        data-toggle="modal"
        data-target={`#id${watchlist.id}`}
        onClick={openModal}
      >
        View Watchlist
      </button>

      <div className="modal fade" id={`id${watchlist.id}`} tabIndex="-1" role="dialog" aria-hidden="true">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">{watchlist.name}</h4>
              <button type="button" className="close" data-dismiss="modal">&times;</button>
            </div>
            <div className="modal-body">
              {movies.length === 0 ? (
                <p>No movies in this watchlist yet.</p>
              ) : (
                <div className="modal-body">
                  {movies.length === 0 ? (
                    <p>No movies in this watchlist yet.</p>
                  ) : (
                    <div className="movie-row-list">
                      {movies.map((movie) => (
                        <div
                          key={movie.id}
                          className={`movie-row ${movie.ticked ? 'ticked' : ''}`}
                        >
                          <div className="movie-info" onClick={() => handleMovieClick(movie.id)}>
                            {movie.poster ? (
                              <img src={movie.poster} alt={movie.title} className="movie-row-poster" />
                            ) : (
                              <div className="no-poster">No Image</div>
                            )}
                            <h3 className={`movie-title ${movie.ticked ? 'ticked' : ''}`}>
                              {movie.title}
                            </h3>
                          </div>
                          <div className="tick-placeholder">
                            <input
                              type="checkbox"
                              checked={movie.ticked}
                              onChange={() => handleTick(movie.id)}
                              className="tick-checkbox"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-danger" data-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditWatchlist;

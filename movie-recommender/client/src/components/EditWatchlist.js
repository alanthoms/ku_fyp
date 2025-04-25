import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditWatchlist = ({ watchlist }) => {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  const openModal = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/watchlists/${watchlist.id}/movies`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch full movie details via your backend
      const detailedMovies = await Promise.all(
        response.data.map(async (entry) => {
          const backendRes = await axios.get(`http://localhost:5000/movie/${entry.movie_id}`);
          return {
            id: backendRes.data.id,
            title: backendRes.data.title,
            poster: backendRes.data.poster,
          };
        })
      );

      setMovies(detailedMovies);
    } catch (err) {
      console.error("Failed to fetch movies:", err.message);
    }
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
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h4 className="modal-title">{watchlist.name}</h4>
              <button type="button" className="close" data-dismiss="modal">&times;</button>
            </div>
            <div className="modal-body">
              {movies.length === 0 ? (
                <p>No movies in this watchlist yet.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {movies.map((movie) => (
                    <div key={movie.id} style={{ cursor: 'pointer' }}
                      onClick={() => {
                        navigate(`/movie/${movie.id}`);
                        document.getElementById(`id${watchlist.id}`).classList.remove("show");
                        document.body.classList.remove("modal-open");
                        document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
                      }}
                    >
                      {movie.poster ? (
                        <img src={movie.poster} alt={movie.title} width="100" />
                      ) : (
                        <div style={{ width: '100px', height: '150px', background: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          No Image
                        </div>
                      )}
                      <p style={{ textAlign: 'center' }}>{movie.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-danger" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditWatchlist;

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Register from "./components/Register";
import MovieDetail from "./components/MovieDetail";
import UserReviews from "./components/UserReviews";
import PersonalSettings from "./components/PersonalSettings";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  if (isAuthenticated === null) return <div>Loading...</div>; // Prevents flashing between pages

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/movie/:movieId" element={<MovieDetail />} />
        <Route path="/user-reviews" element={<UserReviews />} />
        <Route path="/settings" element={<PersonalSettings />} />
      </Routes>
    </Router>
  );
}

export default App;

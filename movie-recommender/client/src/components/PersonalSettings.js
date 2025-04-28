import React, { useEffect, useState } from "react";
import axios from "axios";

const PersonalSettings = () => {
  const [userReviewsCount, setUserReviewsCount] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchReviewCount = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/user/reviews/count", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserReviewsCount(res.data.count);
      } catch (error) {
        console.error("Failed to fetch review count", error);
      }
    };
    fetchReviewCount();
  }, [token]);

  const changeBackground = async (color, requiredReviews) => {
    if (userReviewsCount < requiredReviews) {
      alert(`You need at least ${requiredReviews} reviews to unlock this background!`);
      return;
    }
    try {
      await axios.put("http://localhost:5000/api/user/settings", { backgroundColor: color }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      document.body.style.backgroundColor = color;
      console.log("Background color updated:", document.body.style.backgroundColor);
      setBackgroundColor(color);
    } catch (error) {
      console.error("Failed to update background", error);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <h1 className="settings-title">🎨 Choose Your Wallpaper</h1>
        <div className="background-container">

          <button
            className="background-button"
            disabled={userReviewsCount < 0}
            onClick={() => changeBackground("#121212", 0)}
          >
            Default (Unlocked)
          </button>

          <button
            className="background-button"
            disabled={userReviewsCount < 3}
            onClick={() => changeBackground("rgba(23, 0, 43, 1)", 3)}
          >
            {userReviewsCount >= 3 ? "Dark Purple (Unlocked)" : "Dark Purple (3+ Reviews)"}
          </button>

          <button
            className="background-button"
            disabled={userReviewsCount < 5}
            onClick={() => changeBackground("rgba(40, 0, 0, 1)", 5)}
          >
            {userReviewsCount >= 5 ? "Dark Red (Unlocked)" : "Dark Red (5+ Reviews)"}
          </button>

          <button
            className="background-button"
            disabled={userReviewsCount < 10}
            onClick={() => changeBackground("rgba(0, 0, 64, 1)", 10)}
          >
            {userReviewsCount >= 10 ? "Dark Blue (Unlocked)" : "Dark Blue (10+ Reviews)"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalSettings;

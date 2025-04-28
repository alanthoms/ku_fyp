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
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🎨 Choose Your Wallpaper</h1>
      <div className="flex flex-col gap-4">

        <button
          className="btn bg-gray-200 p-2 rounded"
          onClick={() => changeBackground("#121212", 0)}
        >
          Default (Unlocked)
        </button>

        <button
          disabled={userReviewsCount < 3}
          className={`btn p-2 rounded ${userReviewsCount >= 3 ? "bg-[#17002B]" : "bg-gray-300 cursor-not-allowed"}`}
          onClick={() => changeBackground("rgba(23, 0, 43, 1)", 3)}
        >
          {userReviewsCount >= 3 ? "Dark Purple (Unlocked)" : "Dark Purple (3+ Reviews)"}
        </button>

        <button
          disabled={userReviewsCount < 5}
          className={`btn p-2 rounded ${userReviewsCount >= 5 ? "bg-[#280000]" : "bg-gray-300 cursor-not-allowed"}`}
          onClick={() => changeBackground("rgba(40, 0, 0, 1)", 5)}
        >
          {userReviewsCount >= 5 ? "Dark Red (Unlocked)" : "Dark Red (5+ Reviews)"}
        </button>

        <button
          disabled={userReviewsCount < 10}
          className={`btn p-2 rounded ${userReviewsCount >= 10 ? "bg-[#000040]" : "bg-gray-300 cursor-not-allowed"}`}
          onClick={() => changeBackground("rgba(0, 0, 64, 1)", 10)}
        >
          {userReviewsCount >= 10 ? "Dark Blue (Unlocked)" : "Dark Blue (10+ Reviews)"}
        </button>

      </div>
    </div>
  );
};

export default PersonalSettings;

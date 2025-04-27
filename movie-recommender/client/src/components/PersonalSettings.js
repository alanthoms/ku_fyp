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
  }, []);

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
      alert("Background updated!");
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
          onClick={() => changeBackground("#ffffff", 0)}
        >
          Default (Unlocked)
        </button>

        <button
          disabled={userReviewsCount < 3}
          className={`btn p-2 rounded ${userReviewsCount >= 3 ? "bg-blue-200" : "bg-gray-300 cursor-not-allowed"}`}
          onClick={() => changeBackground("#add8e6", 3)}
        >
          {userReviewsCount >= 3 ? "Light Blue (Unlocked)" : "Light Blue (3+ Reviews)"}
        </button>

        <button
          disabled={userReviewsCount < 5}
          className={`btn p-2 rounded ${userReviewsCount >= 5 ? "bg-yellow-200" : "bg-gray-300 cursor-not-allowed"}`}
          onClick={() => changeBackground("#fff8dc", 5)}
        >
          {userReviewsCount >= 5 ? "Cream Yellow (Unlocked)" : "Cream Yellow (5+ Reviews)"}
        </button>

        <button
          disabled={userReviewsCount < 10}
          className={`btn p-2 rounded ${userReviewsCount >= 10 ? "bg-purple-300" : "bg-gray-300 cursor-not-allowed"}`}
          onClick={() => changeBackground("#d8bfd8", 10)}
        >
          {userReviewsCount >= 10 ? "Fancy Purple (Unlocked)" : "Fancy Purple (10+ Reviews)"}
        </button>

      </div>
    </div>
  );
};

export default PersonalSettings;

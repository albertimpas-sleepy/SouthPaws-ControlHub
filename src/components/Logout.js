import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const userId = localStorage.getItem("userID"); // Get the user ID from localStorage

    // Send logout request to backend
    axios
      .post("http://localhost:80/api/logout.php", { user_id: userId })
      .then(response => {
        if (response.data.status === 1) {
          // Clear all session-related data in localStorage
          localStorage.removeItem("userID");
          localStorage.removeItem("first_name");
          localStorage.removeItem("userRole");

          // Optionally, you could also clear any other related session data here

          // Redirect to login page
          navigate("/login");
        } else {
          console.error("Logout failed:", response.data.message);
        }
      })
      .catch(error => {
        console.error("Error logging out:", error);
      });
  };

  return (
    <button onClick={handleLogout}>Logout</button>
  );
};

export default Logout;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation for URL query params
import "../assets/login.css";
import logo from '../assets/southpawslogo.png';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const location = useLocation();  // Hook to get current location and URL params
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState(""); // State for success message

  useEffect(() => {
    // Check if the user is already logged in when the component is mounted
    const userID = localStorage.getItem("userID");
    if (userID) {
      // If logged in, automatically redirect to home page
      navigate("/home");
    }

    // Check URL for a message parameter (e.g., verification success)
    const queryParams = new URLSearchParams(location.search);
    const message = queryParams.get('message');
    if (message) {
      if (message === "Verification%20Successful") {
        setSuccessMessage("Your email has been successfully verified!");
      } else if (message === "Token%20Expired") {
        setErrorMessage("Your verification link has expired. Please request a new one.");
      } else if (message === "Invalid%20or%20Expired%20Token") {
        setErrorMessage("The verification link is invalid or has already been used.");
      } else if (message === "Missing%20Verification%20Token") {
        setErrorMessage("Missing verification token.");
      }
    }
  }, [navigate, location]);

  const handleSubmit = (event) => {
    event.preventDefault();

    // Check if email and password are provided
    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    // Send login credentials to the backend
    axios
      .post("http://localhost:80/api/login.php", {
        email: email,
        password: password,
      }, {
        withCredentials: true, // Ensure cookies/session are sent
      })
      .then((response) => {
        if (response.data.status === 1) {
          // Store user data in localStorage
          localStorage.setItem("userID", response.data.id);
          localStorage.setItem("first_name", response.data.first_name);
          localStorage.setItem("userRole", response.data.user_role);

          // Notify the parent component that login is successful
          onLogin();

          // Navigate to the home page
          navigate("/home");
        } else {
          setErrorMessage(response.data.message || "Login failed.");
        }
      })
      .catch((error) => {
        // Handle any errors from the backend (e.g., network issues)
        setErrorMessage("An error occurred. Please try again.");
      });
  };

  return (
    <div className={'loginContainer'}>
      <div className={'loginLeftContainer'}>
        <div className={'loginForm'}>
          <div className={'loginTitleContainer'}>
            <div style={{ fontSize: '37px', fontWeight: 500 }}>Sign in</div>
            <img src={logo} alt="logo" />
          </div>
          <form onSubmit={handleSubmit}>
            <label htmlFor="email" className="loginLabel">Email</label>
            <div className={'loginInputContainer'}>
              <input
                type="text"
                id="email"
                value={email}
                placeholder="Enter your email here"
                onChange={(ev) => setEmail(ev.target.value)}
                className={'loginInputBox'}
              />
            </div>
            <br />
            <label htmlFor="password" className="loginLabel">Password</label>
            <div className={'loginInputContainer'} style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                placeholder="Enter your password here"
                onChange={(ev) => setPassword(ev.target.value)}
                className={'loginInputBox'}
              />
              <div
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            <br />
            <button className={'loginInputButton'} type="submit">Sign in</button>
          </form>
          {errorMessage && <p className="loginErrorLabel">{errorMessage}</p>}
          {successMessage && <p className="loginSuccessLabel">{successMessage}</p>}

          {/* Forgot Password link */}
          <div className="forgot-password-link" onClick={() => navigate('/forgot-password')}>
            Forgot your password?
          </div>
        </div>
      </div>
      <div className={'loginRightContainer'}>
        <div className={'loginForm2'}>
          <div className={'loginTitleContainer2'}>
            <div>South Paws: Inventory Control Hub</div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import '../App.css';
import { Link, useNavigate } from 'react-router-dom';
import { TopbarData } from './TopbarData';
import axios from 'axios';

const TopBar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [firstName, setFirstName] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem('userID');
    const userFirstName = localStorage.getItem('first_name'); // Retrieve first name from localStorage
    const userRole = localStorage.getItem('userRole');
    
    
    if (userId) {
      // If the user is admin (role 4), directly set the first name
      if (userRole === '4') {  // Check for role 4 (Super Admin)
        setFirstName('Super Admin');  // Hardcoded first name for admin
      } else if (userFirstName) { // If first name exists in localStorage
        setFirstName(userFirstName); // Set the first name from localStorage
      } else {
        console.error('No first name available in localStorage');
      }
    } else {
      console.error('User ID is not available in localStorage.');
    }
  }, []); // Empty dependency array to fetch the data only once when the component mounts
  

  const handleLogout = () => {
    const userId = localStorage.getItem("userID");
    const userRole = localStorage.getItem("userRole");

    if (userRole !== "4") {
      axios
        .post("http://localhost:80/api/logout.php", { user_id: userId, user_role: userRole })
        .then((response) => {
          if (response.data.status === 1) {
            localStorage.removeItem("userID");
            localStorage.removeItem("userRole");
            localStorage.removeItem("username");
            navigate("/login", { replace: true });
            window.location.reload();
          } else {
            console.error("Logout failed:", response.data.message);
          }
        })
        .catch((error) => {
          console.error("Error logging out:", error);
        });
    } else {
      localStorage.removeItem("userID");
      localStorage.removeItem("userRole");
      localStorage.removeItem("username");
      navigate("/login", { replace: true });
      window.location.reload();
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const topbarData = TopbarData(firstName);

  return (
    <div className="top-bar">
      <div className="container">
        <section className="custom-section">
          <div className="row">
            <div className="col-lg-6">
              <nav className="top-bar-nav">
                <div
                  className="d-flex justify-content-end align-items-center"
                  style={{ height: '100%' }}
                >
                  <div
                    className="topbarlink me-3 d-flex align-items-center"
                    style={{
                      color: 'white',
                      fontSize: '18px',
                      fontWeight: '500',
                      position: 'relative',
                    }}
                  >
                    <div
                      onClick={toggleDropdown}
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        color: 'white',
                      }}
                    >
                      {topbarData[0].icon}
                      <span style={{ marginLeft: '10px', whiteSpace: 'nowrap' }}>
                        {firstName ? `Hello! ${firstName}` : 'Hello! Loading...'}
                      </span>
                    </div>
                    {isDropdownOpen && topbarData[0].subItems && (
                      <div
                        className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}
                      >
                        {topbarData[0].subItems.map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            to={subItem.link}
                            onClick={
                              subItem.title === 'Log out' ? handleLogout : null
                            }
                            style={{
                              display: 'block',
                              padding: '10px',
                              color: 'black',
                              textDecoration: 'none',
                              fontWeight: 'normal',
                            }}
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TopBar;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../assets/UserProfile.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function UserProfile() {
    const [activeTab, setActiveTab] = useState('general');
    const [userData, setUserData] = useState({
        id: '',
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        user_role: '',
        current_password: '',
        new_password: '',
        confirm_password: ''
    });

    // Function to handle tab switching
    const handleTabSwitch = (tab) => {
        setActiveTab(tab);
    };

    // Fetch user data on component mount
    useEffect(() => {
        const userId = localStorage.getItem('userID'); // Get userID from localStorage
        axios.get(`http://localhost:80/api/profile.php/${userId}`, {
            withCredentials: true, // Ensure credentials (like cookies) are sent
        })
        .then(response => {
            if (response.data) {
                console.log(response.data); // Check what is returned
                setUserData({
                    ...response.data,
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                });
            }
        })
        .catch(err => console.log(err));
    }, []);

    // Update user data
    const handleUpdate = () => {
        if (userData.new_password !== userData.confirm_password) {
            alert('New password and confirm password do not match.');
            return;
        }

        axios.put(`http://localhost:80/api/profile.php/${userData.id}`, userData, {
            withCredentials: true,
        })
        .then(response => {
            if (response.data.status === 1) {
                alert('User updated successfully.');
            } else {
                alert('Failed to update user.');
            }
        })
        .catch(err => console.log(err));
    };

    // Handle form input change
    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    return (
        <div className="container light-style flex-grow-1 container-p-y">
            <h1 className="font-weight-bold py-3 mb-4">Profile</h1>

            {/* Horizontal list group placed at the top-right */}
            <div className="d-flex justify-content-end mb-3">
                <div className="nav nav-pills">
                    <button
                        className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => handleTabSwitch('general')}
                    >
                        General
                    </button>
                    <button
                        className={`nav-link ${activeTab === 'password' ? 'active' : ''}`}
                        onClick={() => handleTabSwitch('password')}
                    >
                        Change password
                    </button>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="tab-content">
                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <div className="tab-pane fade active show" id="account-general">
                            <div className="card-body">
                                <h5 className="text-primary">
                                    {/* Display the user's role */}
                                    Role: {userData.userRole === '1' ? 'Staff' : userData.userRole === '2' ? 'Doctor' : userData.userRole === '3' ? 'Admin' :'Super Admin'}
                                </h5>
                                <hr className="border-light m-0" />
                                <div className="card-body">
                                    <div className="form-group">
                                        <label className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="first_name"
                                            value={userData.first_name || ''}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="last_name"
                                            value={userData.last_name || ''}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">E-mail</label>
                                        <input
                                            type="email"
                                            className="form-control mb-1"
                                            name="email"
                                            value={userData.email || ''}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Change Password Tab */}
                    {activeTab === 'password' && (
                        <div className="tab-pane fade active show" id="account-change-password">
                            <div className="card-body pb-2">
                                <div className="form-group">
                                    <label className="form-label">Current password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="current_password"
                                        value={userData.current_password}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">New password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="new_password"
                                        value={userData.new_password}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Repeat new password</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        name="confirm_password"
                                        value={userData.confirm_password}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="text-right mt-3">
                <button type="button" className="btn btn-primary" onClick={handleUpdate}>
                    Save changes
                </button>&nbsp;
                <button type="button" className="btn btn-default">Cancel</button>
            </div>
        </div>
    );
}

export default UserProfile;

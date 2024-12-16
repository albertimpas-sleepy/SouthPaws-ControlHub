import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import '../../assets/add.css';

const EditUserModal = ({ show, handleClose, editUser, handleEditChange, handleEditSubmit }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (editUser && editUser.id) {
            setUser(editUser);
            setLoading(false);
        } else {
            console.error('Error: User not found');
            setLoading(false);
        }
    }, [editUser]);

    // Handle the change for user role
    const handleRoleChange = (e) => {
        const updatedUser = { ...user, user_role: e.target.value };
        setUser(updatedUser); // Update the user object with the new role
        handleEditChange(e); // Call the parent handler if needed
    };

    return (
        <Modal show={show} onHide={handleClose} className="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>Edit User</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div>Loading...</div>
                ) : user ? (
                    <Form onSubmit={handleEditSubmit}>
                        <Row>
                            {/* Left column */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="first_name"
                                        value={user.first_name}
                                        onChange={handleEditChange}
                                        placeholder="Enter first name"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="last_name"
                                        value={user.last_name}
                                        onChange={handleEditChange}
                                        placeholder="Enter last name"
                                    />
                                </Form.Group>

                            </Col>
                            {/* Right column */}
                            <Col md={6}>
                            <Form.Group>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={user.email}
                                        onChange={handleEditChange}
                                        placeholder="Enter email"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Account Type</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="user_role"
                                        value={user.user_role} 
                                        onChange={handleRoleChange}
                                    >
                                        <option value={1}>Staff</option>
                                        <option value={2}>Doctor</option>
                                        <option value={3}>Admin</option>
                                    </Form.Control>
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="button-container">
                            <Button variant="primary" type="submit" className="button">
                                Update
                            </Button>
                        </div>
                    </Form>
                ) : (
                    <div>Error: User not found</div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default EditUserModal;

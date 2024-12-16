import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import '../../assets/add.css';

const AddServicesModal = ({ show, handleClose, onServicesAdded }) => {
    const [inputs, setInputs] = useState({ name: '', price: '', status: 'Available' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Reset state when modal is closed or opened
    useEffect(() => {
        if (!show) {
            setInputs({ name: '', price: '', status: 'Available' }); // Reset inputs
            setError(''); // Clear errors
        }
    }, [show]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputs((prevInputs) => ({ ...prevInputs, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        axios
            .post('http://localhost:80/api/services.php', inputs)
            .then(function (response) {
                if (response.data.status === 0) {
                    setError('Service name already exists.');
                } else {
                    setInputs({ name: '', price: '', status: 'Available' }); // Reset inputs
                    setError(''); // Clear error
                    handleClose(); // Close modal
                    onServicesAdded(); // Notify parent component
                    navigate('/services'); // Redirect to services page
                }
            })
            .catch(function (error) {
                console.error('Error adding service:', error);
                setError('Failed to save service. Please try again.');
            });
    };

    return (
        <Modal show={show} onHide={handleClose} className="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>Add Service</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form.Group>
                        <Form.Label>Service Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            onChange={handleChange}
                            value={inputs.name}
                            placeholder="Enter service name"
                            required
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Price</Form.Label>
                        <Form.Control
                            type="number"
                            name="price"
                            onChange={handleChange}
                            value={inputs.price}
                            placeholder="Enter price"
                            required
                            min="0.01"  // Ensure price is greater than 0
                            step="0.01"  // Allow decimal points if needed
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Label>Status</Form.Label>
                        <Form.Control
                            as="select"
                            name="status"
                            value={inputs.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="Available">Available</option>
                            <option value="Unavailable">Unavailable</option>
                        </Form.Control>
                    </Form.Group>

                    <div className="button-container mt-3">
                        <Button variant="primary" type="submit" className="button">
                            Add
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddServicesModal;

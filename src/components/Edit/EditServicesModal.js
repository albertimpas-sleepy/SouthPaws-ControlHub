import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import '../../assets/add.css';

const EditServicesModal = ({ show, handleClose, editService, handleEditChange, handleEditSubmit }) => {
    const [localEditService, setLocalEditService] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(''); // State to hold error message

    // Sync local state with parent `editService` when the modal opens
    useEffect(() => {
        if (show) {
            setLocalEditService(editService || {});
            setError(''); // Clear errors
            setLoading(false); // Set loading to false
        } else {
            setLocalEditService({}); // Reset local state
            setError(''); // Clear errors
            setLoading(true); // Reset loading state
        }
    }, [show, editService]);

    const handleLocalChange = (event) => {
        const { name, value } = event.target;
        setLocalEditService((prevState) => ({ ...prevState, [name]: value }));
        handleEditChange(event); // Call parent change handler
    };

    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent default form submission
        setError(''); // Clear any previous errors

        axios.put(`http://localhost:80/api/services.php/${localEditService.id}`, localEditService)
            .then((response) => {
                if (response.data.status === 0) {
                    setError('Service name already exists.');
                } else {
                    handleEditSubmit(event); // Notify parent of the successful submission
                    handleClose(); // Close the modal
                }
            })
            .catch((error) => {
                console.error('Error updating service:', error);
                setError('An error occurred while updating the service. Please try again.');
            });
    };

    return (
        <Modal show={show} onHide={handleClose} className="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>Edit Service</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div>Loading...</div>
                ) : localEditService && localEditService.id ? (
                    <Form onSubmit={handleSubmit}>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form.Group>
                            <Form.Label>Service Name</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={localEditService.name || ''}
                                onChange={handleLocalChange}
                                placeholder="Enter service name"
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                                type="number"
                                name="price"
                                value={localEditService.price || ''}
                                onChange={handleLocalChange}
                                placeholder="Enter price"
                                required
                                min="0.01" // Ensure the price is positive (greater than 0)
                                step="0.01" // Allow decimal points if needed
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Status</Form.Label>
                            <Form.Control
                                as="select"
                                name="status"
                                value={localEditService.status || 'Available'}
                                onChange={handleLocalChange}
                                required
                            >
                                <option value="Available">Available</option>
                                <option value="Unavailable">Unavailable</option>
                            </Form.Control>
                        </Form.Group>
                        <div className="button-container mt-3">
                            <Button variant="primary" type="submit" className="button">
                                Update
                            </Button>
                        </div>
                    </Form>
                ) : (
                    <div>Error: Service not found</div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default EditServicesModal;

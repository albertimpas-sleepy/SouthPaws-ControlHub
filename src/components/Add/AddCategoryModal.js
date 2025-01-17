import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import axios from 'axios';
import '../../assets/add.css';

const AddCategoryModal = ({ show, handleClose, onCategoryAdded }) => {
    const [inputs, setInputs] = useState({ name: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputs((prevInputs) => ({ ...prevInputs, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!inputs.name.trim()) {
            setError('Category name cannot be empty.');
            return;
        }

        setIsLoading(true);

        axios.post('http://localhost:80/api/category.php', { name: inputs.name })
            .then((response) => {
                if (response.data.status === 0) {
                    setError(response.data.message);
                    setIsLoading(false);
                } else {
                    handleClose();
                    if (typeof onCategoryAdded === 'function') {
                        onCategoryAdded();
                    }
                    setIsLoading(false);
                    setInputs({ name: '' }); // Reset inputs
                }
            })
            .catch(() => {
                setError('Failed to save category. Please try again.');
                setIsLoading(false);
            });
    };

    const handleModalClose = () => {
        setError(''); // Clear the error
        setInputs({ name: '' }); // Reset inputs
        handleClose(); // Call parent close handler
    };

    return (
        <Modal show={show} onHide={handleModalClose} className="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>Add Category</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group>
                        <Form.Label>Category Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="name"
                            value={inputs.name}
                            onChange={handleChange}
                            placeholder="Enter category name"
                        />
                    </Form.Group>
                    <div className="button-container">
                        <Button 
                            variant="primary" 
                            type="submit" 
                            className="button" 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Adding...' : 'Add'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddCategoryModal;

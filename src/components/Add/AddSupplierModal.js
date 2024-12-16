import React, { useState } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import '../../assets/add.css';

const AddSupplierModal = ({ show, handleClose, onSuppliersAdded }) => {
    const [inputs, setInputs] = useState({
        supplier_name: '',
        contact_number: '',
        email: '',
        address: '',
        contact_person: '',  // Added contact person field
        created_by: 'admin'  // Set this as needed
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputs((prevInputs) => ({ ...prevInputs, [name]: value }));
        // Clear error message when the user edits the Supplier Name field
        if (name === 'supplier_name') {
            setError(null);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        setIsLoading(true);

        axios.post('http://localhost:80/api/suppliers.php', inputs)
        .then((response) => {
                if (response.data.status === 0) {
                    setError('Supplier name already exists.');
                    setIsLoading(false);
                } else {
                    handleClose();
                    if (typeof onSuppliersAdded === 'function') {
                        onSuppliersAdded();
                    }                    
                    setIsLoading(false);
                    setInputs({ supplier_name: '', contact_number: '', email: '', address: '', contact_person: '', created_by: 'admin' });
                }
            })
            .catch((error) => {
                // Handle error when supplier name already exists
                if (error.response && error.response.status === 409) {
                    setError('Supplier name already exists.');
                } else {
                    setError('Failed to save supplier. Please try again.');
                }
                setIsLoading(false);
            });
    };

    return (
        <Modal show={show} onHide={handleClose} className="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>Add Supplier</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                    <div className="row">
                        {/* Left column */}
                        <div className="col-md-6">
                            <Form.Group>

                                <Form.Label>Supplier Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="supplier_name"
                                    value={inputs.supplier_name}
                                    onChange={handleChange}
                                    placeholder="Enter supplier name"
                                    required
                                />
                                <Form.Control.Feedback type="invalid">
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Contact Person</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="contact_person"
                                    value={inputs.contact_person}
                                    onChange={handleChange}
                                    placeholder="Enter contact person"
                                    required
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Contact Number</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="contact_number"
                                    value={inputs.contact_number}
                                    onChange={handleChange}
                                    placeholder="Enter contact number"
                                    required
                                />
                            </Form.Group>
                        </div>
                        {/* Right column */}
                        <div className="col-md-6">
                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={inputs.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                    required
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="address"
                                    value={inputs.address}
                                    onChange={handleChange}
                                    placeholder="Enter address"
                                    required
                                />
                            </Form.Group>
                        </div>
                    </div>
                    <div className="button-container">
                        <Button variant="primary" type="submit" className='button'>
                            Add
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddSupplierModal;

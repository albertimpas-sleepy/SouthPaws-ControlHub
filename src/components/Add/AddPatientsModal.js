import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import '../../assets/add.css';

const AddPatientsModal = ({ show, handleClose, client }) => {
    const [inputs, setInputs] = useState({});

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputs(prevInputs => ({ ...prevInputs, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        const userID = localStorage.getItem('userID');
        const formData = { ...inputs, created_by: userID, owner_id: client.id }; // Set owner_id to client.id

        axios.post('http://localhost:80/api/patients.php/save', formData)
            .then(response => {
                console.log(response.data);
                handleClose();
            })
            .catch(error => {
                console.error('Error saving patients:', error);
            });
    };

    return (
        <Modal show={show} onHide={handleClose} className="custom-modal" centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Add Patient</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit} className="row">
                    <div className="col-md-6">
                        <Form.Group controlId="formName">
                            <Form.Label>Name</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="name" 
                                onChange={handleChange} 
                                placeholder="Enter name" 
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formSpecies">
                            <Form.Label>Species</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="species" 
                                onChange={handleChange} 
                                placeholder="Enter species" 
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formBreed">
                            <Form.Label>Breed</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="breed" 
                                onChange={handleChange} 
                                placeholder="Enter breed" 
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formWeight">
                            <Form.Label>Weight</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="weight" 
                                onChange={handleChange} 
                                placeholder="Enter weight" 
                                required
                            />
                        </Form.Group>
                    </div>
                    <div className="col-md-6">
                        <Form.Group controlId="formAge">
                            <Form.Label>Age</Form.Label>
                            <Form.Control 
                                type="number" 
                                name="age" 
                                onChange={handleChange} 
                                placeholder="Enter age" 
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formBirthdate">
                            <Form.Label>Birthdate</Form.Label>
                            <Form.Control 
                                type="date" 
                                name="birthdate" 
                                onChange={handleChange} 
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formDistinctFeatures">
                            <Form.Label>Distinct Features</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="distinct_features" 
                                onChange={handleChange} 
                                placeholder="Enter distinct features" 
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="formOtherDetails">
                            <Form.Label>Other Details</Form.Label>
                            <Form.Control 
                                as="textarea" 
                                rows={3} 
                                name="other_details" 
                                onChange={handleChange} 
                                placeholder="Enter other details" 
                                required
                            />
                        </Form.Group>
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

export default AddPatientsModal;

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import '../../assets/add.css'; // Assuming you have custom styles

const EditPetModal = ({ show, handleClose, editPatient, handleEditChange, handleEditSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        species: '',
        breed: '',
        weight: '',
        age: '',
        birthdate: '',
        distinct_features: '',
        other_details: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (editPatient && Object.keys(editPatient).length > 0) {
            setFormData(editPatient); // Pre-fill formData with existing pet data
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [editPatient]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        handleEditChange(e); // Call parent function to handle real-time changes if needed
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        handleEditSubmit(formData); // Pass updated formData to parent component
        handleClose(); // Close modal after submitting
    };

    return (
        <Modal show={show} onHide={handleClose} className="custom-modal" centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Edit Pet</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div>Loading...</div>
                ) : formData && formData.name ? (
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            {/* Left Column */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter name"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Species</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="species"
                                        value={formData.species}
                                        onChange={handleChange}
                                        placeholder="Enter species"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Breed</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="breed"
                                        value={formData.breed}
                                        onChange={handleChange}
                                        placeholder="Enter breed"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Weight</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        placeholder="Enter weight"
                                    />
                                </Form.Group>
                            </Col>
                            {/* Right Column */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Age</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="Enter age"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Birthdate</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="birthdate"
                                        value={formData.birthdate}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Distinct Features</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="distinct_features"
                                        value={formData.distinct_features}
                                        onChange={handleChange}
                                        placeholder="Enter distinct features"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Other Details</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="other_details"
                                        value={formData.other_details}
                                        onChange={handleChange}
                                        placeholder="Enter other details"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        {/* Button Section */}
                        <div className="button-container text-center mt-4">
                            <Button variant="primary" type="submit" className="button">
                                Update
                            </Button>
                        </div>
                    </Form>
                ) : (
                    <div>Error: Pet not found</div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default EditPetModal;

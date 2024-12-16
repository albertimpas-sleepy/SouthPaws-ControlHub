import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import '../../assets/add.css'; // Assuming you have custom styles

const ViewPetModal = ({ show, handleClose, pet }) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (pet && Object.keys(pet).length > 0) {
            setLoading(false); // Assume the pet data is passed as a prop
        } else {
            setLoading(false);
        }
    }, [pet]);

    return (
        <Modal show={show} onHide={handleClose} className="custom-modal" centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Pet Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div>Loading...</div>
                ) : pet && pet.name ? (
                    <Form>
                        <Row>
                            {/* Left Column */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={pet.name}
                                        readOnly
                                        disabled
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Species</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="species"
                                        value={pet.species}
                                        readOnly
                                        disabled
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Breed</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="breed"
                                        value={pet.breed}
                                        readOnly
                                        disabled
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Weight</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="weight"
                                        value={pet.weight}
                                        readOnly
                                        disabled
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
                                        value={pet.age}
                                        readOnly
                                        disabled
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Birthdate</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="birthdate"
                                        value={pet.birthdate}
                                        readOnly
                                        disabled
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Distinct Features</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="distinct_features"
                                        value={pet.distinct_features}
                                        readOnly
                                        disabled
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Other Details</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="other_details"
                                        value={pet.other_details}
                                        readOnly
                                        disabled
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        {/* Button Section */}
                        <div className="button-container text-center mt-4">
                            <Button variant="secondary" onClick={handleClose} className='button'>
                                Close
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

export default ViewPetModal;

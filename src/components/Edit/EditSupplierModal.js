import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';
import '../../assets/add.css';

const EditSupplierModal = ({ show, handleClose, editSupplier, handleEditChange, handleEditSubmit, errorMessage }) => {
    const [supplier, setSupplier] = useState(editSupplier); // Initialize with editSupplier
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editSupplier && editSupplier.id) {
            setSupplier(editSupplier); // Set supplier data when editSupplier prop changes
            setLoading(false);
        } else {
            setLoading(false); // If no data, stop loading
        }
    }, [editSupplier]);

    return (
        <Modal show={show} onHide={handleClose} className="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>Edit Supplier</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div>Loading...</div>
                ) : supplier ? (
                    <Form onSubmit={handleEditSubmit}>
                     {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

                        <Row>
                            <Col md={6}>
                            
                                <Form.Group>
                                    <Form.Label>Supplier Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="supplier_name"
                                        value={supplier.supplier_name || ''}
                                        onChange={handleEditChange}
                                        placeholder="Enter supplier name"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Contact Person</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="contact_person"
                                        value={supplier.contact_person || ''}
                                        onChange={handleEditChange}
                                        placeholder="Enter contact person"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Contact Number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="contact_number"
                                        value={supplier.contact_number || ''}
                                        onChange={handleEditChange}
                                        placeholder="Enter contact number"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={supplier.email || ''}
                                        onChange={handleEditChange}
                                        placeholder="Enter email"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={supplier.address || ''}
                                        onChange={handleEditChange}
                                        placeholder="Enter address"
                                    />
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
                    <div>Error: Supplier not found</div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default EditSupplierModal;

import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import JsBarcode from 'jsbarcode';
import '../../assets/add.css';

const CreateProductModal = ({ show, handleClose, onProductAdded }) => {
    const [inputs, setInputs] = useState({});
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const barcodeRef = useRef(null);

    useEffect(() => {
        fetchCategories();
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (barcodeRef.current && inputs.sku) {
            JsBarcode(barcodeRef.current, inputs.sku, {
                format: "CODE128",
                displayValue: true,
                lineColor: "#000",
                width: 2,
                height: 50,
            });
        }
    }, [inputs.sku]);

    const fetchCategories = () => {
        axios
            .get('http://localhost:80/api/category.php')
            .then((response) => {
                setCategories(response.data.categories);
            })
            .catch((error) => {
                console.error('Error fetching categories:', error);
                setCategories([]);
            });
    };

    const fetchSuppliers = () => {
        axios
            .get('http://localhost:80/api/suppliers.php')
            .then((response) => {
                // Filter only suppliers with "Approved" status
                const approvedSuppliers = response.data.filter(supplier => supplier.status === 'Approved');
                setSuppliers(approvedSuppliers);
            })
            .catch((error) => {
                console.error('Error fetching suppliers:', error);
                setSuppliers([]);
            });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setInputs((prevInputs) => ({ ...prevInputs, [name]: value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        axios
            .post('http://localhost:80/api/products.php/save', inputs)
            .then(function (response) {
                handleClose();
                onProductAdded();
            })
            .catch(function (error) {
                console.error('Error saving product:', error);
            });
    };

    return (
        <Modal show={show} onHide={handleClose} className="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>Add Product</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    onChange={handleChange}
                                    placeholder="Enter product name"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Supplier</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="supplier_id"
                                    onChange={handleChange}
                                >
                                    <option value="">Select supplier</option>
                                    {Array.isArray(suppliers) && suppliers.length > 0 ? (
                                        suppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.supplier_name} (Status: {supplier.status})
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No approved suppliers available</option>
                                    )}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Price</Form.Label>
                                <Form.Control
                                    type="number"
                                    step="any"
                                    name="price"
                                    onChange={handleChange}
                                    placeholder="Enter price"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>SKU</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="sku"
                                    onChange={handleChange}
                                    placeholder="Enter SKU"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Brand</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="brand"
                                    onChange={handleChange}
                                    placeholder="Enter brand"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Category</Form.Label>
                                <Form.Control
                                    as="select"
                                    name="category_id"
                                    onChange={handleChange}
                                >
                                    <option value="">Select category</option>
                                    {Array.isArray(categories) && categories.length > 0 ? (
                                        categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>Loading categories...</option>
                                    )}
                                </Form.Control>
                            </Form.Group>

                            <Form.Group>
                                <Form.Label>Unit of Measurement</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="unit_of_measurement"
                                    onChange={handleChange}
                                    placeholder="Enter unit of measurement"
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Expiration Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="expiration_date"
                                    onChange={handleChange}
                                    placeholder="Enter expiration date"
                                />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row className="mt-3">
                        <Col md={12} className="text-center">
                            <Form.Group>
                                <Form.Label>Generated Barcode</Form.Label>
                                <div className="mt-2">
                                    <svg ref={barcodeRef} />
                                </div>
                            </Form.Group>
                        </Col>
                    </Row>
                    <div className="text-center">
                        <Button variant="primary" type="submit" className="button">
                            Add
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreateProductModal;

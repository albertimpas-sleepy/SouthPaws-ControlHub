import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import JsBarcode from 'jsbarcode'; // Import JsBarcode
import '../../assets/add.css';

const ViewProductModal = ({ show, handleClose, viewProduct }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const barcodeRef = useRef(null);  // Ref for the barcode

    useEffect(() => {
        if (viewProduct && (Array.isArray(viewProduct) ? viewProduct.length > 0 : Object.keys(viewProduct).length > 0)) {
            fetchCategories();
            setProduct(Array.isArray(viewProduct) ? viewProduct[0] : viewProduct); // Handle array or object
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [viewProduct]);

    useEffect(() => {
        // Ensure the barcode is generated only after the component is rendered and the product SKU is available
        if (product && barcodeRef.current && product.sku) {
            try {
                JsBarcode(barcodeRef.current, product.sku, {
                    format: "CODE128",
                    displayValue: true,
                    lineColor: "#000",
                    width: 2,
                    height: 50,
                });
            } catch (error) {
                console.error("Error generating barcode:", error);
            }
        }
    }, [product]);

    const fetchCategories = () => {
        axios
            .get('http://localhost:80/api/category.php')
            .then((response) => {
                console.log('Categories:', response.data);
                setCategories(response.data.categories); // Assuming categories are in response.data.categories
            })
            .catch((error) => {
                console.error('Error fetching categories:', error);
                setCategories([]);
            });
    };

    return (
        <Modal show={show} onHide={handleClose} className="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>Inventory Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div>Loading...</div>
                ) : product && product.name ? (
                    <Form>
                        <Row>
                            {/* Left column */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={product.name}
                                        readOnly
                                        disabled
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Brand</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="brand"
                                        value={product.brand}
                                        readOnly
                                        disabled
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>SKU</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="sku"
                                        value={product.sku}
                                        readOnly
                                        disabled
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Quantity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="quantity"
                                        value={product.quantity}
                                        readOnly
                                        disabled
                                    />
                                </Form.Group>
                            </Col>
                            {/* Right column */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Category</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="category_id"
                                        value={product.category_id}
                                        readOnly
                                        disabled
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
                                        value={product.unit_of_measurement}
                                        readOnly
                                        disabled
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Price</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="any"
                                        name="price"
                                        value={product.price}
                                        readOnly
                                        disabled
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Expiration Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="expiration_date"
                                        value={product.expiration_date}
                                        readOnly
                                        disabled
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        {/* Barcode Section */}
                        <Row className="mt-4">
                            <Col md={12} className="text-center">
                                <Form.Group>
                                    <Form.Label>Generated Barcode</Form.Label><br/>
                                    <svg ref={barcodeRef} />
                                </Form.Group>
                            </Col>
                        </Row>
                        <div className="button-container text-center mt-4">
                            <Button variant="secondary" onClick={handleClose} className='button'>
                                Close
                            </Button>
                        </div>
                    </Form>
                ) : (
                    <div>Error: Product not found</div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ViewProductModal;

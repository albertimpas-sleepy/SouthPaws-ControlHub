import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import BarcodePrint from './BarcodePrint'; // Import BarcodePrint component
import '../../assets/add.css';

const ViewProductModal = ({ show, handleClose, viewProduct }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [showQuantityDialog, setShowQuantityDialog] = useState(false); // State for showing quantity dialog
    const [barcodeQuantity, setBarcodeQuantity] = useState(1); // State for number of barcodes

    useEffect(() => {
        if (viewProduct && (Array.isArray(viewProduct) ? viewProduct.length > 0 : Object.keys(viewProduct).length > 0)) {
            fetchCategories();
            fetchSuppliers();
            setProduct(Array.isArray(viewProduct) ? viewProduct[0] : viewProduct); // Handle array or object
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [viewProduct]);

    const fetchCategories = () => {
        axios
            .get('http://localhost:80/api/category.php')
            .then((response) => {
                setCategories(response.data.categories); // Assuming categories are in response.data.categories
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
                setSuppliers(response.data); // Assuming suppliers are in response.data
            })
            .catch((error) => {
                console.error('Error fetching suppliers:', error);
                setSuppliers([]);
            });
    };

    const handlePrintBarcode = () => {
        setShowQuantityDialog(true); // Show the quantity dialog
    };

    const handlePrint = () => {
        if (barcodeQuantity <= 0) {
            alert('Please enter a valid number of barcodes.');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.open();
        printWindow.document.write(`
            <html>
            <head>
                <title>Print Barcode</title>
            </head>
            <body onload="window.print(); window.close();">
                ${Array.from({ length: barcodeQuantity }).map(() => `
                    <svg class="barcode"></svg>
                `).join('')}
                <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script>
                <script>
                    const sku = "${product.sku}";
                    document.querySelectorAll('.barcode').forEach(el => {
                        JsBarcode(el, sku, {
                            format: "CODE128",
                            displayValue: true,
                            lineColor: "#000",
                            width: 2,
                            height: 50,
                        });
                    });
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
        setShowQuantityDialog(false); // Close the quantity dialog after printing
    };

    return (
        <>
            <Modal show={show} onHide={handleClose} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Product Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loading ? (
                        <div>Loading...</div>
                    ) : product && product.name ? (
                        <Form>
                            <Row>
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
                                        <Form.Label>Supplier</Form.Label>
                                        <Form.Control
                                            as="select"
                                            name="supplier_id"
                                            value={product.supplier_id || ''}
                                            readOnly
                                            disabled
                                        >
                                            <option value="">Select supplier</option>
                                            {Array.isArray(suppliers) && suppliers.length > 0 ? (
                                                suppliers.map((supplier) => (
                                                    <option key={supplier.id} value={supplier.id}>
                                                        {supplier.supplier_name}
                                                    </option>
                                                ))
                                            ) : (
                                                <option disabled>Loading suppliers...</option>
                                            )}
                                        </Form.Control>
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
                                        <Form.Label>SKU</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="sku"
                                            value={product.sku}
                                            readOnly
                                            disabled
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
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
                            <Row className="mt-3">
                                <Col md={12} className="text-center">
                                    <Form.Group>
                                        <Form.Label>Generated Barcode</Form.Label>
                                        <div className="mt-2">
                                            <BarcodePrint sku={product.sku} /> {/* Display the barcode */}
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <div className="text-center mt-4">
                                <Button variant="secondary" onClick={handlePrintBarcode} className="button">
                                    Print Barcode
                                </Button>
                            </div>
                        </Form>
                    ) : (
                        <div>Error: Product not found</div>
                    )}
                </Modal.Body>
            </Modal>

            {/* Quantity Input Modal */}
            <Modal show={showQuantityDialog} onHide={() => setShowQuantityDialog(false)} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Enter Number of Barcodes</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Number of Barcodes</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                value={barcodeQuantity}
                                onChange={(e) => setBarcodeQuantity(parseInt(e.target.value, 10))}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowQuantityDialog(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handlePrint}>
                        Print
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ViewProductModal;

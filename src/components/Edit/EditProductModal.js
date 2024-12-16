import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import JsBarcode from 'jsbarcode';
import '../../assets/add.css';

const EditProductModal = ({ show, handleClose, editProduct, handleEditSubmit }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const barcodeRef = useRef(null); // Ref for the barcode

    useEffect(() => {
        if (editProduct && (Array.isArray(editProduct) ? editProduct.length > 0 : Object.keys(editProduct).length > 0)) {
            fetchCategories();
            fetchSuppliers();
            setProduct(Array.isArray(editProduct) ? editProduct[0] : editProduct);
            setLoading(false);
        } else {
            setLoading(false);
            setProduct(null); // Reset product to null if editProduct is invalid
        }
    }, [editProduct]);

    useEffect(() => {
        // Generate barcode when product SKU is available
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
    }, [product?.sku]); // Regenerate barcode when SKU changes

    const fetchCategories = () => {
        axios.get('http://localhost:80/api/category.php')
            .then((response) => {
                setCategories(response.data.categories || []);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduct(prevProduct => ({
            ...prevProduct,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!product || !product.name) {
            console.error('Product name is required');
            return;
        }

        axios.put('http://localhost:80/api/products.php', product)
            .then(response => {
                handleEditSubmit();
            })
            .catch(error => {
                console.error('Error updating product:', error);
            });
    };

    return (
        <Modal show={show} onHide={handleClose} className="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>Edit Product</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div>Loading...</div>
                ) : product ? (
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            {/* Left column */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={product.name || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter name"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Supplier</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="supplier_id"
                                        value={product.supplier_id || ''}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select supplier</option>
                                        {Array.isArray(suppliers) && suppliers.length > 0 ? (
                                            suppliers.map(supplier => (
                                                <option key={supplier.id} value={supplier.id}>
                                                    {supplier.supplier_name}
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
                                        value={product.price || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter price"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>SKU</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="sku"
                                        value={product.sku || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter SKU"
                                    />
                                </Form.Group>
                            </Col>
                            {/* Right column */}
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label>Brand</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="brand"
                                        value={product.brand || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter brand"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Category</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="category_id"
                                        value={product.category_id || ''}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Select category</option>
                                        {categories.length > 0 ? (
                                            categories.map(category => (
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
                                        value={product.unit_of_measurement || ''}
                                        onChange={handleInputChange}
                                        placeholder="Enter unit of measurement"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>Expiration Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="expiration_date"
                                        value={product.expiration_date || ''}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Barcode Section */}
                        <Row className="mt-4">
                            <Col md={12} className="text-center">
                                <Form.Group>
                                    <Form.Label>Generated Barcode</Form.Label>
                                    <div className="mt-2">
                                        <svg ref={barcodeRef} />
                                    </div>
                                </Form.Group>
                            </Col>
                        </Row>

                        <div className="text-center mt-4">
                            <Button variant="primary" type="submit" className='button'>
                                Update
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

export default EditProductModal;

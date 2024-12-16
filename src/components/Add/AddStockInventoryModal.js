import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import '../../assets/add.css';

const AddStockInventoryModal = ({ show, handleClose, editProduct, handleEditSubmit }) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (editProduct && (Array.isArray(editProduct) ? editProduct.length > 0 : Object.keys(editProduct).length > 0)) {
            setProduct(Array.isArray(editProduct) ? editProduct[0] : editProduct);
            setLoading(false);
        } else {
            setLoading(false);
            setProduct(null); // Reset product to null if editProduct is invalid
        }
    }, [editProduct]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProduct(prevProduct => ({
            ...prevProduct,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!product || !product.quantity) {
            // Handle the case where product name is missing
            console.error('Quantity is required');
            return;
        }

        axios.put('http://localhost:80/api/products.php', product)
            .then(response => {
                console.log('Product updated successfully:', response.data);
                handleEditSubmit();
            })
            .catch(error => {
                console.error('Error updating product:', error);
            });
    };

    return (
        <Modal show={show} onHide={handleClose} className="custom-modal">
            <Modal.Header closeButton>
                <Modal.Title>Add Stock</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div>Loading...</div>
                ) : product ? (
                    <Form onSubmit={handleSubmit}>
                        <Row>
                        
                                <Form.Group>
                                    <Form.Label>Quantity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="quantity"
                                        onChange={handleInputChange}
                                        placeholder="Enter quantity"
                                    />
                                </Form.Group>
                        
                        </Row>

                        <div className="button-container">
                            <Button variant="primary" type="submit" className='button'>
                                Add Stock
                            </Button>
                        </div>
                    </Form>
                ) : (
                    <div>Error: Inventory not found</div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default AddStockInventoryModal;

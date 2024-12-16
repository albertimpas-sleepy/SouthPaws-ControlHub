import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { Button, Table, Modal } from 'react-bootstrap';
import '../assets/table.css';
import Receipt from './Receipt';

const cartFromLocalStorage = JSON.parse(localStorage.getItem('cartItems') || '[]');

const PointofSales = () => {
    const [cartItems, setCartItems] = useState(cartFromLocalStorage);
    const [clients, setClients] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [barcode, setBarcode] = useState('');
    const [showReceipt, setShowReceipt] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showServicesTable, setShowServicesTable] = useState(false);
    const [services, setServices] = useState([]);
    const [receiptData, setReceiptData] = useState(null);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [changeAmount, setChangeAmount] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem('username') || ''); // Track logged-in user

    useEffect(() => {
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        fetchClients();
        fetchServices();
    }, []);

    const fetchClients = () => {
        axios.get('http://localhost:80/api/clients.php/')
            .then(response => {
                if (Array.isArray(response.data.clients)) {
                    setClients(response.data.clients);
                } else {
                    console.error('Invalid clients data:', response.data);
                }
            })
            .catch(error => {
                console.error('Error fetching clients:', error);
            });
    };

    const fetchServices = () => {
        axios.get('http://localhost:80/api/services.php')
            .then(response => {
                const availableServices = response.data.filter(service => service.status === 'available');
                setServices(availableServices);
            })
            .catch(error => {
                console.error('Error fetching services:', error);
            });
    };

    const handleBarcodeScan = (e) => {
        if (e.key === 'Enter') {
            axios.get(`http://localhost:80/api/products.php?sku=${barcode}`)
                .then(response => {
                    const product = response.data.product;
                    if (product) {
                        addProductToTable(product);
                        setBarcode('');
                    } else {
                        alert('Product not found!');
                    }
                })
                .catch(error => {
                    console.error('Error fetching product by barcode:', error);
                });
        }
    };

    const addProductToTable = (item) => {
        const existingItem = cartItems.find(cartItem => cartItem.id === item.id);
        if (existingItem) {
            const updatedItems = cartItems.map(cartItem =>
                cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
            );
            setCartItems(updatedItems);
        } else {
            setCartItems([...cartItems, { ...item, quantity: 1 }]);
        }
    };

    const addServiceToCart = (service) => {
        const existingService = cartItems.find(item => item.id === service.id && item.isService);
        if (!existingService) {
            setCartItems([...cartItems, { ...service, isService: true, quantity: 1 }]);
        }
    };

    const removeFromTable = (itemId) => {
        const updatedItems = cartItems.filter(item => item.id !== itemId);
        setCartItems(updatedItems);
    };

    const increaseQuantity = (itemId) => {
        const updatedItems = cartItems.map(item =>
            item.id === itemId && !item.isService ? { ...item, quantity: item.quantity + 1 } : item
        );
        setCartItems(updatedItems);
    };

    const decreaseQuantity = (itemId) => {
        const updatedItems = cartItems.map(item =>
            item.id === itemId && item.quantity > 1 && !item.isService
                ? { ...item, quantity: item.quantity - 1 }
                : item
        );
        setCartItems(updatedItems);
    };

    const calculateGrandTotal = () => {
        return cartItems.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
    };

    const handleConfirm = () => {
        const grandTotal = calculateGrandTotal();
        const change = parseFloat(paymentAmount) - grandTotal;
        setChangeAmount(change >= 0 ? change : null);
        setShowConfirmModal(true);
    };

    const handleConfirmYes = () => {
        const receiptData = {
            items: cartItems.map(item => ({
                name: item.name,
                quantity: item.isService ? 1 : item.quantity,
                price: item.price,
                total: (item.price * (item.isService ? 1 : item.quantity)).toFixed(2) // Ensure total is calculated
            })),
            client: selectedClient,
            grandTotal: calculateGrandTotal().toFixed(2),
            paymentAmount: paymentAmount,
            changeAmount: changeAmount?.toFixed(2),
            confirmedBy: loggedInUser // Add user who confirmed the order
        };

        // Save order to the database
        axios.post('http://localhost:80/api/orders.php', {
            client_id: selectedClient,
            items: receiptData.items,
            total_amount: calculateGrandTotal(),
            tax_amount: 0, 
            grand_total: calculateGrandTotal(),
            confirmed_by: loggedInUser // Send confirmedBy to the backend
        })
        .then(response => {
            console.log("Order saved successfully:", response.data);
            // Clear cart and save receipt data
            localStorage.removeItem('cartItems');
            setCartItems([]);
            setShowReceipt(true);
            setReceiptData(receiptData);
            setShowConfirmModal(false);
        })
        .catch(error => {
            console.error("Error saving order:", error);
        });
    };

    const handleConfirmNo = () => {
        setShowConfirmModal(false);
    };

    const handleUserSelect = (user) => {
        setLoggedInUser(user);
        localStorage.setItem('loggedInUser', user); // Save the selected user to localStorage
    };

    return (
        <div className='container mt-4'>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h1 style={{ fontWeight: 'bold' }}>Point of Sales</h1>
                <Button variant="info" style={{ backgroundImage: 'linear-gradient(to right, #006cb6, #31b44b)', color: '#ffffff' }} onClick={() => setShowServicesTable(!showServicesTable)}>
                    {showServicesTable ? 'Hide Services' : 'Show Services'}
                </Button>
            </div>

            {/* Select User (Logged-in User) */}
            <div className="mb-3">
                <label htmlFor="userSelect" className="form-label">Select User:</label>
                <select
                    id="userSelect"
                    className="form-select"
                    value={loggedInUser}
                    onChange={(e) => handleUserSelect(e.target.value)}
                >
                    <option value="">Select User</option>
                    <option value="John Doe">John Doe</option>
                    <option value="Jane Smith">Jane Smith</option>
                    {/* Add more users here */}
                </select>
            </div>

            {/* Select Client */}
            <div className="mb-3">
                <label htmlFor="clientSelect" className="form-label">Select Client:</label>
                <select
                    id="clientSelect"
                    className="form-select"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                >
                    <option value="">Select a client</option>
                    {clients.map((client, index) => (
                        <option key={index} value={client.id}>{client.name}</option>
                    ))}
                </select>
            </div>

            {/* Barcode Scan */}
            <div className="mb-3">
                <label htmlFor="barcodeInput">Scan SKU/Barcode:</label>
                <input
                    type="text"
                    id="barcodeInput"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyPress={handleBarcodeScan}
                    className="form-control"
                    placeholder="Enter or scan sku/barcode"
                />
            </div>

            {/* Show Services Table */}
            {showServicesTable && (
                <div className="table-responsive mb-3">
                    <h3>Available Services</h3>
                    <table className="table table-striped table-hover custom-table" style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th className="text-center">Service Name</th>
                                <th className="text-center">Price</th>
                                <th className="text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service, index) => (
                                <tr key={index}>
                                    <td className="text-center">{service.name}</td>
                                    <td className="text-center">₱{service.price}</td>
                                    <td className="text-center">
                                        <Button
                                            variant="success"
                                            size="sm"
                                            onClick={() => addServiceToCart(service)}
                                        >
                                            Add to Cart
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Cart Items Table */}
            <div className="table-responsive">
                <h3>Products/Services</h3>
                <table className="table table-striped table-hover custom-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th className="text-center">SKU</th>
                            <th className="text-center">Item</th>
                            <th className="text-center">Quantity</th>
                            <th className="text-center">Price</th>
                            <th className="text-center">Total</th>
                            <th className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cartItems.map((item, index) => (
                            <tr key={index}>
                                <td>{item.sku}</td>
                                <td>{item.name}</td>
                                <td className="text-center">
                                    <FaMinus className="pointer" onClick={() => decreaseQuantity(item.id)} />
                                    {item.quantity}
                                    <FaPlus className="pointer" onClick={() => increaseQuantity(item.id)} />
                                </td>
                                <td>₱{item.price}</td>
                                <td>₱{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                                <td className="text-center">
                                    <FaTrash className="pointer" onClick={() => removeFromTable(item.id)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Grand Total */}
            <div className="d-flex justify-content-between mt-3">
                <h3>Total: ₱{calculateGrandTotal().toFixed(2)}</h3>
            </div>

            {/* Payment Input */}
            <div className="mb-3 mt-4">
                <label htmlFor="paymentInput" className="form-label">Payment Amount (₱):</label>
                <input
                    type="number"
                    id="paymentInput"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="form-control"
                    placeholder="Enter amount to pay"
                />
            </div>

            {/* Confirm Payment Button */}
            <div className="d-flex justify-content-between mt-3">
                <Button variant="success" onClick={handleConfirm}>
                    Confirm Payment
                </Button>
            </div>

            {/* Confirmation Modal */}
            <Modal show={showConfirmModal} onHide={handleConfirmNo}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Payment</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p><strong>Grand Total: </strong>₱{calculateGrandTotal().toFixed(2)}</p>
                    <p><strong>Payment Amount: </strong>₱{paymentAmount}</p>
                    <p><strong>Change: </strong>₱{changeAmount !== null ? changeAmount.toFixed(2) : 'Insufficient Payment'}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleConfirmNo}>Cancel</Button>
                    <Button variant="primary" onClick={handleConfirmYes}>Confirm</Button>
                </Modal.Footer>
            </Modal>

            {/* Receipt Modal */}
            <Modal show={showReceipt} onHide={() => setShowReceipt(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Receipt</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Receipt receiptData={receiptData} />
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default PointofSales;

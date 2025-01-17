import React, { useEffect, useState } from 'react';
import { FaSearch, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';
import axios from 'axios';
import { Button, Modal, Pagination, OverlayTrigger, Tooltip } from 'react-bootstrap';
import '../assets/table.css';
import AddSupplierModal from '../components/Add/AddSupplierModal'; 
import EditSupplierModal from '../components/Edit/EditSupplierModal'; 
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 


const SupplierManagement = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [originalSuppliers, setOriginalSuppliers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [suppliersPerPage, setSuppliersPerPage] = useState(5);
    const [sortBy, setSortBy] = useState({ key: '', order: '' });
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [supplierIdToDelete, setSupplierIdToDelete] = useState(null);
    const [supplierIdToEdit, setSupplierIdToEdit] = useState(null);
    const [editSupplier, setEditSupplier] = useState({});
    const [editLoading, setEditLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [userRole, setUserRole] = useState({}); 
    const [errorMessage, setErrorMessage] = useState(''); // Add error message state
    

    const handleClose = () => setShowModal(false);
    const handleShow = () => setShowModal(true);

    const handleCloseEditModal = () => setShowEditModal(false);

    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const handleShowDeleteModal = (supplierId) => {
        setSupplierIdToDelete(supplierId);
        setShowDeleteModal(true);
    };

    useEffect(() => {
        getSuppliers();
    }, []);
    
    function getSuppliers() {
        axios.get('http://localhost:80/api/suppliers.php/')
            .then(function (response) {
                const suppliersData = response.data.suppliers || []; // Fallback to an empty array if no suppliers
                setSuppliers(suppliersData);
                setOriginalSuppliers(suppliersData); // Store original suppliers data
            })
            .catch(function (error) {
                setSuppliers([]); // Reset to empty array if there's an error
                setOriginalSuppliers([]);
            });
    }
    
    const deleteSupplier = (id) => {
        axios.delete(`http://localhost:80/api/suppliers.php/${id}`)
            .then(function (response) {
                getSuppliers();
                toast.success("Supplier deleted successfully!"); // Success toast for delete
            });
    }

    function handleFilter(event) {
        const searchText = event.target.value.toLowerCase();
        const newData = originalSuppliers.filter(row => {
            return (
                String(row.supplier_name).toLowerCase().includes(searchText) ||
                String(row.contact_number).toLowerCase().includes(searchText) ||
                String(row.email).toLowerCase().includes(searchText) ||
                String(row.address).toLowerCase().includes(searchText)
            );
        });
        setSuppliers(searchText ? newData : originalSuppliers);
    }

    // Get current suppliers
    const indexOfLastSupplier = currentPage * suppliersPerPage;
    const indexOfFirstSupplier = indexOfLastSupplier - suppliersPerPage;
    const currentSuppliers = suppliers.slice(indexOfFirstSupplier, indexOfLastSupplier);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Handle changing number of items per page
    const handlePerPageChange = (e) => {
        setCurrentPage(1); // Reset to the first page when changing items per page
        setSuppliersPerPage(Number(e.target.value));
    }

    // Sort table by column
    const handleSort = (key) => {
        let order = 'asc';
        if (sortBy.key === key && sortBy.order === 'asc') {
            order = 'desc';
        }
        setSortBy({ key: key, order: order });
        const sortedSuppliers = [...suppliers].sort((a, b) => {
            const valueA = typeof a[key] === 'string' ? a[key].toLowerCase() : a[key];
            const valueB = typeof b[key] === 'string' ? b[key].toLowerCase() : b[key];
            if (valueA < valueB) {
                return order === 'asc' ? -1 : 1;
            }
            if (valueA > valueB) {
                return order === 'asc' ? 1 : -1;
            }
            return 0;
        });
        setSuppliers(sortedSuppliers);
    }

    // Function to determine the icon based on the sorting order
    const getSortIcon = (key) => {
        if (sortBy.key === key) {
            return sortBy.order === 'asc' ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />;
        }
        return null;
    }

    const handleShowEditModal = (supplierId) => {
        setEditLoading(true); // Set loading state to true while fetching
        setErrorMessage(''); // Clear the error message

        axios.get(`http://localhost:80/api/suppliers.php/${supplierId}`)
            .then(response => {
                const supplierData = response.data.suppliers || response.data; // Get supplier data
                if (supplierData && supplierData.id) {
                    setEditSupplier(supplierData); // Set the supplier data to edit state
                    setEditLoading(false); // Set loading to false once data is fetched
                    setShowEditModal(true); // Show the modal
                } else {
                    console.error('Error: Supplier not found');
                    setEditLoading(false); // Set loading to false if no supplier is found
                }
            })
            .catch(error => {
                console.error('Error fetching supplier data:', error);
                setEditLoading(false); // Set loading to false in case of error
            });
    };
    

    const handleSuppliersAdded = () => {
        toast.success("Supplier added successfully!"); 
        getSuppliers(); 
    }

    const handleEditChange = (e) => {
        const { name, value } = e.target;  // Get the field name and its new value
        setEditSupplier(prevState => ({
            ...prevState,  // Spread the previous state to maintain other fields
            [name]: value  // Update the specific field that was changed
        }));
    };
    

    const handleEditSubmit = (event) => {
        event.preventDefault();
    
        // Check if the supplier ID exists
        if (!editSupplier.id) {
            console.error('Supplier ID is missing');
            return;
        }
    
        // Check if supplier name already exists in the list of suppliers
        const existingSupplier = suppliers.find(
            (supplier) => supplier.supplier_name.toLowerCase() === editSupplier.supplier_name.toLowerCase() && supplier.id !== editSupplier.id
        );
    
        if (existingSupplier) {
            setErrorMessage('Supplier name already exists'); // Show the error message
            return; // Prevent the update
        }
    
        // Proceed with updating the supplier
        axios.put(`http://localhost:80/api/suppliers.php/${editSupplier.id}`, editSupplier)
            .then(function (response) {
                if (response.data.status === 1) {
                    console.log("Update successful, response:", response); // Log the response from the server
                    handleCloseEditModal();
                    toast.success("Supplier updated successfully!"); // Success toast for update
                    getSuppliers(); // Refresh the list of suppliers after the update
                } else {
                    // If there's an error, set the error message to be displayed in the modal
                    setErrorMessage(response.data.message || 'Failed to update supplier');
                }
            })
            .catch(function (error) {
                console.error('Error updating Supplier:', error);
            });
    };
    
    

    useEffect(() => {
        if (showEditModal && supplierIdToEdit) {
            // Fetch the supplier data when the edit modal opens
            axios.get(`http://localhost:80/api/suppliers.php/${supplierIdToEdit}`)
                .then(function (response) {
                    const supplierData = response.data || {};  // Use response.data directly if it holds the supplier data
                    if (supplierData) {
                        console.log('Fetched Supplier Data:', supplierData); // Log the supplier data
                        setEditSupplier(supplierData); // Set the supplier data to edit
                        setEditLoading(false); // Set loading to false once data is fetched
                    } else {
                        console.error('Error: Supplier not found');
                        setEditLoading(false);
                    }
                })
                .catch(function (error) {
                    console.error('Error fetching Supplier:', error);
                    setEditLoading(false);
                });
        }
    }, [showEditModal, supplierIdToEdit]);
    
    

    return (
        <div className='container mt-4'>
            
            <h1 style={{ textAlign: 'left', fontWeight: 'bold' }}>Suppliers</h1>
            <div className='d-flex justify-content-between align-items-center'>
                <div className="input-group" style={{ width: '25%', marginBottom: '10px' }}>
                    <input type="text" className="form-control" onChange={handleFilter} placeholder="Search" />
                </div>
                <div className='text-end'>
                    {/* Show Add Supplier button only if user_role is not 1 */}
                    {userRole !== 1 && (
                        <Button onClick={handleShow} className='btn btn-primary w-100'
                            style={{
                                backgroundImage: 'linear-gradient(to right, #006cb6, #31b44b)',
                                color: '#ffffff', // Text color
                                borderColor: '#006cb6', // Border color
                                fontWeight: 'bold'
                            }}
                        >
                            Add Supplier
                        </Button>
                    )}
                </div>
            </div>
            <div className="table-responsive">
                <table className="table table-striped table-hover custom-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th className="col text-center" onClick={() => handleSort('supplier_name')}>
                                Supplier Name
                                {getSortIcon('supplier_name')}
                            </th>
                            <th className="col text-center" onClick={() => handleSort('contact_person')}>
                                Contact Person
                                {getSortIcon('contact_person')}
                            </th>
                            <th className="col text-center" onClick={() => handleSort('contact_number')}>
                                Contact Number
                                {getSortIcon('contact_number')}
                            </th>
                            <th className="col text-center" onClick={() => handleSort('email')}>
                                Email
                                {getSortIcon('email')}
                            </th>
                            <th className="col text-center" onClick={() => handleSort('address')}>
                                Address
                                {getSortIcon('address')}
                            </th>
                            {userRole !== 1 && (

                            <th className="col text-center">Action</th>
                        )}
                        </tr>
                    </thead>
                    <tbody>
                        {currentSuppliers.map((supplier, key) =>
                            <tr key={key}>
                                <td className="col text-center">{supplier.supplier_name}</td>
                                <td className="col text-center">{supplier.contact_person}</td>
                                <td className="col text-center">{supplier.contact_number}</td>
                                <td className="col text-center">{supplier.email}</td>
                                <td className="col text-center">{supplier.address}</td>
                                <td className="col text-center">
                                    {/* Show Edit and Delete buttons only if user_role is not 1 */}
                                    {userRole !== 1 && (
                                        <>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Edit</Tooltip>}>
                                    <Button onClick={() => handleShowEditModal(supplier.id)} className="btn btn-primary me-2 col-5"><FaEdit /></Button>
                                </OverlayTrigger>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>Delete </Tooltip>}>
                                        <button onClick={() => handleShowDeleteModal(supplier.id)} className="btn btn-danger me-2 col-5"><FaTrash /></button>
                                </OverlayTrigger>
                                        </>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="d-flex justify-content-between mb-3">
                <div className="d-flex align-items-center">
                    <div className="col-md-auto">
                        <label htmlFor="itemsPerPage" className="form-label me-2">Items per page:</label>
                    </div>
                    <div className="col-md-5">
                        <select id="itemsPerPage" className="form-select" value={suppliersPerPage} onChange={handlePerPageChange}>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="30">30</option>
                            <option value="50">50</option>
                        </select>
                    </div>
                </div>
                <Pagination>
                    {Array.from({ length: Math.ceil(suppliers.length / suppliersPerPage) }, (_, index) => (
                        <Pagination.Item key={index} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                            {index + 1}
                        </Pagination.Item>
                    ))}
                </Pagination>
            </div>
            <AddSupplierModal show={showModal} handleClose={handleClose} onSuppliersAdded={handleSuppliersAdded} />
            <EditSupplierModal
                show={showEditModal}
                handleClose={handleCloseEditModal}
                editSupplier={editSupplier} 
                handleEditChange={handleEditChange}
                handleEditSubmit={handleEditSubmit}
                errorMessage={errorMessage}  // Pass error message down as a prop
            />
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} className="custom-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this supplier?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => {
                        deleteSupplier(supplierIdToDelete);
                        handleCloseDeleteModal();
                    }}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer />
            
        </div>
    );
}

export default SupplierManagement;

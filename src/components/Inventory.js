import React, { useState, useEffect } from 'react';
import { FaPlus, FaList } from 'react-icons/fa';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';
import axios from 'axios';
import { Pagination, Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../assets/table.css';
import EditProductModal from '../components/Add/AddStockInventoryModal';
import ViewProductModal from '../components/View/ViewInventoryModal';

const Inventory = () => {
    const [products, setProducts] = useState([]);
    const [originalProducts, setOriginalProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage, setProductsPerPage] = useState(5);
    const [sortBy, setSortBy] = useState({ key: '', order: '' });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
    const [productIdToEdit, setProductIdToEdit] = useState(null);
    const [productDetails, setProductDetails] = useState(null);
    const [editProduct, setEditProduct] = useState({});

    const [userRole, setUserRole] = useState(null); // Add userRole state
    const navigate = useNavigate();

    useEffect(() => {
        const role = localStorage.getItem('userRole'); // Retrieve user role from localStorage
        setUserRole(role);
        getProducts();
    }, []);

    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const handleCloseEditModal = () => {
        setShowEditModal(false);
        navigate('/inventory');
    };

    const handleShowEditModal = (productId) => {
        setProductIdToEdit(productId);
        setShowEditModal(true);
    };

    const handleEditSubmit = () => {
        getProducts(); // Re-fetch products after editing
        setShowEditModal(false); // Close the modal
    };

    const handleCloseViewDetailsModal = () => {
        setShowViewDetailsModal(false);
        setProductDetails(null);
    };

    const handleShowViewDetailsModal = (productId) => {
        axios.get(`http://localhost:80/api/products.php/${productId}`)
            .then(response => {
                const productData = response.data.products;
                if (productData && Object.keys(productData).length > 0) {
                    setProductDetails(productData);
                    setShowViewDetailsModal(true);
                } else {
                    setProductDetails(null);
                    setShowViewDetailsModal(false);
                }
            })
            .catch(error => {
                setProductDetails(null);
                setShowViewDetailsModal(false);
            });
    };

    useEffect(() => {
        if (showEditModal && productIdToEdit) {
            axios.get(`http://localhost:80/api/products.php/${productIdToEdit}`)
                .then(response => {
                    const productData = response.data.products;
                    if (productData) {
                        setEditProduct(productData);
                    } else {
                        setEditProduct({});
                    }
                })
                .catch(error => {
                    setEditProduct({});
                });
        }
    }, [showEditModal, productIdToEdit]);

    const getProducts = () => {
        axios.get('http://localhost:80/api/products.php/')
            .then(response => {
                if (Array.isArray(response.data.products)) {
                    setProducts(response.data.products);
                    setOriginalProducts(response.data.products);
                }
            })
            .catch(error => {
                console.error('Error fetching products:', error);
            });
    };

    const deleteProduct = (id) => {
        axios.delete(`http://localhost:80/api/products.php/${id}/delete`)
            .then(response => {
                getProducts();
                handleCloseDeleteModal();
            })
            .catch(error => {
                console.error('Error deleting product:', error);
            });
    };

    const handleFilter = (event) => {
        const searchText = event.target.value.toLowerCase();
        const newData = originalProducts.filter(row => {
            return (
                String(row.name).toLowerCase().includes(searchText) ||
                String(row.id).toLowerCase().includes(searchText) ||
                String(row.created_by).toLowerCase().includes(searchText)
            );
        });
        setProducts(searchText ? newData : originalProducts);
    };

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handlePerPageChange = (e) => {
        setCurrentPage(1);
        setProductsPerPage(Number(e.target.value));
    };

    const handleSort = (key) => {
        let order = 'asc';
        if (sortBy.key === key && sortBy.order === 'asc') {
            order = 'desc';
        }
        setSortBy({ key: key, order: order });
        const sortedProducts = [...products].sort((a, b) => {
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
        setProducts(sortedProducts);
    };

    const getSortIcon = (key) => {
        if (sortBy.key === key) {
            return sortBy.order === 'asc' ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />;
        }
        return null;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-US').format(price);
    };

    const formatDate = (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString('en-US', options);
    };

    return (
        <div className='container mt-4'>
            <h1 style={{ textAlign: 'left', fontWeight: 'bold' }}>Inventory</h1>
            <div className='d-flex justify-content-between align-items-center'>
                <div className="input-group" style={{ width: '25%', marginBottom: '10px' }}>
                    <input type="text" className="form-control" onChange={handleFilter} placeholder="Search" />
                </div>
            </div>
            <div className="table-responsive">
                <table className="table table-striped table-hover custom-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th className="text-center" onClick={() => handleSort('id')}>
                                #
                                {getSortIcon('id')}
                            </th>
                            <th className="text-center" onClick={() => handleSort('sku')}>
                                SKU
                                {getSortIcon('sku')}
                            </th>
                            <th className="text-center" onClick={() => handleSort('name')}>
                                Name
                                {getSortIcon('name')}
                            </th>
                            <th className="text-center" onClick={() => handleSort('price')}>
                                Price
                                {getSortIcon('price')}
                            </th>
                            <th className="text-center" onClick={() => handleSort('quantity')}>
                                Quantity
                                {getSortIcon('quantity')}
                            </th>
                            <th className="text-center" onClick={() => handleSort('expiration_date')}>
                                Expiration Date
                                {getSortIcon('expiration_date')}
                            </th>
                            <th className="text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentProducts.map((product) =>
                            <tr key={product.id}>
                                <td className="text-center">{product.id}</td>
                                <td className="text-center">{product.sku}</td>
                                <td className="text-center">{product.name}</td>
                                <td className="text-center">₱{formatPrice(Number(product.price))}</td>
                                <td className="text-center">{product.quantity}</td>
                                <td className="text-center">{formatDate(product.expiration_date)}</td>
                                <td className="text-center">
                                    <div className="d-flex justify-content-center align-items-center">
                                        <Button
                                            onClick={() => handleShowViewDetailsModal(product.id)}
                                            className="btn btn-success me-2 col-4"
                                            style={{ fontSize: "1.1rem" }}
                                        >
                                            <FaList />
                                        </Button>
                                        {/* Only show edit button if the user_role is not 1 */}
                                        {userRole !== '1' && (
                                            <Button
                                                onClick={() => handleShowEditModal(product.id)}
                                                className="btn btn-primary me-2 col-4"
                                                style={{ fontSize: "1.1rem" }}
                                            >
                                                <FaPlus />
                                            </Button>
                                        )}
                                    </div>
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
                        <select id="itemsPerPage" className="form-select" value={productsPerPage} onChange={handlePerPageChange}>
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
                    {Array.from({ length: Math.ceil(products.length / productsPerPage) }, (_, index) => (
                        <Pagination.Item key={index} active={index + 1 === currentPage} onClick={() => paginate(index + 1)}>
                            {index + 1}
                        </Pagination.Item>
                    ))}
                </Pagination>
            </div>
            <EditProductModal
                show={showEditModal}
                handleClose={handleCloseEditModal}
                editProduct={editProduct}
                handleEditSubmit={handleEditSubmit}
            />
            <ViewProductModal
                show={showViewDetailsModal}
                handleClose={handleCloseViewDetailsModal}
                viewProduct={productDetails}
            />
        </div>
    );
}

export default Inventory;

import React, { useEffect, useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { AiOutlineArrowUp, AiOutlineArrowDown } from 'react-icons/ai';
import axios from "axios";
import { Pagination, Button, Modal, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify'; // Import Toastify
import '../assets/table.css'; 
import AddCategoryModal from '../components/Add/AddCategoryModal';
import EditCategoryModal from '../components/Edit/EditCategoryModal';

const Category = () => {
    const [categories, setCategories] = useState([]);
    const [originalCategories, setOriginalCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoriesPerPage, setCategoriesPerPage] = useState(5); 
    const [sortBy, setSortBy] = useState({ key: 'id', order: 'desc' }); // Default to descending by ID
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [categoryIdToDelete, setCategoryIdToDelete] = useState(null);
    const [editCategory, setEditCategory] = useState({});
    const [editLoading, setEditLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(''); // Add error message state
    const [userRole, setUserRole] = useState(null); // Store the user role

    useEffect(() => {
        const role = parseInt(localStorage.getItem('userRole'), 10);
        setUserRole(role);
        getCategories();
    }, []);

    const handleCloseAddModal = () => setShowAddModal(false);
    const handleShowAddModal = () => setShowAddModal(true);

    const handleCloseDeleteModal = () => setShowDeleteModal(false);
    const handleShowDeleteModal = (categoryId) => {
        setCategoryIdToDelete(categoryId);
        setShowDeleteModal(true);
    };

    const handleCloseEditModal = () => setShowEditModal(false);
    const handleShowEditModal = (categoryId) => {
        setErrorMessage(''); // Clear the error message
        setEditLoading(true);
        axios.get(`http://localhost:80/api/category.php/${categoryId}`)
            .then(response => {
                const categoryData = response.data.categories || response.data;
                if (categoryData && categoryData.id) {
                    setEditCategory(categoryData);
                    setEditLoading(false);
                    setShowEditModal(true);
                } else {
                    console.error('Error: Category not found');
                    setEditLoading(false);
                }
            })
            .catch(error => {
                console.error('Error fetching category:', error);
                setEditLoading(false);
            });
    };

    const getCategories = () => {
        axios.get('http://localhost:80/api/category.php/')
            .then(response => {
                if (Array.isArray(response.data.categories)) {
                    const fetchedCategories = response.data.categories;
                    const sortedCategories = sortCategories(fetchedCategories, 'id', 'desc'); // Sort by ID in descending order
                    setCategories(sortedCategories);
                    setOriginalCategories(fetchedCategories);
                } else {
                    console.error('Unexpected response structure: categories is not an array');
                }
            })
            .catch(error => {
                console.error('Error fetching categories:', error);
            });
    };

    const sortCategories = (categories, key, order) => {
        return [...categories].sort((a, b) => {
            if (key === 'id') {
                return order === 'asc' ? a.id - b.id : b.id - a.id;
            }

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
    };

    const deleteCategory = () => {
        axios.delete(`http://localhost:80/api/category.php/${categoryIdToDelete}`)
            .then(() => {
                getCategories();
                handleCloseDeleteModal();
                toast.success('Category deleted successfully!'); // Show success notification
            })
            .catch(error => {
                toast.error('Failed to delete category'); // Show error notification
            });
    };

    const handleFilter = (event) => {
        const searchText = event.target.value.toLowerCase();
        const newData = originalCategories.filter(row => 
            String(row.name).toLowerCase().includes(searchText) ||
            String(row.created_by).toLowerCase().includes(searchText)
        );
        setCategories(searchText ? newData : originalCategories);
    };

    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handlePerPageChange = (e) => {
        setCurrentPage(1);
        setCategoriesPerPage(Number(e.target.value));
    };

    const handleSort = (key) => {
        let order = 'asc';
        if (sortBy.key === key && sortBy.order === 'asc') {
            order = 'desc';
        }
        setSortBy({ key: key, order: order });
        const sortedCategories = sortCategories(categories, key, order);
        setCategories(sortedCategories);
    };

    const getSortIcon = (key) => {
        if (sortBy.key === key) {
            return sortBy.order === 'asc' ? <AiOutlineArrowUp /> : <AiOutlineArrowDown />;
        }
        return null;
    };

    const handleCategoryAdded = () => {
        getCategories();
        toast.success('Category added successfully!'); // Show success notification
    };

    const handleEditChange = (event) => {
        const { name, value } = event.target;
        setEditCategory(prevCategory => ({ ...prevCategory, [name]: value }));
    };

    const handleEditSubmit = (event) => {
        event.preventDefault();

        if (editCategory.name === '') {
            setErrorMessage('Category name cannot be empty.');
            return;
        }

        axios.put(`http://localhost:80/api/category.php/${editCategory.id}`, editCategory)
            .then((response) => {
                if (response.data.status === 1) {
                    handleCloseEditModal();
                    getCategories();
                    toast.success('Category updated successfully!'); // Show success notification
                } else {
                    // If there's an error, set the error message to be displayed in the modal
                    setErrorMessage(response.data.message || 'Failed to update category');
                }
            })
            .catch((error) => {
                console.error('Error updating category:', error);
                setErrorMessage('Failed to update category. Please try again.');
            });
    };

    return (
        <div className='container mt-4'>
            <h1 style={{ textAlign: 'left', fontWeight: 'bold' }}>Category</h1>
            <div className='d-flex justify-content-between align-items-center'>
                <div className="input-group" style={{ width: '25%', marginBottom: '10px' }}>
                    <input type="text" className="form-control" onChange={handleFilter} placeholder="Search" />
                </div>
                {userRole !== 1 && (
                    <div className='text-end'>
                        <Button onClick={handleShowAddModal} className='btn btn-primary w-100'
                        style={{
                            backgroundImage: 'linear-gradient(to right, #006cb6, #31b44b)',
                            color: '#ffffff', // Text color
                            borderColor: '#006cb6', // Border color
                            fontWeight: 'bold'
                        }}>
                            Add Category
                        </Button>
                    </div>
                )}
            </div>

            {/* Table and other components */}
            <div className="table-responsive">
                <table className="table table-striped table-hover custom-table" style={{ width: '100%' }}>
                    <thead>
                        <tr>
                            <th className="text-center" onClick={() => handleSort('id')}>
                                #
                                {getSortIcon('id')}
                            </th>
                            <th className="text-center" onClick={() => handleSort('name')}>
                                Name
                                {getSortIcon('name')}
                            </th>
                            {userRole !== 1 && (
                                <th className="text-center">Action</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {currentCategories.map((category, index) => {
                            const recentIndex = index + 1; // Start numbering from 1 for the current page
                            return (
                                <tr key={category.id}>
                                    <td className="text-center">{recentIndex}</td>
                                    <td className="text-center">{category.name}</td>
                                    {userRole !== 1 && (
                                        <td className="text-center">
                                            <div className="d-flex justify-content-center align-items-center">
                                            <OverlayTrigger
            placement="top"
            overlay={<Tooltip id={`edit-tooltip-${category.id}`}>Edit</Tooltip>}
          >
                                                <Button 
                                                    onClick={() => handleShowEditModal(category.id)}
                                                    className="btn btn-primary me-2 col-4" 
                                                    style={{ fontSize: ".9rem" }}
                                                >
                                                    <FaEdit />
                                                </Button>
                                                </OverlayTrigger>

                                                <OverlayTrigger
            placement="top"
            overlay={<Tooltip id={`delete-tooltip-${category.id}`}>Delete</Tooltip>}
          >
                                                <Button 
                                                    onClick={() => handleShowDeleteModal(category.id)} 
                                                    className="btn btn-danger me-2 col-4" 
                                                    style={{ fontSize: ".9rem" }}
                                                >
                                                    <FaTrash />
                                                </Button>
                                                </OverlayTrigger>

                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <Pagination>
                {Array.from({ length: Math.ceil(categories.length / categoriesPerPage) }).map((_, index) => (
                    <Pagination.Item 
                        key={index + 1} 
                        active={currentPage === index + 1} 
                        onClick={() => paginate(index + 1)}
                    >
                        {index + 1}
                    </Pagination.Item>
                ))}
            </Pagination>

            {/* Modals */}
            <AddCategoryModal 
                show={showAddModal} 
                handleClose={handleCloseAddModal} 
                onCategoryAdded={handleCategoryAdded} 
            />
            <EditCategoryModal
                show={showEditModal}
                handleClose={handleCloseEditModal}
                editCategory={editCategory}
                editLoading={editLoading}
                handleEditChange={handleEditChange}
                handleEditSubmit={handleEditSubmit}
                errorMessage={errorMessage}  
            />
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Category</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this category?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteModal}>
                        Close
                    </Button>
                    <Button variant="danger" onClick={deleteCategory}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer />
        </div>
    );
};

export default Category;

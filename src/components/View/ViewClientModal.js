import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Row, Col } from 'react-bootstrap';
import AddPatientsModal from '../Add/AddPatientsModal'; // Import the AddPatientsModal component
import ViewPetModal from './ViewPetModal'; // Import the ViewPetModal component
import EditPetModal from '../Edit/EditPetModal'; // Import the EditPetModal component
import { FaList, FaEdit, FaTrash } from 'react-icons/fa'; // Import icons
import axios from 'axios'; // Import axios for API calls

const ViewClientModal = ({ show, handleClose, client = {} }) => {  // Default client as an empty object
    const [showAddModal, setShowAddModal] = useState(false); // State for controlling the AddPatientsModal
    const [showPetDetailsModal, setShowPetDetailsModal] = useState(false); // State for viewing pet details
    const [showEditPetModal, setShowEditPetModal] = useState(false); // State for editing pet details
    const [showDeleteModal, setShowDeleteModal] = useState(false); // State for delete confirmation modal
    const [selectedPet, setSelectedPet] = useState(null); // State for holding the selected pet
    const [petList, setPetList] = useState([]); // State to hold the list of pets
    const [petIdToDelete, setPetIdToDelete] = useState(null); // State to hold the pet id for deletion

    useEffect(() => {
        // Only fetch pets if a client ID is available and modal is shown
        if (client?.id && show) {
            fetchPets();
        }
    }, [client, show]);

    const fetchPets = () => {
        // Check if client.id is available
        if (client?.id) {
            axios.get(`http://localhost:80/api/clients.php/${client.id}`)
                .then(response => {
                    console.log('API Response:', response.data); // Log the response to see the structure
                    const pets = response?.data?.clients[0]?.pet_details ? 
                        JSON.parse('[' + response.data.clients[0].pet_details + ']') : []; // Adjusted to parse the pet details JSON
                    if (Array.isArray(pets)) {
                        setPetList(pets); // Ensure petList is always an array
                    } else {
                        setPetList([]); // Set to empty array if no pets are found
                    }
                })
                .catch(error => {
                    console.error('Error fetching pets:', error);
                    setPetList([]); // Set to empty array on error
                });
        }
    };

    const handleAddModalClose = () => {
        setShowAddModal(false);
        fetchPets(); // Refresh pet data after adding a pet
    };

    const handleAddModalOpen = () => setShowAddModal(true);

    const handlePetDetailsModalClose = () => setShowPetDetailsModal(false);
    const handlePetDetailsModalOpen = (pet) => {
        setSelectedPet(pet);
        setShowPetDetailsModal(true);
    };

    const handleEditPetModalClose = () => {
        setShowEditPetModal(false);
        fetchPets(); // Refresh pet data after editing a pet
    };
    const handleEditPetModalOpen = (pet) => {
        setSelectedPet(pet);
        setShowEditPetModal(true);
    };

    const handleDeleteModalOpen = (petId) => {
        setPetIdToDelete(petId);
        setShowDeleteModal(true);
    };

    const handleDeleteModalClose = () => setShowDeleteModal(false);

    const deletePet = (petId) => {
        axios.delete(`http://localhost:80/api/patients.php/${petId}/delete`)
            .then(response => {
                console.log(response.data);
                fetchPets(); // Refresh pet data after deletion
                handleDeleteModalClose(); // Close the modal after deletion
            })
            .catch(error => console.error('Error deleting pet:', error));
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setSelectedPet({ ...selectedPet, [name]: value });
    };

    const handleEditSubmit = (updatedPet) => {
        console.log("Updated Pet:", updatedPet);
        // Make an API request to update the pet data on the server
        axios.put(`http://localhost:80/api/patients.php/${updatedPet.id}/update`, updatedPet)
            .then(response => {
                console.log('Pet updated successfully', response.data);
                fetchPets(); // Refresh pet data after submitting the update
            })
            .catch(error => {
                console.error('Error updating pet:', error);
            });
        setShowEditPetModal(false); // Close modal after submitting
    };
    

    return (
        <>
            <Modal show={show} onHide={handleClose} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Client Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col md={6}>
                            <p><strong>Name:</strong> {client?.name || 'N/A'}</p>
                            <p><strong>Address:</strong> {client?.address || 'N/A'}</p>
                        </Col>
                        <Col md={6}>
                            <p><strong>Age:</strong> {client?.age || 'N/A'}</p>
                            <p><strong>Gender:</strong> {client?.gender || 'N/A'}</p>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <p><strong>Cell Number:</strong> {client?.cellnumber || 'N/A'}</p>
                        </Col>
                        <Col md={6}>
                            <p><strong>Email:</strong> {client?.email || 'N/A'}</p>
                        </Col>
                    </Row>
                    <hr />
                    <p><strong>Pets:</strong></p>
                    {petList.length > 0 ? (
                        <ListGroup>
                            {petList.map((pet, index) => (
                                <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                                    <span>{pet.name}</span>
                                    <div className="d-flex justify-content-center align-items-center">
                                        <Button
                                            onClick={() => handlePetDetailsModalOpen(pet)}
                                            className="btn btn-success me-2 col-4"
                                            style={{ fontSize: ".9rem" }}
                                        >
                                            <FaList />
                                        </Button>
                                        <Button
                                            onClick={() => handleEditPetModalOpen(pet)}
                                            className="btn btn-primary me-2 col-4"
                                            style={{ fontSize: ".9rem" }}
                                        >
                                            <FaEdit />
                                        </Button>
                                        <Button
                                            onClick={() => handleDeleteModalOpen(pet.id)}
                                            className="btn btn-danger col-4"
                                            style={{ fontSize: ".9rem" }}
                                        >
                                            <FaTrash />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </ListGroup>
                    ) : (
                        <p>No pets available</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleAddModalOpen}>
                        Add Pet
                    </Button>
                </Modal.Footer>
            </Modal>

            <AddPatientsModal
                show={showAddModal}
                handleClose={handleAddModalClose}
                client={client} // Pass client details directly to AddPatientsModal
            />

            <ViewPetModal
                show={showPetDetailsModal}
                handleClose={handlePetDetailsModalClose}
                pet={selectedPet} // Pass the selected pet to the ViewPetModal
            />

            <EditPetModal
                show={showEditPetModal}
                handleClose={handleEditPetModalClose}
                editPatient={selectedPet} // Pass the selected pet for editing
                handleEditChange={handleEditChange} // Handle input changes
                handleEditSubmit={handleEditSubmit} // Handle form submission
            />

            <Modal show={showDeleteModal} onHide={handleDeleteModalClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this pet?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleDeleteModalClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => deletePet(petIdToDelete)}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ViewClientModal;

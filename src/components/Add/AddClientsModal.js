import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';
import '../../assets/add.css';

const AddClientAndPatientModal = ({ show, handleClose, onCategoryAdded }) => {
    const [clientInputs, setClientInputs] = useState({});
    const [patients, setPatients] = useState([{
        name: '',
        species: '',
        breed: '',
        weight: '',
        age: '',
        birthdate: '',
        distinct_features: '',
        other_details: ''
    }]);
    const [clients, setClients] = useState([]);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = () => {
        axios.get('http://localhost:80/api/clients.php')
            .then(response => {
                setClients(response.data.clients);
            })
            .catch(error => {
                console.error('Error fetching clients:', error);
            });
    };

    const handleClientChange = (event) => {
        const { name, value } = event.target;
        setClientInputs(prevInputs => ({ ...prevInputs, [name]: value }));
    };

    const handlePatientChange = (event, index) => {
        const { name, value } = event.target;
        const updatedPatients = [...patients];
        updatedPatients[index][name] = value;
        setPatients(updatedPatients);
    };

    const addNewPatient = () => {
        setPatients([
            ...patients,
            {
                name: '',
                species: '',
                breed: '',
                weight: '',
                age: '',
                birthdate: '',
                distinct_features: '',
                other_details: ''
            }
        ]);
    };

    const removePatient = (index) => {
        if (patients.length > 1) {
            const updatedPatients = patients.filter((_, i) => i !== index);
            setPatients(updatedPatients);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        const userID = localStorage.getItem('userID');
        
        // Prepare data for the client and patients
        const formData = {
            ...clientInputs,  // Client data
            created_by: userID,
            patients: patients.map(patient => ({
                ...patient,
                created_by: userID
            }))
        };
    
        try {
            // Send a single POST request to save both client and patients
            const response = await axios.post('http://localhost:80/api/clients.php', formData);
            
            if (response.data.status === 1) {
                // Successful submission
                handleClose();
                onCategoryAdded(); // Refresh the client list or perform any additional actions
            } else {
                console.error('Error saving client or patients:', response.data.message);
            }
        } catch (error) {
            console.error('Error saving client or patients:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} className="custom-modal" size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Add Client and Patient</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <h4>Client Information</h4>
                    <div className="row">
                        <div className="col-md-6">
                            <Form.Group>
                                <Form.Label>Name</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="name" 
                                    onChange={handleClientChange} 
                                    placeholder="Enter name" 
                                    required
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Address</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="address" 
                                    onChange={handleClientChange} 
                                    placeholder="Enter address" 
                                    required
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Mobile Number</Form.Label>
                                <Form.Control 
                                    type="text" 
                                    name="cellnumber" 
                                    onChange={handleClientChange} 
                                    placeholder="Enter mobile number" 
                                    required
                                />
                            </Form.Group>
                        </div>
                        <div className="col-md-6">
                            <Form.Group>
                                <Form.Label>Email</Form.Label>
                                <Form.Control 
                                    type="email" 
                                    name="email" 
                                    onChange={handleClientChange} 
                                    placeholder="Enter email" 
                                    required
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Age</Form.Label>
                                <Form.Control 
                                    type="number" 
                                    name="age" 
                                    onChange={handleClientChange} 
                                    placeholder="Enter age" 
                                    required
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Gender</Form.Label>
                                <Form.Control 
                                    as="select" 
                                    name="gender" 
                                    onChange={handleClientChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </Form.Control>
                            </Form.Group>
                        </div>
                    </div>

                    <hr />

                    <h4 className="d-flex justify-content-between align-items-center">
                        Patient Information
                        <Button variant="success" onClick={addNewPatient} className="sticky-button">Add Another Patient</Button>
                    </h4>
                    {patients.map((patient, index) => (
                        <div className="row" key={index}>
                            <div className="col-md-6">
                                <Form.Group controlId={`formName-${index}`}>
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="name" 
                                        value={patient.name}
                                        onChange={(event) => handlePatientChange(event, index)} 
                                        placeholder="Enter name" 
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId={`formSpecies-${index}`}>
                                    <Form.Label>Species</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="species" 
                                        value={patient.species}
                                        onChange={(event) => handlePatientChange(event, index)} 
                                        placeholder="Enter species" 
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId={`formBreed-${index}`}>
                                    <Form.Label>Breed</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="breed" 
                                        value={patient.breed}
                                        onChange={(event) => handlePatientChange(event, index)} 
                                        placeholder="Enter breed" 
                                    />
                                </Form.Group>
                                <Form.Group controlId={`formWeight-${index}`}>
                                    <Form.Label>Weight</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="weight" 
                                        value={patient.weight}
                                        onChange={(event) => handlePatientChange(event, index)} 
                                        placeholder="Enter weight" 
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group controlId={`formAge-${index}`}>
                                    <Form.Label>Age</Form.Label>
                                    <Form.Control 
                                        type="number" 
                                        name="age" 
                                        value={patient.age}
                                        onChange={(event) => handlePatientChange(event, index)} 
                                        placeholder="Enter age" 
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId={`formBirthdate-${index}`}>
                                    <Form.Label>Birthdate</Form.Label>
                                    <Form.Control 
                                        type="date" 
                                        name="birthdate" 
                                        value={patient.birthdate}
                                        onChange={(event) => handlePatientChange(event, index)} 
                                        required
                                    />
                                </Form.Group>
                                <Form.Group controlId={`formDistinctFeatures-${index}`}>
                                    <Form.Label>Distinct Features</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        name="distinct_features" 
                                        value={patient.distinct_features}
                                        onChange={(event) => handlePatientChange(event, index)} 
                                        placeholder="Enter distinct features" 
                                    />
                                </Form.Group>
                                <Form.Group controlId={`formOtherDetails-${index}`}>
                                    <Form.Label>Other Details</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={3} 
                                        name="other_details" 
                                        value={patient.other_details}
                                        onChange={(event) => handlePatientChange(event, index)} 
                                        placeholder="Enter other details" 
                                    />
                                </Form.Group>

                                {patients.length > 1 && (
                                    <Button 
                                        variant="danger" 
                                        onClick={() => removePatient(index)} 
                                        className="mt-3"
                                    >
                                        Remove Patient
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="button-container">
                        <Button variant="primary" type="submit" className='button'>
                            Add
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddClientAndPatientModal;

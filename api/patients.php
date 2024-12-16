<?php
session_start(); 
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

include 'DbConnect.php';
$objDB = new DbConnect;
$conn = $objDB->connect();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $sql = "SELECT patients.*, clients.name AS owner_name 
                FROM patients 
                LEFT JOIN clients ON patients.owner_id = clients.id";
    
        $path = explode('/', $_SERVER['REQUEST_URI']);
        
        if (isset($path[3]) && is_numeric($path[3])) {
            $clientId = intval($path[3]);
            $sql .= " WHERE patients.owner_id = :clientId"; // Fetch pets based on the owner ID
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':clientId', $clientId, PDO::PARAM_INT);
            
            if ($stmt->execute()) {
                $pets = $stmt->fetchAll(PDO::FETCH_ASSOC); // Fetch all patients (pets) for this client
                echo json_encode(['pets' => $pets]); // Return pets as a field in the response
            } else {
                echo json_encode(['error' => 'Failed to execute query']);
            }
        } else {
            $stmt = $conn->prepare($sql);
            
            if ($stmt->execute()) {
                $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
                echo json_encode(['patients' => $patients]);
            } else {
                echo json_encode(['error' => 'Failed to execute query']);
            }
        }
        break;
    
    case 'POST':
        $patients = json_decode(file_get_contents('php://input'));

        $sql = "INSERT INTO patients (owner_id, name, species, breed, age, birthdate, distinct_features, other_details, created_by, created_at) 
                VALUES (:owner_id, :name, :species, :breed, :age, :birthdate, :distinct_features, :other_details, :created_by, NOW())";
        $stmt = $conn->prepare($sql);

        $stmt->bindParam(':owner_id', $patients->owner_id);
        $stmt->bindParam(':name', $patients->name);
        $stmt->bindParam(':species', $patients->species);
        $stmt->bindParam(':breed', $patients->breed);
        $stmt->bindParam(':age', $patients->age);
        $stmt->bindParam(':birthdate', $patients->birthdate);
        $stmt->bindParam(':distinct_features', $patients->distinct_features);
        $stmt->bindParam(':other_details', $patients->other_details);
        $stmt->bindParam(':created_by', $patients->created_by);

        if ($stmt->execute()) {
            $response = ['status' => 1, 'message' => 'Record created successfully.'];
        } else {
            $response = ['status' => 0, 'message' => 'Failed to create record.'];
        }

        echo json_encode($response);
        break;

    case 'PUT':
        $patients = json_decode(file_get_contents('php://input'));
    
        $sql = "UPDATE patients SET 
                owner_id = :owner_id,
                name = :name, 
                species = :species, 
                breed = :breed, 
                age = :age, 
                birthdate = :birthdate, 
                distinct_features = :distinct_features, 
                other_details = :other_details 
                WHERE id = :id";
    
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':owner_id', $patients->owner_id);
        $stmt->bindParam(':name', $patients->name);
        $stmt->bindParam(':species', $patients->species);
        $stmt->bindParam(':breed', $patients->breed);
        $stmt->bindParam(':age', $patients->age);
        $stmt->bindParam(':birthdate', $patients->birthdate);
        $stmt->bindParam(':distinct_features', $patients->distinct_features);
        $stmt->bindParam(':other_details', $patients->other_details);
        $stmt->bindParam(':id', $patients->id);
    
        if($stmt->execute()) {
            $response = ['status' => 1, 'message' => 'Record updated successfully.'];
        } else {
            $response = ['status' => 0, 'message' => 'Failed to edit record.'];
        }
        echo json_encode($response);
        break;

    case 'DELETE':
        $sql = "DELETE FROM patients WHERE id = :id";
        $path = explode('/', $_SERVER['REQUEST_URI']);
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $path[3]);
        if($stmt->execute()) {
            $response = ['status' => 1, 'message' => 'Record deleted successfully.'];
        } else {
            $response = ['status' => 0, 'message' => 'Failed to delete record.'];
        }
        echo json_encode($response);
        break;
}
?>

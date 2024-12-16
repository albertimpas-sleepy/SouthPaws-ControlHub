<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

include 'DbConnect.php';
$objDB = new DbConnect;
$conn = $objDB->connect();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Counting total clients
        $sqlCount = "SELECT COUNT(*) AS total_clients FROM clients";
        $stmtCount = $conn->prepare($sqlCount);
        $stmtCount->execute();
        $resultCount = $stmtCount->fetch(PDO::FETCH_ASSOC);
        $total_clients = $resultCount['total_clients'];

        // Fetching clients data with pets
        $sqlClients = "SELECT clients.*, 
                      GROUP_CONCAT(
                          JSON_OBJECT(
                              'name', patients.name, 
                              'species', patients.species, 
                              'breed', patients.breed, 
                              'weight', patients.weight, 
                              'age', patients.age, 
                              'birthdate', patients.birthdate, 
                              'distinct_features', patients.distinct_features, 
                              'other_details', patients.other_details
                          ) SEPARATOR ', '
                      ) AS pet_details 
               FROM clients
               LEFT JOIN patients ON clients.id = patients.owner_id";

        $path = explode('/', $_SERVER['REQUEST_URI']);
        if (isset($path[3]) && is_numeric($path[3])) {
            $sqlClients .= " WHERE clients.id = :id";  // WHERE clause before GROUP BY
        }

        $sqlClients .= " GROUP BY clients.id";  // GROUP BY after WHERE clause

        if (isset($path[3]) && is_numeric($path[3])) {
            $stmtClients = $conn->prepare($sqlClients);
            $stmtClients->bindParam(':id', $path[3]);
            $stmtClients->execute();
            $clients = array($stmtClients->fetch(PDO::FETCH_ASSOC)); // Wrap single client in an array
        } else {
            $stmtClients = $conn->prepare($sqlClients);
            $stmtClients->execute();
            $clients = $stmtClients->fetchAll(PDO::FETCH_ASSOC);
        }

        // Constructing response
        $response = array(
            'total_clients' => $total_clients,
            'clients' => $clients
        );

        // Encode the response as JSON and send it to the client
        echo json_encode($response);
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true); // Decode JSON input

        try {
            // Start transaction
            $conn->beginTransaction();

            // Insert client
            $sqlClient = "INSERT INTO clients (name, address, cellnumber, email, age, gender, created_at, created_by) 
                          VALUES (:name, :address, :cellnumber, :email, :age, :gender, :created_at, :created_by)";
            $stmtClient = $conn->prepare($sqlClient);

            $created_at = date('Y-m-d H:i:s');
            $stmtClient->bindParam(':name', $data['name']);
            $stmtClient->bindParam(':address', $data['address']);
            $stmtClient->bindParam(':cellnumber', $data['cellnumber']);
            $stmtClient->bindParam(':email', $data['email']);
            $stmtClient->bindParam(':age', $data['age']);
            $stmtClient->bindParam(':gender', $data['gender']);
            $stmtClient->bindParam(':created_at', $created_at);
            $stmtClient->bindParam(':created_by', $data['created_by']);

            if ($stmtClient->execute()) {
                $client_id = $conn->lastInsertId(); // Get the new client ID

                // Insert patients if any
                if (!empty($data['patients'])) {
                    $sqlPatient = "INSERT INTO patients (owner_id, name, species, breed, weight, age, birthdate, distinct_features, other_details, created_by, created_at) 
                                   VALUES (:owner_id, :name, :species, :breed, :weight, :age, :birthdate, :distinct_features, :other_details, :created_by, :created_at)";
                    $stmtPatient = $conn->prepare($sqlPatient);

                    foreach ($data['patients'] as $patient) {
                        $stmtPatient->bindParam(':owner_id', $client_id);
                        $stmtPatient->bindParam(':name', $patient['name']);
                        $stmtPatient->bindParam(':species', $patient['species']);
                        $stmtPatient->bindParam(':breed', $patient['breed']);
                        $stmtPatient->bindParam(':weight', $patient['weight']);
                        $stmtPatient->bindParam(':age', $patient['age']);
                        $stmtPatient->bindParam(':birthdate', $patient['birthdate']);
                        $stmtPatient->bindParam(':distinct_features', $patient['distinct_features']);
                        $stmtPatient->bindParam(':other_details', $patient['other_details']);
                        $stmtPatient->bindParam(':created_by', $data['created_by']);
                        $stmtPatient->bindParam(':created_at', $created_at);

                        // Execute for each patient
                        $stmtPatient->execute();
                    }
                }

                // Commit the transaction
                $conn->commit();

                // Response
                $response = [
                    'status' => 1,
                    'message' => 'Client and patients added successfully.',
                    'client_id' => $client_id,
                ];
            } else {
                // Rollback if client insertion fails
                $conn->rollBack();
                $response = ['status' => 0, 'message' => 'Failed to add client.'];
            }
        } catch (Exception $e) {
            // Rollback transaction on error
            $conn->rollBack();
            $response = ['status' => 0, 'message' => 'An error occurred: ' . $e->getMessage()];
        }

        echo json_encode($response);
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true); // Decode JSON input as associative array
        $sql = "UPDATE clients SET 
                name = :name, 
                address = :address, 
                cellnumber = :cellnumber, 
                email = :email, 
                age = :age, 
                gender = :gender
                WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':name', $input['name']);
        $stmt->bindParam(':address', $input['address']);
        $stmt->bindParam(':cellnumber', $input['cellnumber']);
        $stmt->bindParam(':email', $input['email']);
        $stmt->bindParam(':age', $input['age']);
        $stmt->bindParam(':gender', $input['gender']);
        $stmt->bindParam(':id', $input['id']);
        if ($stmt->execute()) {
            $response = ['status' => 1, 'message' => 'Record updated successfully.'];
        } else {
            $response = ['status' => 0, 'message' => 'Failed to edit record.'];
        }
        echo json_encode($response);
        break;

        case 'DELETE':
            $path = explode('/', $_SERVER['REQUEST_URI']);
            $client_id = $path[3]; // Get client ID from URL path
        
            try {
                // Start a transaction to ensure atomicity
                $conn->beginTransaction();
        
                // First, delete associated patients
                $sqlDeletePatients = "DELETE FROM patients WHERE owner_id = :client_id";
                $stmtDeletePatients = $conn->prepare($sqlDeletePatients);
                $stmtDeletePatients->bindParam(':client_id', $client_id);
        
                if ($stmtDeletePatients->execute()) {
                    // Then, delete the client
                    $sqlDeleteClient = "DELETE FROM clients WHERE id = :client_id";
                    $stmtDeleteClient = $conn->prepare($sqlDeleteClient);
                    $stmtDeleteClient->bindParam(':client_id', $client_id);
        
                    if ($stmtDeleteClient->execute()) {
                        // Commit transaction if both deletions succeed
                        $conn->commit();
                        $response = ['status' => 1, 'message' => 'Record and associated patients deleted successfully.'];
                    } else {
                        // Rollback if client deletion fails
                        $conn->rollBack();
                        $response = ['status' => 0, 'message' => 'Failed to delete client.'];
                    }
                } else {
                    // Rollback if patients deletion fails
                    $conn->rollBack();
                    $response = ['status' => 0, 'message' => 'Failed to delete associated patients.'];
                }
            } catch (Exception $e) {
                // Rollback in case of any errors
                $conn->rollBack();
                $response = ['status' => 0, 'message' => 'An error occurred: ' . $e->getMessage()];
            }
        
            echo json_encode($response);
            break;
        
}
?>

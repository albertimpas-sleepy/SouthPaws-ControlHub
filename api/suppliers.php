<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Include database connection
include 'DbConnect.php';
$objDB = new DbConnect;
$conn = $objDB->connect();

$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight requests
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit;
}

try {
    switch ($method) {
        case 'GET':
            $sql = "SELECT id, supplier_name, contact_person, contact_number, email, address, created_at, created_by FROM suppliers";
            $path = explode('/', $_SERVER['REQUEST_URI']);
        
            // Check if a specific supplier is requested (based on the URL parameter)
            if (isset($path[3]) && is_numeric($path[3])) {
                $sql .= " WHERE id = :id";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(':id', $path[3], PDO::PARAM_INT);
                $stmt->execute();
                $suppliers = $stmt->fetch(PDO::FETCH_ASSOC);
        
                // Return just the supplier data (no count)
                echo json_encode(['suppliers' => $suppliers]);
            } else {
                // Fetch all suppliers
                $stmt = $conn->prepare($sql);
                $stmt->execute();
                $suppliers = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
                // Fetch total suppliers count (only when fetching all suppliers)
                $sqlCount = "SELECT COUNT(*) AS total_suppliers FROM suppliers";
                $stmtCount = $conn->prepare($sqlCount);
                $stmtCount->execute();
                $totalSuppliers = $stmtCount->fetch(PDO::FETCH_ASSOC)['total_suppliers'];
        
                // Return both suppliers and total count
                $response = [
                    'total_suppliers' => $totalSuppliers,
                    'suppliers' => $suppliers
                ];
                echo json_encode($response);
            }
            break;
        
        case 'POST':
            $supplier = json_decode(file_get_contents('php://input'), true);

            // Check if supplier name is provided
            if (!isset($supplier['supplier_name']) || empty($supplier['supplier_name'])) {
                http_response_code(400);
                echo json_encode(['status' => 0, 'message' => 'Supplier name is required.']);
                exit;
            }

            // Convert the supplier name to lowercase for case-insensitive check
            $supplierNameLower = strtolower($supplier['supplier_name']);

            // Check if supplier name exists (case-insensitive)
            $checkSql = "SELECT COUNT(*) AS count FROM suppliers WHERE LOWER(supplier_name) = :supplier_name";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->bindParam(':supplier_name', $supplierNameLower, PDO::PARAM_STR);
            $checkStmt->execute();
            $exists = $checkStmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;

            if ($exists) {
                http_response_code(409); // Conflict
                echo json_encode(['status' => 0, 'message' => 'Supplier name already exists.']);
                exit;
            }

            // Insert the new supplier
            $sqlInsert = "INSERT INTO suppliers (supplier_name, contact_person, contact_number, email, address, created_at, created_by) 
                          VALUES (:supplier_name, :contact_person, :contact_number, :email, :address, :created_at, :created_by)";
            $stmtInsert = $conn->prepare($sqlInsert);
            $created_at = date('Y-m-d H:i:s');
            $created_by = "admin"; // Adjust as needed
            $stmtInsert->bindParam(':supplier_name', $supplier['supplier_name'], PDO::PARAM_STR);
            $stmtInsert->bindParam(':contact_person', $supplier['contact_person'], PDO::PARAM_STR);
            $stmtInsert->bindParam(':contact_number', $supplier['contact_number'], PDO::PARAM_STR);
            $stmtInsert->bindParam(':email', $supplier['email'], PDO::PARAM_STR);
            $stmtInsert->bindParam(':address', $supplier['address'], PDO::PARAM_STR);
            $stmtInsert->bindParam(':created_at', $created_at);
            $stmtInsert->bindParam(':created_by', $created_by);

            if ($stmtInsert->execute()) {
                http_response_code(201); // Created
                echo json_encode(['status' => 1, 'message' => 'Supplier created successfully.']);
            } else {
                http_response_code(500); // Internal Server Error
                echo json_encode(['status' => 0, 'message' => 'Failed to create supplier.']);
            }
            break;

        case 'PUT':
            $supplier = json_decode(file_get_contents('php://input'), true);

            // Check if required fields are present
            if (!isset($supplier['id']) || !isset($supplier['contact_person'])) {
                http_response_code(400);
                echo json_encode(['status' => 0, 'message' => 'Invalid input data.']);
                exit;
            }

            // Convert the supplier name to lowercase for case-insensitive check (if updating supplier name)
            $supplierNameLower = strtolower($supplier['supplier_name']);

            // Check if the updated supplier name already exists (case-insensitive) except for the current supplier
            $checkSql = "SELECT COUNT(*) AS count FROM suppliers WHERE LOWER(supplier_name) = :supplier_name AND id != :id";
            $checkStmt = $conn->prepare($checkSql);
            $checkStmt->bindParam(':supplier_name', $supplierNameLower, PDO::PARAM_STR);
            $checkStmt->bindParam(':id', $supplier['id'], PDO::PARAM_INT);
            $checkStmt->execute();
            $exists = $checkStmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;

            if ($exists) {
                http_response_code(409); // Conflict
                echo json_encode(['status' => 0, 'message' => 'Supplier name already exists.']);
                exit;
            }

            // Prepare the SQL query to update supplier data
            $sql = "UPDATE suppliers 
                    SET supplier_name = :supplier_name, 
                        contact_person = :contact_person, 
                        contact_number = :contact_number, 
                        email = :email, 
                        address = :address 
                    WHERE id = :id";

            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':id', $supplier['id'], PDO::PARAM_INT);
            $stmt->bindParam(':supplier_name', $supplier['supplier_name'], PDO::PARAM_STR); // Keep the original casing for name
            $stmt->bindParam(':contact_person', $supplier['contact_person'], PDO::PARAM_STR);
            $stmt->bindParam(':contact_number', $supplier['contact_number'], PDO::PARAM_STR);
            $stmt->bindParam(':email', $supplier['email'], PDO::PARAM_STR);
            $stmt->bindParam(':address', $supplier['address'], PDO::PARAM_STR);

            // Execute the query
            if ($stmt->execute()) {
                echo json_encode(['status' => 1, 'message' => 'Supplier updated successfully.']);
            } else {
                http_response_code(500); // Internal Server Error
                echo json_encode(['status' => 0, 'message' => 'Failed to update supplier.']);
                error_log('Error executing update query: ' . print_r($stmt->errorInfo(), true));
            }
            break;

        case 'DELETE':
            $path = explode('/', $_SERVER['REQUEST_URI']);
            if (!isset($path[3]) || !is_numeric($path[3])) {
                http_response_code(400);
                echo json_encode(['status' => 0, 'message' => 'Invalid ID for deletion.']);
                exit;
            }

            $deletedId = $path[3];
            $conn->beginTransaction();

            try {
                // Delete the supplier
                $sqlDelete = "DELETE FROM suppliers WHERE id = :id";
                $stmtDelete = $conn->prepare($sqlDelete);
                $stmtDelete->bindParam(':id', $deletedId, PDO::PARAM_INT);
                $stmtDelete->execute();

                // Reassign IDs to avoid gaps
                $sqlReassignIDs = "SET @id = 0; UPDATE suppliers SET id = (@id := @id + 1) ORDER BY id";
                $conn->exec($sqlReassignIDs);

                $conn->commit();
                echo json_encode(['status' => 1, 'message' => 'Supplier deleted successfully.']);
            } catch (Exception $e) {
                $conn->rollBack();
                error_log("Failed to delete supplier: " . $e->getMessage());
                http_response_code(500);
                echo json_encode(['status' => 0, 'message' => 'Failed to delete supplier.']);
            }
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 0, 'message' => 'An error occurred: ' . $e->getMessage()]);
}
?>

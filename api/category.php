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

switch ($method) {
case 'GET':
    // Fetching categories data
    $sql = "SELECT * FROM categories ORDER BY id DESC"; // Fetch most recent first
    $path = explode('/', $_SERVER['REQUEST_URI']);
    if (isset($path[3]) && is_numeric($path[3])) {
        $sql = "SELECT * FROM categories WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $path[3]);
        $stmt->execute();
        $categories = $stmt->fetch(PDO::FETCH_ASSOC);
    } else {
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Counting total categories
    $sqlCount = "SELECT COUNT(*) AS total_categories FROM categories";
    $stmtCount = $conn->prepare($sqlCount);
    $stmtCount->execute();
    $resultCount = $stmtCount->fetch(PDO::FETCH_ASSOC);
    $total_categories = $resultCount['total_categories'];

    // Constructing response
    $response = array(
        'total_categories' => $total_categories,
        'categories' => $categories
    );

    echo json_encode($response);
    break;

case 'POST':
    $category = json_decode(file_get_contents('php://input'));

    // Convert the category name to lowercase to ensure case-insensitivity
    $categoryName = strtolower($category->name);

    // Start a transaction
    $conn->beginTransaction();

    try {
        // Check if the category name already exists (case-insensitive check)
        $sqlCheckName = "SELECT COUNT(*) FROM categories WHERE LOWER(name) = :name";
        $stmtCheckName = $conn->prepare($sqlCheckName);
        $stmtCheckName->bindParam(':name', $categoryName);
        $stmtCheckName->execute();
        $exists = $stmtCheckName->fetchColumn();

        if ($exists) {
            $response = ['status' => 0, 'message' => 'Category name already exists.'];
        } else {
            // Proceed with the insert if no duplicate name is found
            $sqlInsert = "INSERT INTO categories (name) VALUES (:name)";
            $stmtInsert = $conn->prepare($sqlInsert);
            $stmtInsert->bindParam(':name', $category->name);
            $stmtInsert->execute();

            // Commit transaction
            $conn->commit();

            // Fetch the newly added category
            $newCategoryId = $conn->lastInsertId();
            $sqlFetchNewCategory = "SELECT * FROM categories WHERE id = :id";
            $stmtFetchNewCategory = $conn->prepare($sqlFetchNewCategory);
            $stmtFetchNewCategory->bindParam(':id', $newCategoryId);
            $stmtFetchNewCategory->execute();
            $newCategory = $stmtFetchNewCategory->fetch(PDO::FETCH_ASSOC);

            $response = ['status' => 1, 'message' => 'Record created successfully.', 'new_category' => $newCategory];
        }
    } catch (Exception $e) {
        // Rollback transaction if there was an error
        $conn->rollBack();
        error_log("Failed to create record: " . $e->getMessage());
        $response = ['status' => 0, 'message' => 'Failed to create record.'];
    }

    echo json_encode($response);
    break;

case 'PUT':
    $category = json_decode(file_get_contents('php://input'));
    if (isset($category->id) && isset($category->name)) {
        // Convert the category name to lowercase for the case-insensitive check
        $categoryName = strtolower($category->name);

        // Start a transaction
        $conn->beginTransaction();

        try {
            // Check if the category name already exists (case-insensitive check)
            $sqlCheckName = "SELECT COUNT(*) FROM categories WHERE LOWER(name) = :name AND id != :id";
            $stmtCheckName = $conn->prepare($sqlCheckName);
            $stmtCheckName->bindParam(':name', $categoryName);
            $stmtCheckName->bindParam(':id', $category->id);
            $stmtCheckName->execute();
            $exists = $stmtCheckName->fetchColumn();

            if ($exists) {
                $response = ['status' => 0, 'message' => 'Category name already exists.'];
            } else {
                // Proceed with the update if no duplicate name is found
                $sql = "UPDATE categories SET name = :name WHERE id = :id";
                $stmt = $conn->prepare($sql);
                $stmt->bindParam(':id', $category->id);
                $stmt->bindParam(':name', $category->name);
                $stmt->execute();

                // Commit transaction
                $conn->commit();

                $response = ['status' => 1, 'message' => 'Record updated successfully.'];
            }
        } catch (Exception $e) {
            // Rollback transaction if there was an error
            $conn->rollBack();
            error_log("Failed to update record: " . $e->getMessage());
            $response = ['status' => 0, 'message' => 'Failed to update record.'];
        }
    } else {
        $response = ['status' => 0, 'message' => 'Invalid input data.'];
    }
    echo json_encode($response);
    break;


    case 'DELETE':
        $path = explode('/', $_SERVER['REQUEST_URI']);
        $deletedId = $path[3];
        
        // Start a transaction
        $conn->beginTransaction();

        try {
            // Delete the category
            $sqlDelete = "DELETE FROM categories WHERE id = :id";
            $stmtDelete = $conn->prepare($sqlDelete);
            $stmtDelete->bindParam(':id', $deletedId);
            $stmtDelete->execute();

            // Reassign IDs to avoid gaps and ensure they start from 1
            $sqlReassignIDs = "SET @id = 0; UPDATE categories SET id = (@id := @id + 1) ORDER BY id";
            $conn->exec($sqlReassignIDs);

            // Commit transaction
            $conn->commit();

            $response = ['status' => 1, 'message' => 'Record deleted successfully.'];
        } catch (Exception $e) {
            // Rollback transaction if there was an error
            $conn->rollBack();
            error_log("Failed to delete record: " . $e->getMessage());
            $response = ['status' => 0, 'message' => 'Failed to delete record.'];
        }

        echo json_encode($response);
        break;

    default:
        http_response_code(405);
        echo json_encode(['status' => 0, 'message' => 'Method not allowed.']);
        break;
}
?>

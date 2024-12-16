<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

// Include database connection
include 'DbConnect.php';
$objDB = new DbConnect;
$conn = $objDB->connect();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $orderData = json_decode(file_get_contents('php://input'), true);
    $orderId = $orderData['order_id'];
    $items = $orderData['items'];
    $clientId = isset($orderData['client_id']) ? $orderData['client_id'] : null;

    // Start transaction
    $conn->beginTransaction();

    try {
        foreach ($items as $item) {
            $productName = isset($item['name']) ? $item['name'] : 'Unknown Product';
            $quantity = isset($item['quantity']) ? floatval($item['quantity']) : 1.0; // Ensure quantity is a decimal
            $price = isset($item['price']) ? floatval($item['price']) : 0.0; // Ensure price is a decimal
            $total = $price * $quantity;

            // Log values for debugging
            error_log("Product Name: $productName");
            error_log("Quantity: $quantity");
            error_log("Price: $price");
            error_log("Total: $total");

            // Insert item into the order_items table
            $sqlInsert = "INSERT INTO order_items (order_id, product_name, quantity, price, total) 
                          VALUES (:order_id, :product_name, :quantity, :price, :total)";
            $stmtInsert = $conn->prepare($sqlInsert);
            $stmtInsert->bindParam(':order_id', $orderId);
            $stmtInsert->bindParam(':product_name', $productName);
            $stmtInsert->bindParam(':quantity', $quantity);
            $stmtInsert->bindParam(':price', $price);
            $stmtInsert->bindParam(':total', $total);
            $stmtInsert->execute();

            // If there's a client ID, update the client order history (example operation)
            if ($clientId) {
                // Example: update client order history or perform any other client-related operation
                // This part can be customized as needed
                // For example:
                // $sqlUpdateClientOrderHistory = "UPDATE clients SET last_order_date = NOW() WHERE id = :client_id";
                // $stmtUpdateClientOrderHistory = $conn->prepare($sqlUpdateClientOrderHistory);
                // $stmtUpdateClientOrderHistory->bindParam(':client_id', $clientId);
                // $stmtUpdateClientOrderHistory->execute();
            }
        }

        // Commit transaction
        $conn->commit();

        $response = ['status' => 1, 'message' => 'Order items added successfully.'];
    } catch (Exception $e) {
        // Rollback transaction if something went wrong
        $conn->rollBack();
        $response = ['status' => 0, 'message' => 'Failed to add order items: ' . $e->getMessage()];
    }

    echo json_encode($response);
} else {
    http_response_code(405);
    echo json_encode(['status' => 0, 'message' => 'Method not allowed.']);
}
?>

<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Include database connection
include 'DbConnect.php';
$objDB = new DbConnect;
$conn = $objDB->connect();

$method = $_SERVER['REQUEST_METHOD'];

// Handle preflight requests
if ($method === 'OPTIONS') {
    exit; // Stop further processing for OPTIONS requests
}

switch ($method) {
    case 'POST':
        $orderData = json_decode(file_get_contents('php://input'), true);
        $clientId = $orderData['client_id'] ?? null;
        $totalAmount = $orderData['total_amount'];
        $taxAmount = $orderData['tax_amount'];
        $grandTotal = $orderData['grand_total'];
        $confirmedBy = $orderData['confirmed_by']; // Retrieve the internal user who confirmed the order
        $items = $orderData['items']; // Array of items (products/services) ordered

        // Start transaction
        $conn->beginTransaction();

        try {
            // Insert new order into the orders table
            $sqlInsertOrder = "INSERT INTO orders (client_id, order_date, total_amount, tax_amount, grand_total, confirmed_by) 
                               VALUES (:client_id, NOW(), :total_amount, :tax_amount, :grand_total, :confirmed_by)";
            $stmtInsertOrder = $conn->prepare($sqlInsertOrder);
            $stmtInsertOrder->bindParam(':client_id', $clientId, PDO::PARAM_INT);
            $stmtInsertOrder->bindParam(':total_amount', $totalAmount);
            $stmtInsertOrder->bindParam(':tax_amount', $taxAmount);
            $stmtInsertOrder->bindParam(':grand_total', $grandTotal);
            $stmtInsertOrder->bindParam(':confirmed_by', $confirmedBy);
            $stmtInsertOrder->execute();

            // Get the last inserted order ID
            $orderId = $conn->lastInsertId();

            // Insert order items into order_items table
            foreach ($items as $item) {
                $sqlInsertOrderItem = "INSERT INTO order_items (order_id, product_name, quantity, price, total) 
                                       VALUES (:order_id, :product_name, :quantity, :price, :total)";
                $stmtInsertOrderItem = $conn->prepare($sqlInsertOrderItem);
                $stmtInsertOrderItem->bindParam(':order_id', $orderId);
                $stmtInsertOrderItem->bindParam(':product_name', $item['name']);
                $stmtInsertOrderItem->bindParam(':quantity', $item['quantity']);
                $stmtInsertOrderItem->bindParam(':price', $item['price']);
                $stmtInsertOrderItem->bindParam(':total', $item['total']);
                $stmtInsertOrderItem->execute();

                // Update the product quantity in the products table
                $sqlUpdateProduct = "UPDATE products SET quantity = quantity - :quantity WHERE name = :product_name";
                $stmtUpdateProduct = $conn->prepare($sqlUpdateProduct);
                $stmtUpdateProduct->bindParam(':quantity', $item['quantity']);
                $stmtUpdateProduct->bindParam(':product_name', $item['name']);
                $stmtUpdateProduct->execute();
            }

            // Commit transaction
            $conn->commit();

            $response = ['status' => 1, 'message' => 'Order created successfully and product stock updated.'];
        } catch (Exception $e) {
            // Rollback transaction if something went wrong
            $conn->rollBack();
            $response = ['status' => 0, 'message' => 'Failed to create order: ' . $e->getMessage()];
        }

        echo json_encode($response);
        break;

    case 'GET':
        $sql = "SELECT 
                    orders.id AS order_id, 
                    IFNULL(clients.name, 'Guest') AS client_name, 
                    orders.order_date, 
                    orders.total_amount, 
                    orders.tax_amount, 
                    orders.grand_total, 
                    orders.confirmed_by,
                    order_items.product_name,
                    order_items.quantity,
                    order_items.price,
                    order_items.total
                FROM 
                    orders
                LEFT JOIN 
                    clients ON orders.client_id = clients.id
                LEFT JOIN 
                    order_items ON orders.id = order_items.order_id";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($orders);
        break;

    default:
        http_response_code(405);
        echo json_encode(['status' => 0, 'message' => 'Method not allowed']);
        break;
}
?>

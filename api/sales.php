<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

// Include database connection
include 'DbConnect.php';
$objDB = new DbConnect;
$conn = $objDB->connect();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Modified SQL query to include orders with client_id = 0
    $sql = "SELECT 
                orders.id AS order_id, 
                clients.name AS client_name, 
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
            JOIN 
                order_items ON orders.id = order_items.order_id
            WHERE 
                orders.client_id = 0 OR orders.client_id IS NOT NULL";
                
    $stmt = $conn->prepare($sql);
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($orders);
} else {
    http_response_code(405);
    echo json_encode(['status' => 0, 'message' => 'Method not allowed.']);
}
?>

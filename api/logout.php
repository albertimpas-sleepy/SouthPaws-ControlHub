<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: POST");

include 'DbConnect.php';
$objDB = new DbConnect;
$conn = $objDB->connect();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $user = json_decode(file_get_contents('php://input'));

    if (!empty($user->user_id)) {
        // Check if the logged-in user is a super admin (user_role = 3)
        if ($user->user_role !== 3) {
            // If not super admin, log the logout event in the database
            $logSql = "INSERT INTO user_logs (user_id, event_type) VALUES (:user_id, 'logout')";
            $logStmt = $conn->prepare($logSql);
            $logStmt->bindParam(':user_id', $user->user_id);
            $logStmt->execute();
        }

        // Destroy the session or handle other logout operations
        session_start();
        session_unset(); // Clear session variables
        session_destroy(); // Destroy session

        echo json_encode([
            'status' => 1,
            'message' => 'Logout successful.'
        ]);
    } else {
        echo json_encode([
            'status' => 0,
            'message' => 'Missing user ID.'
        ]);
    }
}
?>

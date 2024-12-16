<?php
include 'DbConnect.php';
$objDB = new DbConnect;
$conn = $objDB->connect();

header('Content-Type: application/json'); // Set header for JSON response

if (isset($_GET['token'])) {
    $token = filter_var($_GET['token'], FILTER_SANITIZE_STRING); // Sanitize token input

    // Fetch user based on token and verify they haven't already verified their email
    $sql = "SELECT id, verification_token_created_at FROM internal_users WHERE verification_token = :token AND is_verified = 0";
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':token', $token);
    $stmt->execute();
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user) {
        // Check if token has expired (e.g., 24 hours)
        $expirationTime = 24 * 60 * 60; // 24 hours
        $createdAt = strtotime($user['verification_token_created_at']);
        if ((time() - $createdAt) > $expirationTime) {
            // Redirect to an error page if the token has expired
            header('Location: http://localhost:3000/login?message=Token%20Expired');
            exit;
        }

        // Update the user's verification status
        $updateSql = "UPDATE internal_users SET is_verified = 1, verification_token = NULL WHERE id = :id";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bindParam(':id', $user['id']);
        $updateStmt->execute();

        // Redirect to login page after successful verification with a success message
        header('Location: http://localhost:3000/login?message=Verification%20Successful');
        exit;
    } else {
        // Redirect to an error page if the token is invalid or already used
        header('Location: http://localhost:3000/login?message=Invalid%20or%20Expired%20Token');
        exit;
    }
} else {
    // If no token is provided, return an error
    header('Location: http://localhost:3000/login?message=Missing%20Verification%20Token');
    exit;
}
?>

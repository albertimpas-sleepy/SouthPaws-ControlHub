<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

include 'DbConnect.php';
require 'vendor/autoload.php';  // Include the Mailjet SDK (make sure you have Mailjet installed via Composer)

use \Mailjet\Resources;

$objDB = new DbConnect;
$conn = $objDB->connect();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        $user = json_decode(file_get_contents('php://input'));
        $email = $user->email;

        // Check if the email exists in the database
        $sql = "SELECT * FROM internal_users WHERE email = :email";
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $userData = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($userData) {
            // Generate a password reset token (You should store this in your database for verification)
            $resetToken = bin2hex(random_bytes(16)); // Random token for password reset
            $resetLink = "http://localhost:3000/reset-password?token=$resetToken";  // Corrected local password reset URL

            // You can store the reset token in the database with an expiration time (e.g. 1 hour)
            $sql = "UPDATE internal_users SET reset_token = :reset_token WHERE email = :email";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':reset_token', $resetToken);
            $stmt->bindParam(':email', $email);
            $stmt->execute();

            // Send the password reset link via email using Mailjet
            $mj = new \Mailjet\Client('17795a92aad6c702cbf9f10a8077aa12', '53ac4944d95b648de906a9bdddf03de9', true, ['version' => 'v3.1']);
            $body = [
                'Messages' => [
                    [
                        'From' => [
                            'Email' => 'alfr.impas.swu@phinmaed.com',  // Your "From" email address (must be verified in Mailjet)
                            'Name' => 'SouthPaws'         // Your Company Name
                        ],
                        'To' => [
                            [
                                'Email' => $email
                            ]
                        ],
                        'Subject' => 'Password Reset Request',
                        'TextPart' => 'Click the link below to reset your password: ' . $resetLink,
                        'HTMLPart' => '<p>Click the link below to reset your password:</p><p><a href="' . $resetLink . '">Reset Password</a></p>',
                    ]
                ]
            ];

            $response = $mj->post(Resources::$Email, ['body' => $body]);

            // Check the response from Mailjet
            if ($response->success()) {
                echo json_encode(['status' => 1, 'message' => 'A password reset link has been sent to your email.']);
            } else {
                echo json_encode(['status' => 0, 'message' => 'Failed to send email.']);
            }
        } else {
            echo json_encode(['status' => 0, 'message' => 'Email not found.']);
        }
        break;
}
?>

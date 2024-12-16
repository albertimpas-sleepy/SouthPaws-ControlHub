<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Methods: *");

include 'DbConnect.php';
$objDB = new DbConnect;
$conn = $objDB->connect();

// Import Mailjet's API client library
require 'vendor/autoload.php';  // Ensure Composer autoloader is loaded

use \Mailjet\Resources;

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // If the token is provided, handle account verification
        if (isset($_GET['token'])) {
            $token = $_GET['token'];
    
            // Check if the token exists in the database and if the account is not verified yet
            $sql = "SELECT id, verification_token_created_at FROM internal_users WHERE verification_token = :token AND is_verified = 0";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':token', $token);
            $stmt->execute();
    
            if ($stmt->rowCount() > 0) {
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
                // Check if the token has expired (24-hour validity)
                $expirationTime = 24 * 60 * 60; // 24 hours in seconds
                $createdAt = strtotime($user['verification_token_created_at']);
                if ((time() - $createdAt) > $expirationTime) {
                    $response = ['status' => 0, 'message' => 'Verification token has expired.'];
                } else {
                    // Update the user's status to verified
                    $updateSql = "UPDATE internal_users SET is_verified = 1, verification_token = NULL, verification_token_created_at = NULL WHERE verification_token = :token";
                    $updateStmt = $conn->prepare($updateSql);
                    $updateStmt->bindParam(':token', $token);
                    if ($updateStmt->execute()) {
                        $response = ['status' => 1, 'message' => 'Account verified successfully.'];
                    } else {
                        $response = ['status' => 0, 'message' => 'Failed to verify account.'];
                    }
                }
            } else {
                $response = ['status' => 0, 'message' => 'Invalid or expired token.'];
            }
    
            echo json_encode($response);
            break;
        }
    
        // If the token is not provided, return the list of internal users
        $sql = "SELECT id, email, first_name, last_name, user_role, created_at, is_verified FROM internal_users";
        $path = explode('/', $_SERVER['REQUEST_URI']);
        if (isset($path[3]) && is_numeric($path[3])) {
            // Fetch details for a specific user by ID
            $sql .= " WHERE id = :id";
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':id', $path[3]);
            $stmt->execute();
            $users = $stmt->fetch(PDO::FETCH_ASSOC);
        } else {
            // Fetch the list of all users
            $stmt = $conn->prepare($sql);
            $stmt->execute();
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        }
    
        echo json_encode($users);
        break;
    

    case 'POST':
        $user = json_decode(file_get_contents('php://input'));

        // Validate input fields
        if (empty($user->email) || empty($user->first_name) || empty($user->password)) {
            echo json_encode(['status' => 0, 'message' => 'Required fields are missing.']);
            break;
        }

        // Validate email format
        if (!filter_var($user->email, FILTER_VALIDATE_EMAIL)) {
            echo json_encode(['status' => 0, 'message' => 'Invalid email format.']);
            break;
        }

        // Hash the password
        $hashedPassword = password_hash($user->password, PASSWORD_BCRYPT);

        // Check if email already exists
        $checkEmailSql = "SELECT COUNT(*) as count FROM internal_users WHERE email = :email";
        $checkStmt = $conn->prepare($checkEmailSql);
        $checkStmt->bindParam(':email', $user->email);
        $checkStmt->execute();
        $emailExists = $checkStmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;

        if ($emailExists) {
            echo json_encode(['status' => 0, 'message' => 'Email already exists.']);
            break;
        }

        // Insert the user into the database
        $verificationToken = bin2hex(random_bytes(16)); // Generate a secure token
        $verificationTokenCreatedAt = date('Y-m-d H:i:s'); // Current timestamp
        $sql = "INSERT INTO internal_users(email, first_name, last_name, password, user_role, created_at, is_verified, verification_token, verification_token_created_at) 
                VALUES (:email, :first_name, :last_name, :password, :user_role, :created_at, 0, :verification_token, :verification_token_created_at)";
        $stmt = $conn->prepare($sql);
        $created_at = date('Y-m-d H:i:s');
        $stmt->bindParam(':email', $user->email);
        $stmt->bindParam(':first_name', $user->first_name);
        $stmt->bindParam(':last_name', $user->last_name);
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':user_role', $user->user_role);
        $stmt->bindParam(':created_at', $created_at);
        $stmt->bindParam(':verification_token', $verificationToken);
        $stmt->bindParam(':verification_token_created_at', $verificationTokenCreatedAt);

        if ($stmt->execute()) {
            // Send welcome email using Mailjet
            try {
                // Initialize Mailjet Client with your API Key and Secret
                $mj = new \Mailjet\Client('17795a92aad6c702cbf9f10a8077aa12', '53ac4944d95b648de906a9bdddf03de9', true, ['version' => 'v3.1']);

                // Prepare the email content with the user's email and password
                $verificationLink = "http://localhost:80/api/verify.php?token=$verificationToken";

                    $body = [
                        'Messages' => [
                            [
                                'From' => [
                                    'Email' => 'alfr.impas.swu@phinmaed.com',
                                    'Name' => 'SouthPaws'
                                ],
                                'To' => [
                                    [
                                        'Email' => $user->email
                                    ]
                                ],
                                'Subject' => 'Verify Your Account',
                                'HTMLPart' => "<h1>Welcome, {$user->first_name}!</h1>
                                               <p>Thank you for registering with us. Here are your login details:</p>
                                               <p><strong>Email:</strong> {$user->email}</p>
                                               <p><strong>Password:</strong> {$user->password}</p>
                                               <p>To activate your account, please click the link below:</p>
                                               <a href='$verificationLink'>Verify Your Account</a>
                                               <p><strong>Note:</strong> This link will expire in 24 hours. If it expires, you will need to request a new verification link.</p>
                                               <p>For security reasons change your password after you log in.</p>
                                               <p>If you did not request this, please ignore this email.</p>"

                            ]
                        ]
                    ];
                                  

                // Send the email
                $response = $mj->post(Resources::$Email, ['body' => $body]);

                if ($response->success()) {
                    $response = ['status' => 1, 'message' => 'User created successfully. Login credentials sent via email.'];
                } else {
                    $response = ['status' => 0, 'message' => 'Failed to send login credentials email.'];
                }
            } catch (Exception $e) {
                $response = ['status' => 0, 'message' => 'Failed to send email: ' . $e->getMessage()];
            }
        } else {
            $response = ['status' => 0, 'message' => 'Failed to create user.'];
        }
        echo json_encode($response);
        break;

case 'PUT':
    // Update user details
    $user = json_decode(file_get_contents('php://input'));

    // Check if password is provided
    if (isset($user->password)) {
        $hashedPassword = password_hash($user->password, PASSWORD_BCRYPT); // Store the hashed password in a variable
    } else {
        // If no password is provided, you may want to leave the password unchanged or handle it differently
        $hashedPassword = null;
    }

    // SQL query to update the user
    $sql = "UPDATE internal_users SET 
            email = :email, 
            first_name = :first_name, 
            last_name = :last_name, 
            user_role = :user_role" .
            ($hashedPassword ? ", password = :password" : "") . // Conditionally add password to the query if provided
            " WHERE id = :id";
    
    // Prepare the SQL statement
    $stmt = $conn->prepare($sql);
    $stmt->bindParam(':email', $user->email);
    $stmt->bindParam(':first_name', $user->first_name);
    $stmt->bindParam(':last_name', $user->last_name);
    $stmt->bindParam(':user_role', $user->user_role);
    $stmt->bindParam(':id', $user->id);

    // Bind password only if it's provided
    if ($hashedPassword) {
        $stmt->bindParam(':password', $hashedPassword);
    }

    // Execute the query
    if ($stmt->execute()) {
        $response = ['status' => 1, 'message' => 'User updated successfully.'];
    } else {
        $response = ['status' => 0, 'message' => 'Failed to update user.'];
    }

    echo json_encode($response);
    break;


    case 'DELETE':
        // Delete user
        $sql = "DELETE FROM internal_users WHERE id = :id";
        $path = explode('/', $_SERVER['REQUEST_URI']);
        $stmt = $conn->prepare($sql);
        $stmt->bindParam(':id', $path[3]);
        if ($stmt->execute()) {
            $response = ['status' => 1, 'message' => 'User deleted successfully.'];
        } else {
            $response = ['status' => 0, 'message' => 'Failed to delete user.'];
        }
        echo json_encode($response);
        break;
}
?>

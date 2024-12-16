<?php
session_start(); // Start the session to access logged-in user info

// Allow specific origin, allowing credentials to be shared
header("Access-Control-Allow-Origin: http://localhost:3000"); // Adjust to your frontend URL
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Credentials: true");

include 'DbConnect.php';
$objDB = new DbConnect;
$conn = $objDB->connect();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Check if a user is logged in via session
        if (isset($_SESSION['user_id'])) {
            $sql = "SELECT * FROM internal_users";
            $path = explode('/', $_SERVER['REQUEST_URI']);
            if (isset($path[3]) && is_numeric($path[3])) {
                // Only admins, doctors, or the logged-in user themselves can view the details
                if ($_SESSION['user_role'] == 3 || $_SESSION['user_role'] == 2 || $_SESSION['user_id'] == $path[3]) {
                    $sql .= " WHERE id = :id";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(':id', $path[3]);
                    $stmt->execute();
                    $users = $stmt->fetch(PDO::FETCH_ASSOC);
                } else {
                    echo json_encode(['status' => 0, 'message' => 'Unauthorized access.']);
                    exit;
                }
            } else {
                // Allow admins and doctors to view all users, staff can only view their own details
                if ($_SESSION['user_role'] == 3 || $_SESSION['user_role'] == 2) {
                    $stmt = $conn->prepare($sql);
                    $stmt->execute();
                    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
                } else {
                    $sql .= " WHERE id = :id";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(':id', $_SESSION['user_id']);
                    $stmt->execute();
                    $users = $stmt->fetch(PDO::FETCH_ASSOC);
                }
            }
            echo json_encode($users);
        } else {
            echo json_encode(['status' => 0, 'message' => 'User not logged in.']);
        }
        break;

    case 'POST':
        $user = json_decode(file_get_contents('php://input'));

        // Only admins can create a new user
        if (isset($_SESSION['user_role']) && $_SESSION['user_role'] == 3) {
            $hashedPassword = password_hash($user->password, PASSWORD_BCRYPT);
            $sql = "INSERT INTO internal_users(username, email, first_name, last_name, password, user_role, created_at) 
                    VALUES (:username, :email, :first_name, :last_name, :password, :user_role, :created_at)";
            $stmt = $conn->prepare($sql);
            $created_at = date('Y-m-d H:i:s');
            $stmt->bindParam(':username', $user->username);
            $stmt->bindParam(':email', $user->email);
            $stmt->bindParam(':first_name', $user->first_name);
            $stmt->bindParam(':last_name', $user->last_name);
            $stmt->bindParam(':password', $hashedPassword);
            $stmt->bindParam(':user_role', $user->user_role);
            $stmt->bindParam(':created_at', $created_at);
        
            if ($stmt->execute()) {
                $response = ['status' => 1, 'message' => 'User created successfully.'];
            } else {
                $response = ['status' => 0, 'message' => 'Failed to create user.'];
            }
        } else {
            $response = ['status' => 0, 'message' => 'Unauthorized action. Only admins can create users.'];
        }
        echo json_encode($response);
        break;

    case 'PUT':
        $user = json_decode(file_get_contents('php://input'));

        // Only admins can update any user, but users can update their own profiles
        if (isset($_SESSION['user_id'])) {
            if ($_SESSION['user_role'] == 3 || $_SESSION['user_id'] == $user->id) {
                if (!empty($user->password)) {
                    $hashedPassword = password_hash($user->password, PASSWORD_BCRYPT);
                    $sql = "UPDATE internal_users SET 
                            username = :username, 
                            email = :email, 
                            first_name = :first_name, 
                            last_name = :last_name, 
                            password = :password, 
                            user_role = :user_role 
                            WHERE id = :id";
                    $stmt = $conn->prepare($sql);
                    $stmt->bindParam(':password', $hashedPassword);
                } else {
                    $sql = "UPDATE internal_users SET 
                            username = :username, 
                            email = :email, 
                            first_name = :first_name, 
                            last_name = :last_name, 
                            user_role = :user_role 
                            WHERE id = :id";
                    $stmt = $conn->prepare($sql);
                }

                $stmt->bindParam(':username', $user->username);
                $stmt->bindParam(':email', $user->email);
                $stmt->bindParam(':first_name', $user->first_name);
                $stmt->bindParam(':last_name', $user->last_name);
                $stmt->bindParam(':user_role', $user->user_role);
                $stmt->bindParam(':id', $user->id);

                if ($stmt->execute()) {
                    $response = ['status' => 1, 'message' => 'User updated successfully.'];
                } else {
                    $response = ['status' => 0, 'message' => 'Failed to update user.'];
                }
            } else {
                $response = ['status' => 0, 'message' => 'Unauthorized. You can only update your own profile.'];
            }
        } else {
            $response = ['status' => 0, 'message' => 'User not logged in.'];
        }
        echo json_encode($response);
        break;

    case 'DELETE':
        // Only admins can delete users
        if (isset($_SESSION['user_role']) && $_SESSION['user_role'] == 3) {
            $sql = "DELETE FROM internal_users WHERE id = :id";
            $path = explode('/', $_SERVER['REQUEST_URI']);
            $stmt = $conn->prepare($sql);
            $stmt->bindParam(':id', $path[3]);

            if ($stmt->execute()) {
                $response = ['status' => 1, 'message' => 'User deleted successfully.'];
            } else {
                $response = ['status' => 0, 'message' => 'Failed to delete user.'];
            }
        } else {
            $response = ['status' => 0, 'message' => 'Unauthorized action. Only admins can delete users.'];
        }
        echo json_encode($response);
        break;

    default:
        echo json_encode(['status' => 0, 'message' => 'Invalid request method.']);
        break;
}
?>

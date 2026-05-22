<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = getJsonInput();
    $action = isset($data['action']) ? $data['action'] : '';

    if ($action === 'login') {
        $username = $data['username'];
        $password = $data['password'];

        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $username]);
        $user = $stmt->fetch();

        // Note: For demonstration, we compare passwords directly or via password_verify
        // If you seeded with plain text or md5, adjust accordingly. 
        // We'll use password_verify assuming proper hashes, but for the seed data ($2y$...) it works.
        // As a fallback for simple local testing if plain text is used, we also check ==
        if ($user && (password_verify($password, $user['password']) || $password === $user['password'])) {
            unset($user['password']); // don't send password to frontend
            echo json_encode(["success" => true, "user" => $user]);
        } else {
            echo json_encode(["error" => "Invalid username or password"]);
        }

    } elseif ($action === 'register') {
        $username = $data['username'];
        $email = $data['email'];
        $password = password_hash($data['password'], PASSWORD_DEFAULT);
        $name = $data['name'];
        $role = isset($data['role']) ? $data['role'] : 'user'; // Admin can send role
        $registered = date('Y-m-d');

        // Validate email format (e.g. must contain @ and a valid domain format)
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/', $email)) {
            echo json_encode(["error" => "Please enter a valid email address (e.g. name@gmail.com)"]);
            exit;
        }

        // Check if exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
        $stmt->execute([$username, $email]);
        if ($stmt->fetch()) {
            echo json_encode(["error" => "Username or Email already exists"]);
            exit;
        }

        $stmt = $pdo->prepare("INSERT INTO users (username, password, name, email, role, registered_at) VALUES (?, ?, ?, ?, ?, ?)");
        if($stmt->execute([$username, $password, $name, $email, $role, $registered])) {
            $userId = $pdo->lastInsertId();
            $stmt = $pdo->prepare("SELECT id, username, name, email, role, registered_at FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            echo json_encode(["success" => true, "user" => $user]);
        } else {
            echo json_encode(["error" => "Registration failed"]);
        }
    } else {
        echo json_encode(["error" => "Unknown action"]);
    }
}
?>

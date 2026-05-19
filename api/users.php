<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Return all users (exclude passwords)
    $stmt = $pdo->query("SELECT id, username, name, email, role, registered_at as registered FROM users");
    echo json_encode($stmt->fetchAll());

} elseif ($method === 'DELETE') {
    $username = isset($_GET['username']) ? $_GET['username'] : null;
    if ($username) {
        $stmt = $pdo->prepare("DELETE FROM users WHERE username=?");
        $stmt->execute([$username]);
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Username required"]);
    }
}
?>

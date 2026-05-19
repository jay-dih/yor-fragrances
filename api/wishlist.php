<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get user's wishlist
    try {
        $stmt = $pdo->prepare("SELECT p.* FROM wishlist w JOIN products p ON w.product_id = p.id WHERE w.user_id = ?");
        $stmt->execute([$user_id]);
        $wishlist = $stmt->fetchAll();
        echo json_encode(["success" => true, "wishlist" => $wishlist]);
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "message" => "Database error"]);
    }
} elseif ($method === 'POST') {
    // Add to wishlist
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['product_id'])) {
        echo json_encode(["success" => false, "message" => "Product ID required"]);
        exit;
    }
    try {
        $stmt = $pdo->prepare("INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)");
        $stmt->execute([$user_id, $input['product_id']]);
        echo json_encode(["success" => true, "message" => "Added to wishlist"]);
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "message" => "Database error"]);
    }
} elseif ($method === 'DELETE') {
    // Remove from wishlist
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['product_id'])) {
        echo json_encode(["success" => false, "message" => "Product ID required"]);
        exit;
    }
    try {
        $stmt = $pdo->prepare("DELETE FROM wishlist WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$user_id, $input['product_id']]);
        echo json_encode(["success" => true, "message" => "Removed from wishlist"]);
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "message" => "Database error"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>

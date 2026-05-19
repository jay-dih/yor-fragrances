<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Get reviews for a product
    if (!isset($_GET['product_id'])) {
        echo json_encode(["success" => false, "message" => "Product ID required"]);
        exit;
    }
    try {
        $stmt = $pdo->prepare("SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.product_id = ? ORDER BY r.created_at DESC");
        $stmt->execute([$_GET['product_id']]);
        $reviews = $stmt->fetchAll();
        echo json_encode(["success" => true, "reviews" => $reviews]);
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "message" => "Database error"]);
    }
} elseif ($method === 'POST') {
    // Add a review
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["success" => false, "message" => "You must be logged in to leave a review"]);
        exit;
    }
    $input = json_decode(file_get_contents('php://input'), true);
    if (!isset($input['product_id']) || !isset($input['rating'])) {
        echo json_encode(["success" => false, "message" => "Missing required fields"]);
        exit;
    }
    try {
        $stmt = $pdo->prepare("INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)");
        $stmt->execute([$input['product_id'], $_SESSION['user_id'], $input['rating'], $input['comment'] ?? '']);
        echo json_encode(["success" => true, "message" => "Review submitted successfully"]);
    } catch(PDOException $e) {
        echo json_encode(["success" => false, "message" => "Database error"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Method not allowed"]);
}
?>

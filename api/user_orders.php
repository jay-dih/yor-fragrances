<?php
session_start();
require 'db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "Unauthorized"]);
    exit;
}

$user_id = $_SESSION['user_id'];
try {
    $stmt = $pdo->prepare("SELECT id, customer_name, items_summary, total, payment_method, payment_receipt, status, admin_remarks, order_date FROM orders WHERE user_id = ? ORDER BY order_date DESC");
    $stmt->execute([$user_id]);
    $orders = $stmt->fetchAll();
    echo json_encode(["success" => true, "orders" => $orders]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error"]);
}
?>

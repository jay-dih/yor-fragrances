<?php
require 'db.php';
header('Content-Type: application/json');

$user_id       = isset($_GET['user_id']) && $_GET['user_id'] !== '' ? intval($_GET['user_id']) : null;
$customer_name = isset($_GET['name'])    && $_GET['name']    !== '' ? trim($_GET['name'])       : null;

if (!$user_id && !$customer_name) {
    echo json_encode(["success" => false, "message" => "User not identified"]);
    exit;
}

try {
    // Match by user_id OR customer_name so legacy NULL user_id rows are still found
    if ($user_id && $customer_name) {
        $stmt = $pdo->prepare(
            "SELECT id, customer_name, items_summary, total, payment_method,
                    payment_receipt, status, admin_remarks, order_date
             FROM orders
             WHERE user_id = ? OR customer_name = ?
             ORDER BY order_date DESC, id DESC"
        );
        $stmt->execute([$user_id, $customer_name]);
    } elseif ($user_id) {
        $stmt = $pdo->prepare(
            "SELECT id, customer_name, items_summary, total, payment_method,
                    payment_receipt, status, admin_remarks, order_date
             FROM orders
             WHERE user_id = ?
             ORDER BY order_date DESC, id DESC"
        );
        $stmt->execute([$user_id]);
    } else {
        $stmt = $pdo->prepare(
            "SELECT id, customer_name, items_summary, total, payment_method,
                    payment_receipt, status, admin_remarks, order_date
             FROM orders
             WHERE customer_name = ?
             ORDER BY order_date DESC, id DESC"
        );
        $stmt->execute([$customer_name]);
    }

    $orders = $stmt->fetchAll();
    echo json_encode(["success" => true, "orders" => $orders]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>

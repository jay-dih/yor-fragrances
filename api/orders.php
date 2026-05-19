<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM orders ORDER BY order_date DESC");
    echo json_encode($stmt->fetchAll());

} elseif ($method === 'POST') {
    $data = getJsonInput();
    if (!$data) { echo json_encode(["error" => "No data provided"]); exit; }

    $stmt = $pdo->prepare("INSERT INTO orders (id, customer_name, items_summary, total, status, order_date) VALUES (?, ?, ?, ?, ?, ?)");
    $success = $stmt->execute([
        $data['id'],
        $data['customer'],
        $data['items'],
        $data['total'],
        $data['status'],
        $data['date']
    ]);

    if ($success) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Failed to save order"]);
    }

} elseif ($method === 'PUT') {
    // Update order status
    $data = getJsonInput();
    if (!isset($data['id']) || !isset($data['status'])) { 
        echo json_encode(["error" => "ID and status required"]); 
        exit; 
    }

    $stmt = $pdo->prepare("UPDATE orders SET status=? WHERE id=?");
    $stmt->execute([$data['status'], $data['id']]);
    
    echo json_encode(["success" => true]);
}
?>

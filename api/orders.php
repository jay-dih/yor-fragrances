<?php
session_start();
require 'db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Admin: get all orders; User: get own orders via user_orders.php
    if (isset($_SESSION['role']) && $_SESSION['role'] === 'admin') {
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY order_date DESC");
        echo json_encode(["success" => true, "orders" => $stmt->fetchAll()]);
    } else {
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
    }

} elseif ($method === 'POST') {
    // Handle multipart/form-data (for GCash receipt upload) or JSON (for COD)
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    
    if (strpos($contentType, 'multipart/form-data') !== false) {
        // GCash order with receipt upload
        $id           = $_POST['id'] ?? ('ORD-' . rand(1000,9999));
        $customer     = $_POST['customer'] ?? 'Guest';
        $items        = $_POST['items'] ?? '';
        $total        = $_POST['total'] ?? 0;
        $payment      = $_POST['payment_method'] ?? 'GCash';
        $date         = $_POST['date'] ?? date('Y-m-d');
        $user_id      = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
        $receiptPath  = null;

        if (isset($_FILES['receipt']) && $_FILES['receipt']['error'] === 0) {
            $ext = pathinfo($_FILES['receipt']['name'], PATHINFO_EXTENSION);
            $fname = 'rcpt_' . time() . '_' . rand(100,999) . '.' . $ext;
            $uploadDir = __DIR__ . '/../assets/uploads/receipts/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
            move_uploaded_file($_FILES['receipt']['tmp_name'], $uploadDir . $fname);
            $receiptPath = 'assets/uploads/receipts/' . $fname;
        }

        $stmt = $pdo->prepare("INSERT INTO orders (id, user_id, customer_name, items_summary, total, payment_method, payment_receipt, status, order_date) VALUES (?,?,?,?,?,?,?,'Pending',?)");
        $success = $stmt->execute([$id, $user_id, $customer, $items, $total, $payment, $receiptPath, $date]);
        echo json_encode(["success" => (bool)$success]);

    } else {
        // COD or plain JSON order
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) { echo json_encode(["success" => false, "message" => "No data"]); exit; }

        $user_id = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;
        $stmt = $pdo->prepare("INSERT INTO orders (id, user_id, customer_name, items_summary, total, payment_method, status, order_date) VALUES (?,?,?,?,?,?,'Pending',?)");
        $success = $stmt->execute([
            $data['id'],
            $user_id,
            $data['customer'],
            $data['items'],
            $data['total'],
            $data['payment_method'] ?? 'COD',
            $data['date']
        ]);
        echo json_encode(["success" => (bool)$success]);
    }

} elseif ($method === 'PUT') {
    // Admin: update order status and/or remarks
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["success" => false, "message" => "Unauthorized"]); exit;
    }
    $data = json_decode(file_get_contents('php://input'), true);
    if (!isset($data['id'])) { echo json_encode(["success" => false, "message" => "ID required"]); exit; }

    $sets = [];
    $params = [];
    if (isset($data['status']))       { $sets[] = "status=?";       $params[] = $data['status']; }
    if (isset($data['admin_remarks'])) { $sets[] = "admin_remarks=?"; $params[] = $data['admin_remarks']; }
    if (empty($sets)) { echo json_encode(["success" => false, "message" => "Nothing to update"]); exit; }
    $params[] = $data['id'];

    $stmt = $pdo->prepare("UPDATE orders SET " . implode(',', $sets) . " WHERE id=?");
    $stmt->execute($params);
    echo json_encode(["success" => true]);
}
?>

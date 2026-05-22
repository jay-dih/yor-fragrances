<?php
require_once 'db.php';

// Fetch new notifications for admin panel
$newOrders = $pdo->query("SELECT COUNT(*) as count FROM orders WHERE status = 'new'")->fetch()['count'];
$newInquiries = $pdo->query("SELECT COUNT(*) as count FROM inquiries WHERE status = 'new'")->fetch()['count'];
$newUsers = $pdo->query("SELECT COUNT(*) as count FROM users WHERE status = 'new'")->fetch()['count'];

header('Content-Type: application/json');
echo json_encode([
    'newOrders' => $newOrders,
    'newInquiries' => $newInquiries,
    'newUsers' => $newUsers
]);
?>
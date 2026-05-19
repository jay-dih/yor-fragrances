<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM inquiries ORDER BY inquiry_date DESC");
    echo json_encode($stmt->fetchAll());

} elseif ($method === 'POST') {
    $data = getJsonInput();
    if (!$data) { echo json_encode(["error" => "No data provided"]); exit; }

    $stmt = $pdo->prepare("INSERT INTO inquiries (name, contact, message, inquiry_date) VALUES (?, ?, ?, ?)");
    $success = $stmt->execute([
        $data['name'],
        $data['contact'],
        $data['message'],
        $data['date']
    ]);

    if ($success) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Failed to save inquiry"]);
    }
}
?>

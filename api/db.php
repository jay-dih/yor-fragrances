<?php
// api/db.php
// Update these variables with your InfinityFree database credentials
$host = 'sql211.infinityfree.com'; // Replace with your MySQL Hostname
$dbname = 'if0_41963312_schema'; // Replace with your DB Name
$username = 'if0_41963312'; // Replace with your MySQL Username
$password = 'johndave020506'; // Replace with your MySQL Password

header('Content-Type: application/json');
// Optional: CORS headers if needed
// header("Access-Control-Allow-Origin: *");
// header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
// header("Access-Control-Allow-Headers: Content-Type");

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

// Function to handle reading JSON body from frontend fetch requests
function getJsonInput() {
    return json_decode(file_get_contents('php://input'), true);
}
?>

<?php
require 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $category = isset($_GET['category']) ? $_GET['category'] : null;
    
    if ($category && $category !== 'all') {
        $stmt = $pdo->prepare("SELECT * FROM products WHERE category = ?");
        $stmt->execute([$category]);
    } else {
        $stmt = $pdo->query("SELECT * FROM products");
    }
    
    $products = $stmt->fetchAll();
    // Convert numeric strings to actual numbers and booleans for frontend compatibility
    foreach ($products as &$p) {
        $p['id'] = (int)$p['id'];
        $p['price'] = (float)$p['price'];
        $p['stock'] = (int)$p['stock'];
        $p['featured'] = (bool)$p['featured'];
    }
    echo json_encode($products);

} elseif ($method === 'POST') {
    // Add a new product — supports both JSON and multipart/form-data (with image upload)
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    $imagePath = 'assets/images/floral.png'; // default

    if (strpos($contentType, 'multipart/form-data') !== false) {
        $data = $_POST;
        if (isset($_FILES['product_image']) && $_FILES['product_image']['error'] === 0) {
            $ext = pathinfo($_FILES['product_image']['name'], PATHINFO_EXTENSION);
            $fname = 'prod_' . time() . '_' . rand(100,999) . '.' . $ext;
            $uploadDir = __DIR__ . '/../assets/uploads/products/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
            move_uploaded_file($_FILES['product_image']['tmp_name'], $uploadDir . $fname);
            $imagePath = 'assets/uploads/products/' . $fname;
        }
    } else {
        $data = getJsonInput();
        if (!$data) { echo json_encode(["error" => "No data provided"]); exit; }
        $imagePath = $data['image'] ?? $imagePath;
    }

    $stmt = $pdo->prepare("INSERT INTO products (name, category, notes, price, stock, featured, description, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([
        $data['name'],
        $data['category'],
        $data['notes'] ?? null,
        $data['price'],
        $data['stock'],
        !empty($data['featured']) ? 1 : 0,
        $data['description'] ?? '',
        $imagePath
    ]);
    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);

} elseif ($method === 'PUT') {
    // Update a product
    $data = getJsonInput();
    if (!isset($data['id'])) { echo json_encode(["error" => "ID required"]); exit; }
    
    $stmt = $pdo->prepare("UPDATE products SET name=?, category=?, notes=?, price=?, stock=?, featured=?, description=?, image=? WHERE id=?");
    $stmt->execute([
        $data['name'], 
        $data['category'], 
        $data['notes'] ?? null, 
        $data['price'], 
        $data['stock'], 
        $data['featured'] ? 1 : 0, 
        $data['description'] ?? '', 
        $data['image'] ?? 'assets/images/placeholder.jpg',
        $data['id']
    ]);
    
    echo json_encode(["success" => true]);

} elseif ($method === 'DELETE') {
    // Delete a product
    $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM products WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "ID required"]);
    }
}
?>

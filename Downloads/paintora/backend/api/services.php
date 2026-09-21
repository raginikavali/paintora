<?php
/**
 * Paintora REST API - Services Endpoint
 * Handles CRUD operations and search for painting services.
 * 
 * Endpoints:
 * - GET /api/services.php                 -> Get all services (supports ?search=xyz & ?category=Interior)
 * - GET /api/services.php?id={id}         -> Get service by ID
 * - POST /api/services.php                -> Create a new service
 * - PUT /api/services.php?id={id}         -> Update an existing service
 * - DELETE /api/services.php?id={id}      -> Delete a service
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/auth.php';

setCorsHeaders();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGet($db);
        break;

    case 'POST':
        handlePost($db);
        break;

    case 'PUT':
        handlePut($db);
        break;

    case 'DELETE':
        handleDelete($db);
        break;

    default:
        sendError("Method {$method} not allowed on this endpoint.", "METHOD_NOT_ALLOWED", 405);
        break;
}

/**
 * Handle GET requests
 */
function handleGet($db) {
    // 1. Fetch single service by ID
    if (isset($_GET['id'])) {
        $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
        if ($id === false || $id <= 0) {
            sendError("Invalid service ID provided.", "INVALID_ID", 400);
        }

        $stmt = $db->prepare("SELECT * FROM services WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $id]);
        $service = $stmt->fetch();

        if (!$service) {
            sendError("Service with ID {$id} was not found.", "SERVICE_NOT_FOUND", 404);
        }

        // Format numeric price
        $service['price'] = (float)$service['price'];
        sendSuccess("Service fetched successfully.", $service, 200);
    }

    // 2. Search & filter services
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $category = isset($_GET['category']) ? trim($_GET['category']) : '';

    $query = "SELECT * FROM services WHERE 1=1";
    $params = [];

    if (!empty($search)) {
        $query .= " AND (name LIKE :search_name OR description LIKE :search_desc)";
        $params[':search_name'] = "%{$search}%";
        $params[':search_desc'] = "%{$search}%";
    }

    if (!empty($category) && strtolower($category) !== 'all') {
        $query .= " AND category = :category";
        $params[':category'] = $category;
    }

    $query .= " ORDER BY id ASC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $services = $stmt->fetchAll();

    // Cast numeric fields
    foreach ($services as &$item) {
        $item['price'] = (float)$item['price'];
    }

    sendSuccess("Services fetched successfully.", $services, 200);
}

/**
 * Handle POST request (Create new service)
 */
function handlePost($db) {
    requireAdmin();
    $input = getJsonInput();

    // Validation
    $errors = [];
    $name = isset($input['name']) ? trim($input['name']) : '';
    $description = isset($input['description']) ? trim($input['description']) : '';
    $category = isset($input['category']) ? trim($input['category']) : '';
    $price = isset($input['price']) ? $input['price'] : null;
    $duration = isset($input['duration']) ? trim($input['duration']) : '';
    $image = isset($input['image']) && !empty(trim($input['image'])) ? trim($input['image']) : '/images/interior.jpg';

    if (empty($name)) {
        $errors['name'] = "Service name is required.";
    }
    if (empty($description)) {
        $errors['description'] = "Description is required.";
    }
    if (empty($category)) {
        $errors['category'] = "Category is required.";
    }
    if ($price === null || !is_numeric($price) || (float)$price <= 0) {
        $errors['price'] = "Price must be a valid number greater than 0.";
    }
    if (empty($duration)) {
        $errors['duration'] = "Estimated duration is required.";
    }

    if (!empty($errors)) {
        sendError("Validation failed. Please check the input fields.", "VALIDATION_ERROR", 422, $errors);
    }

    $stmt = $db->prepare("
        INSERT INTO services (name, description, category, price, duration, image)
        VALUES (:name, :description, :category, :price, :duration, :image)
    ");

    $stmt->execute([
        ':name'        => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
        ':description' => htmlspecialchars($description, ENT_QUOTES, 'UTF-8'),
        ':category'    => htmlspecialchars($category, ENT_QUOTES, 'UTF-8'),
        ':price'       => (float)$price,
        ':duration'    => htmlspecialchars($duration, ENT_QUOTES, 'UTF-8'),
        ':image'       => htmlspecialchars($image, ENT_QUOTES, 'UTF-8')
    ]);

    $newId = (int)$db->lastInsertId();

    // Fetch and return the created record
    $fetchStmt = $db->prepare("SELECT * FROM services WHERE id = :id");
    $fetchStmt->execute([':id' => $newId]);
    $created = $fetchStmt->fetch();
    $created['price'] = (float)$created['price'];

    sendSuccess("Service created successfully.", $created, 201);
}

/**
 * Handle PUT request (Update service)
 */
function handlePut($db) {
    requireAdmin();
    $id = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;
    $input = getJsonInput();

    if (!$id && isset($input['id'])) {
        $id = filter_var($input['id'], FILTER_VALIDATE_INT);
    }

    if (!$id || $id <= 0) {
        sendError("Valid service ID is required for updating.", "INVALID_ID", 400);
    }

    // Check if service exists
    $checkStmt = $db->prepare("SELECT * FROM services WHERE id = :id");
    $checkStmt->execute([':id' => $id]);
    $existing = $checkStmt->fetch();

    if (!$existing) {
        sendError("Service with ID {$id} was not found.", "SERVICE_NOT_FOUND", 404);
    }

    // Validation
    $errors = [];
    $name = isset($input['name']) ? trim($input['name']) : $existing['name'];
    $description = isset($input['description']) ? trim($input['description']) : $existing['description'];
    $category = isset($input['category']) ? trim($input['category']) : $existing['category'];
    $price = isset($input['price']) ? $input['price'] : $existing['price'];
    $duration = isset($input['duration']) ? trim($input['duration']) : $existing['duration'];
    $image = isset($input['image']) ? trim($input['image']) : $existing['image'];

    if (empty($name)) {
        $errors['name'] = "Service name cannot be empty.";
    }
    if (empty($description)) {
        $errors['description'] = "Description cannot be empty.";
    }
    if (empty($category)) {
        $errors['category'] = "Category cannot be empty.";
    }
    if (!is_numeric($price) || (float)$price <= 0) {
        $errors['price'] = "Price must be a valid number greater than 0.";
    }
    if (empty($duration)) {
        $errors['duration'] = "Duration cannot be empty.";
    }

    if (!empty($errors)) {
        sendError("Validation failed.", "VALIDATION_ERROR", 422, $errors);
    }

    $stmt = $db->prepare("
        UPDATE services
        SET name = :name,
            description = :description,
            category = :category,
            price = :price,
            duration = :duration,
            image = :image
        WHERE id = :id
    ");

    $stmt->execute([
        ':id'          => $id,
        ':name'        => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
        ':description' => htmlspecialchars($description, ENT_QUOTES, 'UTF-8'),
        ':category'    => htmlspecialchars($category, ENT_QUOTES, 'UTF-8'),
        ':price'       => (float)$price,
        ':duration'    => htmlspecialchars($duration, ENT_QUOTES, 'UTF-8'),
        ':image'       => htmlspecialchars($image, ENT_QUOTES, 'UTF-8')
    ]);

    // Fetch updated record
    $fetchStmt = $db->prepare("SELECT * FROM services WHERE id = :id");
    $fetchStmt->execute([':id' => $id]);
    $updated = $fetchStmt->fetch();
    $updated['price'] = (float)$updated['price'];

    sendSuccess("Service updated successfully.", $updated, 200);
}

/**
 * Handle DELETE request
 */
function handleDelete($db) {
    requireAdmin();
    $id = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;
    $input = getJsonInput();
    if (!$id && isset($input['id'])) {
        $id = filter_var($input['id'], FILTER_VALIDATE_INT);
    }

    if (!$id || $id <= 0) {
        sendError("Valid service ID is required for deletion.", "INVALID_ID", 400);
    }

    // Check if service exists
    $checkStmt = $db->prepare("SELECT * FROM services WHERE id = :id");
    $checkStmt->execute([':id' => $id]);
    $existing = $checkStmt->fetch();

    if (!$existing) {
        sendError("Service with ID {$id} was not found.", "SERVICE_NOT_FOUND", 404);
    }

    // Check if there are related bookings (Foreign key safety)
    $bookingCheck = $db->prepare("SELECT COUNT(*) as booking_count FROM bookings WHERE service_id = :id");
    $bookingCheck->execute([':id' => $id]);
    $countRow = $bookingCheck->fetch();

    if ((int)$countRow['booking_count'] > 0) {
        sendError(
            "Cannot delete this service because it has active bookings associated with it.",
            "FOREIGN_KEY_CONSTRAINT",
            400
        );
    }

    $deleteStmt = $db->prepare("DELETE FROM services WHERE id = :id");
    $deleteStmt->execute([':id' => $id]);

    sendSuccess("Service deleted successfully.", ['id' => $id], 200);
}

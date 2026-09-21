<?php
/**
 * Paintora REST API - Bookings Endpoint
 * Handles customer bookings and admin booking management with relational joins.
 * 
 * Endpoints:
 * - GET /api/bookings.php                 -> Get all bookings (supports ?status=Pending & ?search=name)
 * - GET /api/bookings.php?id={id}         -> Get booking by ID (with joined service details)
 * - POST /api/bookings.php                -> Create a new booking
 * - PUT /api/bookings.php?id={id}         -> Update booking or status
 * - DELETE /api/bookings.php?id={id}      -> Delete a booking
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
 * Helper to format raw database row into relational booking + service object
 */
function formatBookingRow($row) {
    return [
        'id'             => (int)$row['id'],
        'service_id'     => (int)$row['service_id'],
        'customer_name'  => $row['customer_name'],
        'customer_email' => $row['customer_email'],
        'customer_phone' => $row['customer_phone'],
        'address'        => $row['address'],
        'booking_date'   => $row['booking_date'],
        'booking_time'   => $row['booking_time'],
        'status'         => $row['status'],
        'created_at'     => $row['created_at'],
        'updated_at'     => $row['updated_at'],
        'service'        => [
            'id'          => (int)$row['service_id'],
            'name'        => $row['service_name'] ?? 'Custom Service',
            'category'    => $row['service_category'] ?? 'General',
            'price'       => isset($row['service_price']) ? (float)$row['service_price'] : 0.0,
            'duration'    => $row['service_duration'] ?? '',
            'image'       => $row['service_image'] ?? ''
        ]
    ];
}

/**
 * Handle GET requests
 */
function handleGet($db) {
    $adminId = currentAdminId();
    $customerId = currentCustomerId();
    if (!$adminId && !$customerId) {
        sendError('Please login to view booking information.', 'AUTH_REQUIRED', 401);
    }

    // 1. Single booking lookup by ID
    if (isset($_GET['id'])) {
        $id = filter_var($_GET['id'], FILTER_VALIDATE_INT);
        if ($id === false || $id <= 0) {
            sendError("Invalid booking ID provided.", "INVALID_ID", 400);
        }

        $query = "
            SELECT 
                b.*,
                s.name AS service_name,
                s.category AS service_category,
                s.price AS service_price,
                s.duration AS service_duration,
                s.image AS service_image
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            WHERE b.id = :id
            LIMIT 1
        ";

        if (!$adminId) $query = str_replace('WHERE b.id = :id', 'WHERE b.id = :id AND b.customer_id = :customer_id', $query);
        $stmt = $db->prepare($query);
        $params = [':id' => $id];
        if (!$adminId) $params[':customer_id'] = $customerId;
        $stmt->execute($params);
        $row = $stmt->fetch();

        if (!$row) {
            sendError("Booking #{$id} was not found. Please verify your booking ID.", "BOOKING_NOT_FOUND", 404);
        }

        sendSuccess("Booking fetched successfully.", formatBookingRow($row), 200);
    }

    // 2. Fetch a customer's own bookings or the admin booking list
    $status = isset($_GET['status']) ? trim($_GET['status']) : '';
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';

    $query = "
        SELECT 
            b.*,
            s.name AS service_name,
            s.category AS service_category,
            s.price AS service_price,
            s.duration AS service_duration,
            s.image AS service_image
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE 1=1
    ";
    $params = [];

    if (!$adminId) {
        $query .= ' AND b.customer_id = :customer_id';
        $params[':customer_id'] = $customerId;
    }

    if (!empty($status) && strtolower($status) !== 'all') {
        $query .= " AND b.status = :status";
        $params[':status'] = $status;
    }

    if (!empty($search)) {
        $query .= " AND (b.customer_name LIKE :search_name OR b.customer_email LIKE :search_email OR b.customer_phone LIKE :search_phone OR b.id = :search_id)";
        $params[':search_name'] = "%{$search}%";
        $params[':search_email'] = "%{$search}%";
        $params[':search_phone'] = "%{$search}%";
        $params[':search_id'] = is_numeric($search) ? (int)$search : 0;
    }

    $query .= " ORDER BY b.id DESC";

    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $bookings = array_map('formatBookingRow', $rows);

    sendSuccess("Bookings fetched successfully.", $bookings, 200);
}

/**
 * Handle POST request (Create new booking)
 */
function handlePost($db) {
    $customerId = requireCustomer();
    $input = getJsonInput();

    $customerStmt = $db->prepare('SELECT name, email, phone FROM customers WHERE id = :id LIMIT 1');
    $customerStmt->execute([':id' => $customerId]);
    $customer = $customerStmt->fetch();
    if (!$customer) sendError('Customer account was not found.', 'CUSTOMER_NOT_FOUND', 404);

    $errors = [];

    // 1. Service ID validation
    $serviceId = isset($input['service_id']) ? filter_var($input['service_id'], FILTER_VALIDATE_INT) : null;
    if (!$serviceId || $serviceId <= 0) {
        $errors['service_id'] = "A valid service ID must be selected.";
    } else {
        // Verify that the service exists in the database
        $svcCheck = $db->prepare("SELECT id, name FROM services WHERE id = :id");
        $svcCheck->execute([':id' => $serviceId]);
        if (!$svcCheck->fetch()) {
            $errors['service_id'] = "The selected painting service does not exist.";
        }
    }

    // 2. Customer Name validation
    $customerName = $customer['name'];
    if (empty($customerName)) {
        $errors['customer_name'] = "Customer name is required.";
    } elseif (strlen($customerName) < 2) {
        $errors['customer_name'] = "Customer name must be at least 2 characters long.";
    }

    // 3. Email validation
    $customerEmail = $customer['email'];
    if (empty($customerEmail)) {
        $errors['customer_email'] = "Email address is required.";
    } elseif (!filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
        $errors['customer_email'] = "Please provide a valid email address.";
    }

    // 4. Phone validation
    $customerPhone = $customer['phone'];
    // Clean non-digits for validation
    $digitsOnly = preg_replace('/\D/', '', $customerPhone);
    if (empty($customerPhone)) {
        $errors['customer_phone'] = "Phone number is required.";
    } elseif (strlen($digitsOnly) < 10 || strlen($digitsOnly) > 15) {
        $errors['customer_phone'] = "Phone number must contain between 10 and 15 digits.";
    }

    // 5. Address validation
    $address = isset($input['address']) ? trim($input['address']) : '';
    if (empty($address)) {
        $errors['address'] = "Service location address is required.";
    } elseif (strlen($address) < 8) {
        $errors['address'] = "Please provide a complete address (minimum 8 characters).";
    }

    // 6. Booking Date validation (must not be in the past)
    $bookingDate = isset($input['booking_date']) ? trim($input['booking_date']) : '';
    if (empty($bookingDate)) {
        $errors['booking_date'] = "Booking date is required.";
    } else {
        $dateObj = DateTime::createFromFormat('Y-m-d', $bookingDate);
        if (!$dateObj || $dateObj->format('Y-m-d') !== $bookingDate) {
            $errors['booking_date'] = "Booking date must be in YYYY-MM-DD format.";
        } else {
            $today = new DateTime('today');
            if ($dateObj < $today) {
                $errors['booking_date'] = "Booking date cannot be in the past.";
            }
        }
    }

    // 7. Booking Time validation
    $bookingTime = isset($input['booking_time']) ? trim($input['booking_time']) : '';
    if (empty($bookingTime)) {
        $errors['booking_time'] = "Preferred time slot is required.";
    }

    // If validation failed, return 422
    if (!empty($errors)) {
        sendError("Validation failed. Please correct the highlighted errors.", "VALIDATION_ERROR", 422, $errors);
    }

    // Insert into bookings table
    $stmt = $db->prepare("
        INSERT INTO bookings (
            customer_id, service_id, customer_name, customer_email, customer_phone,
            address, booking_date, booking_time, status
        ) VALUES (
            :customer_id, :service_id, :customer_name, :customer_email, :customer_phone,
            :address, :booking_date, :booking_time, 'Pending'
        )
    ");

    $stmt->execute([
        ':customer_id'    => $customerId,
        ':service_id'     => $serviceId,
        ':customer_name'  => htmlspecialchars($customerName, ENT_QUOTES, 'UTF-8'),
        ':customer_email' => filter_var($customerEmail, FILTER_SANITIZE_EMAIL),
        ':customer_phone' => htmlspecialchars($customerPhone, ENT_QUOTES, 'UTF-8'),
        ':address'        => htmlspecialchars($address, ENT_QUOTES, 'UTF-8'),
        ':booking_date'   => $bookingDate,
        ':booking_time'   => htmlspecialchars($bookingTime, ENT_QUOTES, 'UTF-8')
    ]);

    $newId = (int)$db->lastInsertId();

    // Fetch complete record with joined service details
    $fetchQuery = "
        SELECT 
            b.*,
            s.name AS service_name,
            s.category AS service_category,
            s.price AS service_price,
            s.duration AS service_duration,
            s.image AS service_image
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.id = :id
    ";
    $fetchStmt = $db->prepare($fetchQuery);
    $fetchStmt->execute([':id' => $newId]);
    $created = $fetchStmt->fetch();

    sendSuccess("Booking created successfully. Your booking is pending confirmation.", formatBookingRow($created), 201);
}

/**
 * Handle PUT request (Update booking / status)
 */
function handlePut($db) {
    requireAdmin();
    $id = isset($_GET['id']) ? filter_var($_GET['id'], FILTER_VALIDATE_INT) : null;
    $input = getJsonInput();

    if (!$id && isset($input['id'])) {
        $id = filter_var($input['id'], FILTER_VALIDATE_INT);
    }

    if (!$id || $id <= 0) {
        sendError("Valid booking ID is required for updating.", "INVALID_ID", 400);
    }

    // Check if booking exists
    $checkStmt = $db->prepare("SELECT * FROM bookings WHERE id = :id");
    $checkStmt->execute([':id' => $id]);
    $existing = $checkStmt->fetch();

    if (!$existing) {
        sendError("Booking with ID {$id} was not found.", "BOOKING_NOT_FOUND", 404);
    }

    $errors = [];
    $allowedStatuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'];

    $status = isset($input['status']) ? trim($input['status']) : $existing['status'];
    if (!in_array($status, $allowedStatuses)) {
        $errors['status'] = "Status must be one of: " . implode(', ', $allowedStatuses);
    }

    $bookingDate = isset($input['booking_date']) ? trim($input['booking_date']) : $existing['booking_date'];
    if (isset($input['booking_date'])) {
        $dateObj = DateTime::createFromFormat('Y-m-d', $bookingDate);
        if (!$dateObj || $dateObj->format('Y-m-d') !== $bookingDate) {
            $errors['booking_date'] = "Booking date must be in YYYY-MM-DD format.";
        }
    }

    $bookingTime = isset($input['booking_time']) ? trim($input['booking_time']) : $existing['booking_time'];
    $address = isset($input['address']) ? trim($input['address']) : $existing['address'];

    if (!empty($errors)) {
        sendError("Validation failed.", "VALIDATION_ERROR", 422, $errors);
    }

    $stmt = $db->prepare("
        UPDATE bookings
        SET status = :status,
            booking_date = :booking_date,
            booking_time = :booking_time,
            address = :address
        WHERE id = :id
    ");

    $stmt->execute([
        ':id'           => $id,
        ':status'       => $status,
        ':booking_date' => $bookingDate,
        ':booking_time' => htmlspecialchars($bookingTime, ENT_QUOTES, 'UTF-8'),
        ':address'      => htmlspecialchars($address, ENT_QUOTES, 'UTF-8')
    ]);

    // Fetch updated record with service details
    $fetchStmt = $db->prepare("
        SELECT 
            b.*,
            s.name AS service_name,
            s.category AS service_category,
            s.price AS service_price,
            s.duration AS service_duration,
            s.image AS service_image
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.id = :id
    ");
    $fetchStmt->execute([':id' => $id]);
    $updated = $fetchStmt->fetch();

    sendSuccess("Booking updated successfully.", formatBookingRow($updated), 200);
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
        sendError("Valid booking ID is required for deletion.", "INVALID_ID", 400);
    }

    // Check if booking exists
    $checkStmt = $db->prepare("SELECT id FROM bookings WHERE id = :id");
    $checkStmt->execute([':id' => $id]);
    if (!$checkStmt->fetch()) {
        sendError("Booking with ID {$id} was not found.", "BOOKING_NOT_FOUND", 404);
    }

    $deleteStmt = $db->prepare("DELETE FROM bookings WHERE id = :id");
    $deleteStmt->execute([':id' => $id]);

    sendSuccess("Booking #{$id} deleted successfully.", ['id' => $id], 200);
}

<?php
/**
 * Paintora REST API - Admin Endpoint
 * Provides dashboard metrics and simple secure admin verification.
 * 
 * Endpoints:
 * - GET /api/admin.php?action=stats   -> Real MySQL aggregated statistics
 * - POST /api/admin.php?action=login  -> Simple secure admin authentication (password_verify)
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/auth.php';

setCorsHeaders();

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? trim($_GET['action']) : '';

if ($method === 'GET') {
    if ($action === 'stats') {
        requireAdmin();
        handleStats($db);
    } else {
        sendError("Unknown admin GET action. Supported: ?action=stats", "INVALID_ACTION", 400);
    }
} elseif ($method === 'POST') {
    if ($action === 'login') {
        handleLogin($db);
    } elseif ($action === 'logout') {
        clearAuthSession();
        sendSuccess('Admin logged out successfully.', null, 200);
    } else {
        sendError("Unknown admin POST action. Supported: ?action=login", "INVALID_ACTION", 400);
    }
} else {
    sendError("Method {$method} not supported.", "METHOD_NOT_ALLOWED", 405);
}

/**
 * Handle aggregated statistics for Admin Dashboard
 */
function handleStats($db) {
    // 1. Total services count
    $svcStmt = $db->query("SELECT COUNT(*) as total_services FROM services");
    $totalServices = (int)$svcStmt->fetch()['total_services'];

    // 2. Booking status counts
    $bookStmt = $db->query("
        SELECT 
            COUNT(*) as total_bookings,
            SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_bookings,
            SUM(CASE WHEN status = 'Confirmed' THEN 1 ELSE 0 END) as confirmed_bookings,
            SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress_bookings,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed_bookings,
            SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled_bookings
        FROM bookings
    ");
    $bookData = $bookStmt->fetch();

    // 3. Estimated revenue from active/completed bookings
    $revStmt = $db->query("
        SELECT COALESCE(SUM(s.price), 0) as total_revenue
        FROM bookings b
        JOIN services s ON b.service_id = s.id
        WHERE b.status IN ('Confirmed', 'In Progress', 'Completed')
    ");
    $revData = $revStmt->fetch();

    $stats = [
        'total_services'       => $totalServices,
        'total_bookings'       => (int)($bookData['total_bookings'] ?? 0),
        'pending_bookings'     => (int)($bookData['pending_bookings'] ?? 0),
        'confirmed_bookings'   => (int)($bookData['confirmed_bookings'] ?? 0),
        'in_progress_bookings' => (int)($bookData['in_progress_bookings'] ?? 0),
        'completed_bookings'   => (int)($bookData['completed_bookings'] ?? 0),
        'cancelled_bookings'   => (int)($bookData['cancelled_bookings'] ?? 0),
        'estimated_revenue'    => (float)($revData['total_revenue'] ?? 0.0)
    ];

    sendSuccess("Admin dashboard statistics fetched successfully.", $stats, 200);
}

/**
 * Handle simple secure admin login
 */
function handleLogin($db) {
    $input = getJsonInput();

    $email = isset($input['email']) ? trim($input['email']) : '';
    $password = isset($input['password']) ? trim($input['password']) : '';

    if (empty($email) || empty($password)) {
        sendError("Email and password are both required.", "VALIDATION_ERROR", 422);
    }

    $stmt = $db->prepare("SELECT id, name, email, password FROM admins WHERE email = :email LIMIT 1");
    $stmt->execute([':email' => $email]);
    $admin = $stmt->fetch();

    // Verify password securely using password_verify()
    if (!$admin || !password_verify($password, $admin['password'])) {
        sendError("Invalid email or password. Please try again.", "AUTH_FAILED", 401);
    }

    // Return safe admin info (exclude password hash)
    $profile = [
        'id'    => (int)$admin['id'],
        'name'  => $admin['name'],
        'email' => $admin['email']
    ];

    session_regenerate_id(true);
    $_SESSION['admin_id'] = (int)$admin['id'];
    unset($_SESSION['customer_id']);

    sendSuccess("Admin authenticated successfully.", $profile, 200);
}

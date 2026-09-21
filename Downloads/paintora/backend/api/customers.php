<?php
/** Customer signup, login, session profile, and logout API. */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/auth.php';

setCorsHeaders();
$database = new Database();
$db = $database->getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? trim($_GET['action']) : '';

if ($method === 'POST' && $action === 'signup') {
    signup($db);
} elseif ($method === 'POST' && $action === 'login') {
    login($db);
} elseif ($method === 'POST' && $action === 'logout') {
    clearAuthSession();
    sendSuccess('You have been logged out successfully.', null, 200);
} elseif ($method === 'GET' && $action === 'me') {
    $customerId = requireCustomer();
    $stmt = $db->prepare('SELECT id, name, email, phone, created_at FROM customers WHERE id = :id LIMIT 1');
    $stmt->execute([':id' => $customerId]);
    $customer = $stmt->fetch();
    if (!$customer) {
        clearAuthSession();
        sendError('Customer account was not found.', 'CUSTOMER_NOT_FOUND', 404);
    }
    $customer['id'] = (int)$customer['id'];
    sendSuccess('Customer profile fetched successfully.', $customer, 200);
} else {
    sendError('Unknown customer action.', 'INVALID_ACTION', 400);
}

function validateCustomerInput($input) {
    $errors = [];
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $phone = trim($input['phone'] ?? '');
    $password = (string)($input['password'] ?? '');
    $digits = preg_replace('/\D/', '', $phone);

    if (strlen($name) < 2) $errors['name'] = 'Name must be at least 2 characters long.';
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors['email'] = 'Please provide a valid email address.';
    if (!preg_match('/^[+\d\s().-]+$/', $phone) || strlen($digits) < 10 || strlen($digits) > 15) {
        $errors['phone'] = 'Phone number must contain between 10 and 15 digits.';
    }
    if (strlen($password) < 8) $errors['password'] = 'Password must be at least 8 characters long.';
    return [$errors, $name, $email, $phone, $password];
}

function signup($db) {
    [$errors, $name, $email, $phone, $password] = validateCustomerInput(getJsonInput());
    if ($errors) sendError('Please correct the highlighted fields.', 'VALIDATION_ERROR', 422, $errors);

    $check = $db->prepare('SELECT id FROM customers WHERE email = :email LIMIT 1');
    $check->execute([':email' => $email]);
    if ($check->fetch()) sendError('An account with this email already exists.', 'EMAIL_EXISTS', 409, ['email' => 'Email is already registered.']);

    $stmt = $db->prepare('INSERT INTO customers (name, email, phone, password) VALUES (:name, :email, :phone, :password)');
    $stmt->execute([
        ':name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
        ':email' => $email,
        ':phone' => htmlspecialchars($phone, ENT_QUOTES, 'UTF-8'),
        ':password' => password_hash($password, PASSWORD_DEFAULT)
    ]);
    $customerId = (int)$db->lastInsertId();
    $_SESSION['customer_id'] = $customerId;
    unset($_SESSION['admin_id']);
    sendSuccess('Customer account created successfully.', ['id' => $customerId, 'name' => $name, 'email' => $email, 'phone' => $phone], 201);
}

function login($db) {
    $input = getJsonInput();
    $email = trim($input['email'] ?? '');
    $password = (string)($input['password'] ?? '');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') sendError('Valid email and password are required.', 'VALIDATION_ERROR', 422);

    $stmt = $db->prepare('SELECT id, name, email, phone, password FROM customers WHERE email = :email LIMIT 1');
    $stmt->execute([':email' => $email]);
    $customer = $stmt->fetch();
    if (!$customer || !password_verify($password, $customer['password'])) sendError('Invalid email or password. Please try again.', 'AUTH_FAILED', 401);

    session_regenerate_id(true);
    $_SESSION['customer_id'] = (int)$customer['id'];
    unset($_SESSION['admin_id']);
    unset($customer['password']);
    $customer['id'] = (int)$customer['id'];
    sendSuccess('Customer authenticated successfully.', $customer, 200);
}
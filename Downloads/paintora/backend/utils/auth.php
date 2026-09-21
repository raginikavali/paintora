<?php
/** Shared session and authorization helpers for customer and admin APIs. */

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'
    ]);
    session_start();
}

function currentCustomerId() {
    return isset($_SESSION['customer_id']) ? (int)$_SESSION['customer_id'] : null;
}

function currentAdminId() {
    return isset($_SESSION['admin_id']) ? (int)$_SESSION['admin_id'] : null;
}

function requireCustomer() {
    $id = currentCustomerId();
    if (!$id) {
        sendError('Please login to continue.', 'AUTH_REQUIRED', 401);
    }
    return $id;
}

function requireAdmin() {
    $id = currentAdminId();
    if (!$id) {
        sendError('Admin authentication is required.', 'ADMIN_AUTH_REQUIRED', 401);
    }
    return $id;
}

function clearAuthSession() {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
}
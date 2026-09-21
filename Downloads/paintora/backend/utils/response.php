```php
<?php
/**
 * Paintora API Response Helper
 * Formats all API output as uniform JSON responses with proper HTTP status codes.
 */

// Set CORS headers so React frontend can communicate with PHP API
function setCorsHeaders() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    $allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://paintora.vercel.app'
    ];

    if (in_array($origin, $allowedOrigins, true)) {
        header("Access-Control-Allow-Origin: {$origin}");
        header('Access-Control-Allow-Credentials: true');
    }

    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Content-Type: application/json; charset=UTF-8");

    // Handle preflight OPTIONS request from browser
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit();
    }
}

/**
 * Send a standardized success JSON response
 */
function sendSuccess($message, $data = null, $statusCode = 200) {
    http_response_code($statusCode);

    $response = [
        'success' => true,
        'message' => $message
    ];

    if ($data !== null) {
        $response['data'] = $data;
    }

    echo json_encode(
        $response,
        JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
    );

    exit();
}

/**
 * Send a standardized error JSON response
 */
function sendError(
    $message,
    $errorCode = 'BAD_REQUEST',
    $statusCode = 400,
    $errors = null
) {
    http_response_code($statusCode);

    $response = [
        'success' => false,
        'message' => $message,
        'error' => $errorCode
    ];

    if ($errors !== null) {
        $response['errors'] = $errors;
    }

    echo json_encode(
        $response,
        JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
    );

    exit();
}

/**
 * Helper to get JSON payload from php://input
 */
function getJsonInput() {
    $rawInput = file_get_contents('php://input');

    if (empty($rawInput)) {
        return [];
    }

    $data = json_decode($rawInput, true);

    return is_array($data) ? $data : [];
}
```

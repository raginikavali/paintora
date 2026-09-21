<?php
/**
 * Paintora Database Configuration & PDO Connection
 * Connects to MySQL using PDO with prepared statements support.
 */

require_once __DIR__ . '/../utils/response.php';

class Database {
    // Database credentials (default for local XAMPP / MySQL)
private $host = "sql201.infinityfree.com";
private $db_name = "if0_42971860_paintora";
private $username = "if0_42971860";
private $password = "mqyOMlgwntBDWg";
private $port = 3306;

    public function __construct() {
        // Allow environment variables or config overrides if set
        if (getenv('DB_HOST')) $this->host = getenv('DB_HOST');
        if (getenv('DB_NAME')) $this->db_name = getenv('DB_NAME');
        if (getenv('DB_USER')) $this->username = getenv('DB_USER');
        if (getenv('DB_PASS') !== false) $this->password = getenv('DB_PASS');
        if (getenv('DB_PORT')) $this->port = (int)getenv('DB_PORT');
    }

    /**
     * Get the PDO database connection
     * @return PDO|null
     */
    public function getConnection() {
        $this->conn = null;

        $dsn = "mysql:host={$this->host};port={$this->port};dbname={$this->db_name};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false, // Enforce real prepared statements
        ];

        try {
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
        } catch (PDOException $exception) {
            // Send standardized JSON error without leaking sensitive credentials
            sendError(
                "Database connection failed. Please ensure MySQL is running and credentials in backend/config/database.php are correct.",
                "DATABASE_CONNECTION_ERROR",
                500
            );
        }

        return $this->conn;
    }
}

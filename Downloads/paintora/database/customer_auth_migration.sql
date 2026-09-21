USE `paintora_db`;

CREATE TABLE IF NOT EXISTS `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `bookings`
  ADD COLUMN `customer_id` INT NULL AFTER `id`;

ALTER TABLE `bookings`
  ADD CONSTRAINT `fk_bookings_customer`
  FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`)
  ON DELETE SET NULL ON UPDATE CASCADE;
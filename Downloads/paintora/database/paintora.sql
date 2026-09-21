-- =====================================================================
-- PAINTORA DATABASE SCHEMA & SEED DATA
-- Database: paintora_db
-- Description: Home Painting Service Booking Platform
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `paintora_db`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE `paintora_db`;

-- ---------------------------------------------------------------------
-- 1. Table structure for table `services`
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `customers`;
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `duration` VARCHAR(50) NOT NULL,
  `image` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 2. Table structure for table `customers`
-- ---------------------------------------------------------------------
CREATE TABLE `customers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(20) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 3. Table structure for table `bookings`
-- ---------------------------------------------------------------------
CREATE TABLE `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customer_id` INT NULL,
  `service_id` INT NOT NULL,
  `customer_name` VARCHAR(100) NOT NULL,
  `customer_email` VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(20) NOT NULL,
  `address` TEXT NOT NULL,
  `booking_date` DATE NOT NULL,
  `booking_time` VARCHAR(20) NOT NULL,
  `status` ENUM('Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_bookings_service`
    FOREIGN KEY (`service_id`)
    REFERENCES `services` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  CONSTRAINT `fk_bookings_customer`
    FOREIGN KEY (`customer_id`)
    REFERENCES `customers` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=1001 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- 4. Table structure for table `admins`
-- ---------------------------------------------------------------------
DROP TABLE IF EXISTS `admins`;
CREATE TABLE `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================================
-- SEED DATA
-- =====================================================================

-- Services seed data with realistic starting prices and descriptions
INSERT INTO `services` (`id`, `name`, `description`, `category`, `price`, `duration`, `image`) VALUES
(1, 'Interior Wall Painting', 'Professional interior wall painting for bedrooms, living rooms, and indoor spaces. Includes surface sanding, primer base coat, and two coats of smooth washable emulsion.', 'Interior', 2499.00, '1 Day', '/images/interior.jpg'),
(2, 'Exterior House Painting', 'Weatherproof exterior painting designed to shield walls from monsoon rains, algae, fungal growth, and intense UV rays with long-lasting vibrant sheen.', 'Exterior', 4999.00, '3-4 Days', '/images/exterior.jpg'),
(3, 'Single Room Painting', 'Quick and clean makeover for a single bedroom or study room. Complete with furniture masking, crack filling, and odorless low-VOC paint.', 'Interior', 1499.00, '1 Day', '/images/single-room.jpg'),
(4, 'Full Home Painting', 'End-to-end comprehensive painting solution covering all living spaces, bedrooms, kitchen, ceilings, doors, and trim with post-service deep cleanup.', 'Full Home', 9999.00, '5-7 Days', '/images/full-home.jpg'),
(5, 'Texture Wall Painting', 'Designer focal accent walls with metallic, stucco, rustic, and marble effect textures that create a luxury centerpiece for living rooms.', 'Decorative', 1999.00, '1-2 Days', '/images/texture.jpg'),
(6, 'Ceiling Painting', 'High-opacity non-reflective flat white ceiling treatment that conceals minor surface imperfections, water stains, and brightens indoor lighting.', 'Interior', 999.00, 'Half Day', '/images/ceiling.jpg'),
(7, 'Door & Window Painting', 'Protective PU polish and high-gloss enamel coating for wooden doors, window frames, steel grilles, and balcony railings.', 'Woodwork', 799.00, '1 Day', '/images/woodwork.jpg');

-- Seed sample bookings demonstrating different statuses
INSERT INTO `bookings` (`id`, `service_id`, `customer_name`, `customer_email`, `customer_phone`, `address`, `booking_date`, `booking_time`, `status`) VALUES
(1001, 1, 'Ragini Sharma', 'ragini@example.com', '9876543210', 'Flat 402, Green Meadows Apartment, MG Road, Bengaluru', '2026-09-25', '10:00 AM', 'Pending'),
(1002, 2, 'Arjun Patel', 'arjun.patel@example.com', '9812345678', 'Plot 12, Palm Residency, Sector 14, Gurugram', '2026-09-28', '09:00 AM', 'Confirmed'),
(1003, 4, 'Priya Nair', 'priya.nair@example.com', '9823456789', 'Villa 7, Orchid Enclave, Whitefield, Bengaluru', '2026-10-02', '11:00 AM', 'In Progress'),
(1004, 5, 'Vikram Malhotra', 'vikram.m@example.com', '9834567890', 'House 55, Road 8, Banjara Hills, Hyderabad', '2026-09-18', '02:00 PM', 'Completed');

-- Seed default admin account (password: admin123)
-- Hash generated using PHP password_hash('admin123', PASSWORD_BCRYPT)
INSERT INTO `admins` (`id`, `name`, `email`, `password`) VALUES
(1, 'Admin', 'admin@paintora.com', '$2y$10$Q7eY9kP9v1f1kG8b2/LRe.pWJ43n9iLqS2u8v0K6w1z8m3X4y5Z6e');

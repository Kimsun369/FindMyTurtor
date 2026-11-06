CREATE DATABASE IF NOT EXISTS findmytutor
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE findmytutor;

CREATE TABLE IF NOT EXISTS users (
  user_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  role ENUM('student', 'tutor', 'admin') NOT NULL,
  account_status ENUM('pending', 'active', 'deactivated') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  UNIQUE KEY uq_users_email (email),
  KEY idx_users_role_status (role, account_status),
  KEY idx_users_name (name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS subjects (
  subject_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  subject_name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  PRIMARY KEY (subject_id),
  UNIQUE KEY uq_subjects_name (subject_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tutor_listings (
  tutor_listing_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tutor_id INT UNSIGNED NOT NULL,
  subject_id INT UNSIGNED NOT NULL,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  qualification VARCHAR(255) NULL,
  experience SMALLINT UNSIGNED NULL,
  location VARCHAR(160) NULL,
  teaching_fee DECIMAL(8,2) NOT NULL,
  image_path VARCHAR(500) NULL,
  status ENUM('available', 'unavailable') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (tutor_listing_id),
  KEY idx_listings_tutor (tutor_id),
  KEY idx_listings_subject_status (subject_id, status),
  KEY idx_listings_fee (teaching_fee),
  KEY idx_listings_location (location),
  FULLTEXT KEY ft_listings_text (title, description, location),
  CONSTRAINT fk_listings_tutor FOREIGN KEY (tutor_id)
    REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_listings_subject FOREIGN KEY (subject_id)
    REFERENCES subjects(subject_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT chk_listings_fee CHECK (teaching_fee >= 0),
  CONSTRAINT chk_listings_experience CHECK (experience IS NULL OR experience <= 70)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  student_id INT UNSIGNED NOT NULL,
  tutor_listing_id INT UNSIGNED NOT NULL,
  requested_date DATE NOT NULL,
  requested_time TIME NOT NULL,
  status ENUM('pending', 'accepted', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (booking_id),
  KEY idx_bookings_student_status (student_id, status),
  KEY idx_bookings_listing_status_date (tutor_listing_id, status, requested_date, requested_time),
  KEY idx_bookings_created (created_at),
  CONSTRAINT fk_bookings_student FOREIGN KEY (student_id)
    REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_listing FOREIGN KEY (tutor_listing_id)
    REFERENCES tutor_listings(tutor_listing_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

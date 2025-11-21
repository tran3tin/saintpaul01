-- Database initialization script for HR records management (Hoi Dong OSP)
-- Ensure execution with sufficient privileges.

CREATE DATABASE IF NOT EXISTS hr_records
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hr_records;

SET NAMES utf8mb4;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  role ENUM('admin','superior_general','superior_provincial','superior_community','secretary','viewer') NOT NULL DEFAULT 'viewer',
  last_login DATETIME NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: sisters (FR-1)
CREATE TABLE IF NOT EXISTS sisters (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  birth_name VARCHAR(120) NOT NULL,
  religious_name VARCHAR(120) NOT NULL,
  date_of_birth DATE NOT NULL,
  place_of_birth VARCHAR(150) NULL,
  nationality VARCHAR(80) NULL,
  father_name VARCHAR(120) NULL,
  mother_name VARCHAR(120) NULL,
  family_religion VARCHAR(80) NULL,
  baptism_date DATE NULL,
  baptism_place VARCHAR(150) NULL,
  confirmation_date DATE NULL,
  first_communion_date DATE NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(120) NULL,
  emergency_contact_name VARCHAR(120) NULL,
  emergency_contact_phone VARCHAR(30) NULL,
  photo_url VARCHAR(255) NULL,
  status ENUM('active','left') NOT NULL DEFAULT 'active',
  created_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_sisters_created_by FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_sisters_status (status),
  INDEX idx_sisters_dob (date_of_birth)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: communities (FR-3)
CREATE TABLE IF NOT EXISTS communities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  address VARCHAR(255) NULL,
  type ENUM('motherhouse','education','healthcare','media','social') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_communities_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: vocation_journey (FR-2)
CREATE TABLE IF NOT EXISTS vocation_journey (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sister_id INT UNSIGNED NOT NULL,
  stage ENUM('inquiry','postulant','aspirant','novice','temporary_vows','perpetual_vows','left') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  community_id INT UNSIGNED NULL,
  supervisor_id INT UNSIGNED NULL,
  notes TEXT NULL,
  CONSTRAINT fk_vocation_journey_sister FOREIGN KEY (sister_id) REFERENCES sisters(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_vocation_journey_community FOREIGN KEY (community_id) REFERENCES communities(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_vocation_journey_supervisor FOREIGN KEY (supervisor_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_vocation_stage (stage),
  INDEX idx_vocation_sister (sister_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: community_assignments (FR-3)
CREATE TABLE IF NOT EXISTS community_assignments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sister_id INT UNSIGNED NOT NULL,
  community_id INT UNSIGNED NOT NULL,
  role ENUM('superior','deputy','treasurer','member') NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  decision_number VARCHAR(50) NULL,
  decision_date DATE NULL,
  decision_file_url VARCHAR(255) NULL,
  notes TEXT NULL,
  CONSTRAINT fk_assignments_sister FOREIGN KEY (sister_id) REFERENCES sisters(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_assignments_community FOREIGN KEY (community_id) REFERENCES communities(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_assignments_role (role),
  INDEX idx_assignments_sister (sister_id),
  INDEX idx_assignments_community (community_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: missions (FR-4)
CREATE TABLE IF NOT EXISTS missions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sister_id INT UNSIGNED NOT NULL,
  field ENUM('education','pastoral','publishing','media','healthcare','social') NOT NULL,
  specific_role VARCHAR(150) NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  notes TEXT NULL,
  CONSTRAINT fk_missions_sister FOREIGN KEY (sister_id) REFERENCES sisters(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_missions_field (field),
  INDEX idx_missions_sister (sister_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: education (FR-5)
CREATE TABLE IF NOT EXISTS education (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sister_id INT UNSIGNED NOT NULL,
  level ENUM('secondary','bachelor','master','doctorate') NOT NULL,
  major VARCHAR(150) NULL,
  institution VARCHAR(200) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  certificate_url VARCHAR(255) NULL,
  CONSTRAINT fk_education_sister FOREIGN KEY (sister_id) REFERENCES sisters(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_education_level (level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: training_courses (FR-5)
CREATE TABLE IF NOT EXISTS training_courses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sister_id INT UNSIGNED NOT NULL,
  course_name VARCHAR(180) NOT NULL,
  organizer VARCHAR(180) NULL,
  start_date DATE NULL,
  end_date DATE NULL,
  content TEXT NULL,
  notes TEXT NULL,
  CONSTRAINT fk_training_courses_sister FOREIGN KEY (sister_id) REFERENCES sisters(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_training_courses_sister (sister_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: health_records (FR-6)
CREATE TABLE IF NOT EXISTS health_records (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sister_id INT UNSIGNED NOT NULL,
  general_health ENUM('good','average','weak') NOT NULL,
  chronic_diseases TEXT NULL,
  work_limitations TEXT NULL,
  checkup_date DATE NULL,
  checkup_place VARCHAR(150) NULL,
  diagnosis TEXT NULL,
  treatment TEXT NULL,
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_health_records_sister FOREIGN KEY (sister_id) REFERENCES sisters(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_health_sister (sister_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: evaluations (FR-7)
CREATE TABLE IF NOT EXISTS evaluations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sister_id INT UNSIGNED NOT NULL,
  evaluation_period VARCHAR(50) NOT NULL,
  evaluator_id INT UNSIGNED NULL,
  spiritual_life_score TINYINT UNSIGNED NULL,
  community_life_score TINYINT UNSIGNED NULL,
  mission_score TINYINT UNSIGNED NULL,
  personality_score TINYINT UNSIGNED NULL,
  obedience_score TINYINT UNSIGNED NULL,
  general_comments TEXT NULL,
  recommendations TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_evaluations_sister FOREIGN KEY (sister_id) REFERENCES sisters(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_evaluations_evaluator FOREIGN KEY (evaluator_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_evaluations_period (evaluation_period)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: departure_records (FR-8)
CREATE TABLE IF NOT EXISTS departure_records (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sister_id INT UNSIGNED NOT NULL,
  departure_date DATE NOT NULL,
  stage_at_departure ENUM('inquiry','postulant','aspirant','novice','temporary_vows','perpetual_vows','left') NOT NULL,
  reason TEXT NULL,
  support_notes TEXT NULL,
  CONSTRAINT fk_departure_sister FOREIGN KEY (sister_id) REFERENCES sisters(id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  INDEX idx_departure_date (departure_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table: audit_logs (FR-12)
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  record_id BIGINT NULL,
  old_value JSON NULL,
  new_value JSON NULL,
  ip_address VARCHAR(50) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX idx_audit_table (table_name),
  INDEX idx_audit_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- PostgreSQL Schema for Supabase
-- Run this in the Supabase SQL Editor

-- Create tables

CREATE TABLE programs (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255),
  role TEXT CHECK (role IN ('admin','instructor','student')) NOT NULL DEFAULT 'student',
  program_id VARCHAR(36) REFERENCES programs(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE courses (
  id VARCHAR(36) PRIMARY KEY,
  code VARCHAR(255) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  units INT NOT NULL CHECK (units > 0),
  program_id VARCHAR(36) REFERENCES programs(id) ON DELETE SET NULL,
  prereq TEXT,
  coreq TEXT,
  year_level VARCHAR(255),
  semester VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE curricula (
  program_id VARCHAR(36) PRIMARY KEY REFERENCES programs(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE enrollments (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(36) REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

CREATE TABLE syllabi (
  id VARCHAR(36) PRIMARY KEY,
  course_id VARCHAR(36) REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('draft','submitted','approved','rejected')) DEFAULT 'draft',
  version INT DEFAULT 1,
  approval_comment TEXT,
  course_description TEXT,
  prerequisites TEXT,
  corequisites TEXT,
  semester TEXT,
  academic_year TEXT,
  vision TEXT,
  mission TEXT,
  quality_policy TEXT,
  institutional_outcomes JSONB,
  program_outcomes JSONB,
  course_outcomes JSONB,
  performance_indicators JSONB,
  campus_goals JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE grading_components (
  id VARCHAR(36) PRIMARY KEY,
  syllabus_id VARCHAR(36) REFERENCES syllabi(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  percentage INT NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  order_index INT NOT NULL
);

CREATE TABLE learning_outcomes (
  id VARCHAR(36) PRIMARY KEY,
  syllabus_id VARCHAR(36) REFERENCES syllabi(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  order_index INT NOT NULL
);

CREATE TABLE materials (
  id VARCHAR(36) PRIMARY KEY,
  syllabus_id VARCHAR(36) REFERENCES syllabi(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE weekly_plans (
  id VARCHAR(36) PRIMARY KEY,
  syllabus_id VARCHAR(36) REFERENCES syllabi(id) ON DELETE CASCADE,
  week INT NOT NULL,
  topic TEXT NOT NULL,
  activities TEXT,
  assessments TEXT,
  materials TEXT,
  order_index INT NOT NULL,
  desired_learning_outcomes TEXT,
  clo_alignment JSONB,
  learning_content TEXT,
  face_face TEXT,
  synchronous TEXT,
  asynchronous TEXT
);

CREATE TABLE activity_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(255) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trigger for syllabi updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_syllabi_updated_at
BEFORE UPDATE ON syllabi
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

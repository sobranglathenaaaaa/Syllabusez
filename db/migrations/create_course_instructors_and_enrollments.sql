-- Migration: Create course_instructors and enrollments tables for many-to-many relationships
-- This migration creates the join tables needed for:
-- 1. Multiple instructors teaching the same course
-- 2. Students enrolling in multiple courses

-- course_instructors: Maps instructors to courses (many-to-many)
CREATE TABLE IF NOT EXISTS course_instructors (
  course_id VARCHAR(36) REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY(course_id, instructor_id)
);

-- enrollments: Maps students to courses (many-to-many)
CREATE TABLE IF NOT EXISTS enrollments (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
  course_id VARCHAR(36) REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_course_instructors_instructor ON course_instructors(instructor_id);
CREATE INDEX IF NOT EXISTS idx_course_instructors_course ON course_instructors(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

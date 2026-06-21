-- Script to add lecture_hours and lab_hours to the courses table
-- Please run this in the Supabase SQL Editor

ALTER TABLE public.courses 
ADD COLUMN IF NOT EXISTS lecture_hours INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS lab_hours INT DEFAULT 0;

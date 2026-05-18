create database if not exists syllabus_portal;
use syllabus_portal;

create table if not exists profiles (
  id char(36) primary key,
  full_name text,
  email varchar(255) unique,
  role enum('admin', 'instructor', 'student') default 'student',
  created_at timestamp not null default current_timestamp
);

create table if not exists departments (
  id char(36) primary key default (uuid()),
  name varchar(255) not null unique,
  created_at timestamp not null default current_timestamp
);

create table if not exists courses (
  id char(36) primary key default (uuid()),
  code varchar(50) not null unique,
  title varchar(255) not null,
  units int not null,
  department_id char(36) null,
  created_at timestamp not null default current_timestamp,
  constraint courses_units_check check (units > 0),
  constraint courses_department_fk foreign key (department_id) references departments(id) on delete set null
);

create table if not exists enrollments (
  id char(36) primary key default (uuid()),
  user_id char(36) not null,
  course_id char(36) not null,
  created_at timestamp not null default current_timestamp,
  unique key enrollments_unique (user_id, course_id),
  constraint enrollments_user_fk foreign key (user_id) references profiles(id) on delete cascade,
  constraint enrollments_course_fk foreign key (course_id) references courses(id) on delete cascade
);

create table if not exists syllabi (
  id char(36) primary key,
  course_id char(36) null,
  instructor_id char(36) null,
  status enum('draft', 'submitted', 'approved', 'rejected') default 'draft',
  version int default 1,
  approval_comment text,
  created_at timestamp not null default current_timestamp,
  updated_at timestamp not null default current_timestamp on update current_timestamp,
  constraint syllabi_course_fk foreign key (course_id) references courses(id) on delete cascade,
  constraint syllabi_instructor_fk foreign key (instructor_id) references profiles(id) on delete set null
);

create table if not exists learning_outcomes (
  id char(36) primary key default (uuid()),
  syllabus_id char(36) not null,
  description text not null,
  order_index int not null,
  constraint outcomes_syllabus_fk foreign key (syllabus_id) references syllabi(id) on delete cascade
);

create table if not exists weekly_plans (
  id char(36) primary key default (uuid()),
  syllabus_id char(36) not null,
  week int not null,
  topic text not null,
  activities text,
  assessments text,
  materials text,
  order_index int not null,
  constraint weekly_syllabus_fk foreign key (syllabus_id) references syllabi(id) on delete cascade
);

create table if not exists grading_components (
  id char(36) primary key default (uuid()),
  syllabus_id char(36) not null,
  name varchar(255) not null,
  percentage int not null,
  order_index int not null,
  constraint grading_percentage_check check (percentage >= 0 and percentage <= 100),
  constraint grading_syllabus_fk foreign key (syllabus_id) references syllabi(id) on delete cascade
);

create table if not exists materials (
  id char(36) primary key,
  syllabus_id char(36) not null,
  file_url text not null,
  file_name text not null,
  file_type varchar(120),
  created_at timestamp not null default current_timestamp,
  constraint materials_syllabus_fk foreign key (syllabus_id) references syllabi(id) on delete cascade
);

create table if not exists activity_logs (
  id char(36) primary key default (uuid()),
  user_id char(36),
  action text not null,
  entity_type varchar(120) not null,
  entity_id char(36) not null,
  details json,
  created_at timestamp not null default current_timestamp,
  constraint logs_user_fk foreign key (user_id) references profiles(id)
);

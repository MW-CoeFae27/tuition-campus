-- Paste this entire file into the Neon SQL Editor and run it (bypasses local network/firewall issues).
-- Safe to re-run: uses ON CONFLICT upserts, same as api/src/seed.js.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS teachers (
  teacher_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_code text NOT NULL UNIQUE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject_specialty text,
  join_date date,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'On Leave', 'Inactive')),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
  class_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_code text NOT NULL UNIQUE,
  class_name text NOT NULL,
  subjects text,
  schedule_days text,
  schedule_time text,
  room text,
  teacher_id uuid REFERENCES teachers(teacher_id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS students (
  student_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code text NOT NULL UNIQUE,
  full_name text NOT NULL,
  gender text,
  age integer CHECK (age IS NULL OR age >= 0),
  class_id uuid NOT NULL REFERENCES classes(class_id) ON DELETE RESTRICT,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  enrolment_date date,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Withdrawn')),
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS students_class_id_index ON students(class_id);
CREATE INDEX IF NOT EXISTS classes_teacher_id_index ON classes(teacher_id);

-- Teachers
INSERT INTO teachers (teacher_code, full_name, email, phone, subject_specialty, join_date, status) VALUES
  ('teacher01', 'Alice Tan', 'teacher01@example.com', '+65 9000 0001', 'English', '2022-01-10', 'Active'),
  ('teacher02', 'Benjamin Lim', 'teacher02@example.com', '+65 9000 0002', 'Mathematics', '2022-03-15', 'Active'),
  ('teacher03', 'Chloe Ng', 'teacher03@example.com', '+65 9000 0003', 'Science', '2023-06-01', 'Active'),
  ('teacher04', 'Daniel Wong', 'teacher04@example.com', '+65 9000 0004', 'Mathematics', '2023-09-20', 'Active'),
  ('teacher05', 'Emily Goh', 'teacher05@example.com', '+65 9000 0005', 'English', '2024-02-05', 'Active'),
  ('teacher06', 'Farah Rahman', 'teacher06@example.com', '+65 9000 0006', 'Science', '2024-08-12', 'On Leave')
ON CONFLICT (teacher_code) DO UPDATE SET full_name = EXCLUDED.full_name, email = EXCLUDED.email, phone = EXCLUDED.phone,
  subject_specialty = EXCLUDED.subject_specialty, join_date = EXCLUDED.join_date, status = EXCLUDED.status;

-- Classes (teacher01 is assigned two classes: primary1 and primary6, per the workbook)
INSERT INTO classes (class_code, class_name, subjects, schedule_days, schedule_time, room, teacher_id, status) VALUES
  ('primary1', 'Primary 1', 'English, Mathematics', 'Mon / Wed', '16:00-17:30', 'Room A', (SELECT teacher_id FROM teachers WHERE teacher_code = 'teacher01'), 'Active'),
  ('primary2', 'Primary 2', 'English, Mathematics', 'Tue / Thu', '16:00-17:30', 'Room B', (SELECT teacher_id FROM teachers WHERE teacher_code = 'teacher02'), 'Active'),
  ('primary3', 'Primary 3', 'English, Mathematics, Science', 'Mon / Wed', '17:45-19:15', 'Room A', (SELECT teacher_id FROM teachers WHERE teacher_code = 'teacher03'), 'Active'),
  ('primary4', 'Primary 4', 'Mathematics, Science', 'Tue / Thu', '17:45-19:15', 'Room B', (SELECT teacher_id FROM teachers WHERE teacher_code = 'teacher04'), 'Active'),
  ('primary5', 'Primary 5', 'English, Science', 'Sat', '09:00-11:00', 'Room C', (SELECT teacher_id FROM teachers WHERE teacher_code = 'teacher05'), 'Active'),
  ('primary6', 'Primary 6', 'English, Mathematics, Science (PSLE prep)', 'Sat', '11:15-13:15', 'Room C', (SELECT teacher_id FROM teachers WHERE teacher_code = 'teacher01'), 'Inactive')
ON CONFLICT (class_code) DO UPDATE SET class_name = EXCLUDED.class_name, subjects = EXCLUDED.subjects, schedule_days = EXCLUDED.schedule_days,
  schedule_time = EXCLUDED.schedule_time, room = EXCLUDED.room, teacher_id = EXCLUDED.teacher_id, status = EXCLUDED.status;

-- Students (25 rows, exact copy of the Students sheet)
INSERT INTO students (student_code, full_name, gender, age, class_id, guardian_name, guardian_phone, guardian_email, enrolment_date, status) VALUES
  ('primary1-student01', 'Aaron Lee', 'M', 7, (SELECT class_id FROM classes WHERE class_code = 'primary1'), 'Mrs Lee', '+65 8001 0037', 'aaron.lee@example.com', '2025-02-11', 'Active'),
  ('primary1-student02', 'Bella Teo', 'F', 7, (SELECT class_id FROM classes WHERE class_code = 'primary1'), 'Ms Teo', '+65 8002 0074', 'bella.teo@example.com', '2025-03-12', 'Active'),
  ('primary1-student03', 'Caleb Low', 'M', 7, (SELECT class_id FROM classes WHERE class_code = 'primary1'), 'Mr Low', '+65 8003 0111', 'caleb.low@example.com', '2025-04-13', 'Active'),
  ('primary1-student04', 'Diana Tan', 'F', 7, (SELECT class_id FROM classes WHERE class_code = 'primary1'), 'Mrs Tan', '+65 8004 0148', 'diana.tan@example.com', '2025-05-14', 'Active'),
  ('primary1-student05', 'Ethan Goh', 'M', 7, (SELECT class_id FROM classes WHERE class_code = 'primary1'), 'Ms Goh', '+65 8005 0185', 'ethan.goh@example.com', '2025-06-15', 'Active'),
  ('primary1-student06', 'Fiona Foo', 'F', 7, (SELECT class_id FROM classes WHERE class_code = 'primary1'), 'Mr Foo', '+65 8006 0222', 'fiona.foo@example.com', '2025-07-16', 'Active'),
  ('primary2-student01', 'Gavin Lim', 'M', 8, (SELECT class_id FROM classes WHERE class_code = 'primary2'), 'Mrs Lim', '+65 8007 0259', 'gavin.lim@example.com', '2025-08-17', 'Active'),
  ('primary2-student02', 'Hannah Wong', 'F', 8, (SELECT class_id FROM classes WHERE class_code = 'primary2'), 'Ms Wong', '+65 8008 0296', 'hannah.wong@example.com', '2025-01-18', 'Active'),
  ('primary2-student03', 'Ivan Ang', 'M', 8, (SELECT class_id FROM classes WHERE class_code = 'primary2'), 'Mr Ang', '+65 8009 0333', 'ivan.ang@example.com', '2025-02-19', 'Active'),
  ('primary2-student04', 'Jasmine Ng', 'F', 8, (SELECT class_id FROM classes WHERE class_code = 'primary2'), 'Mrs Ng', '+65 8010 0370', 'jasmine.ng@example.com', '2025-03-20', 'Active'),
  ('primary2-student05', 'Kevin Yeo', 'M', 8, (SELECT class_id FROM classes WHERE class_code = 'primary2'), 'Ms Yeo', '+65 8011 0407', 'kevin.yeo@example.com', '2025-04-21', 'Active'),
  ('primary3-student01', 'Lily Toh', 'F', 9, (SELECT class_id FROM classes WHERE class_code = 'primary3'), 'Mr Toh', '+65 8012 0444', 'lily.toh@example.com', '2025-05-22', 'Active'),
  ('primary3-student02', 'Marcus Ong', 'M', 9, (SELECT class_id FROM classes WHERE class_code = 'primary3'), 'Mrs Ong', '+65 8013 0481', 'marcus.ong@example.com', '2025-06-23', 'Active'),
  ('primary3-student03', 'Nadia Chan', 'F', 9, (SELECT class_id FROM classes WHERE class_code = 'primary3'), 'Ms Chan', '+65 8014 0518', 'nadia.chan@example.com', '2025-07-24', 'Active'),
  ('primary3-student04', 'Oscar Seah', 'M', 9, (SELECT class_id FROM classes WHERE class_code = 'primary3'), 'Mr Seah', '+65 8015 0555', 'oscar.seah@example.com', '2025-08-25', 'Active'),
  ('primary3-student05', 'Priya Chua', 'F', 9, (SELECT class_id FROM classes WHERE class_code = 'primary3'), 'Mrs Chua', '+65 8016 0592', 'priya.chua@example.com', '2025-01-26', 'Withdrawn'),
  ('primary4-student01', 'Ryan Ho', 'M', 10, (SELECT class_id FROM classes WHERE class_code = 'primary4'), 'Ms Ho', '+65 8017 0629', 'ryan.ho@example.com', '2025-02-27', 'Active'),
  ('primary4-student02', 'Sophie Chia', 'F', 10, (SELECT class_id FROM classes WHERE class_code = 'primary4'), 'Mr Chia', '+65 8018 0666', 'sophie.chia@example.com', '2025-03-10', 'Active'),
  ('primary4-student03', 'Tristan Koh', 'M', 10, (SELECT class_id FROM classes WHERE class_code = 'primary4'), 'Mrs Koh', '+65 8019 0703', 'tristan.koh@example.com', '2025-04-11', 'Active'),
  ('primary4-student04', 'Uma Sim', 'F', 10, (SELECT class_id FROM classes WHERE class_code = 'primary4'), 'Ms Sim', '+65 8020 0740', 'uma.sim@example.com', '2025-05-12', 'Active'),
  ('primary5-student01', 'Aaron Lee', 'M', 11, (SELECT class_id FROM classes WHERE class_code = 'primary5'), 'Mr Lee', '+65 8021 0777', 'aaron.lee@example.com', '2025-06-13', 'Active'),
  ('primary5-student02', 'Bella Teo', 'F', 11, (SELECT class_id FROM classes WHERE class_code = 'primary5'), 'Mrs Teo', '+65 8022 0814', 'bella.teo@example.com', '2025-07-14', 'Active'),
  ('primary5-student03', 'Caleb Low', 'M', 11, (SELECT class_id FROM classes WHERE class_code = 'primary5'), 'Ms Low', '+65 8023 0851', 'caleb.low@example.com', '2025-08-15', 'Active'),
  ('primary6-student01', 'Diana Tan', 'F', 12, (SELECT class_id FROM classes WHERE class_code = 'primary6'), 'Mr Tan', '+65 8024 0888', 'diana.tan@example.com', '2025-01-16', 'Active'),
  ('primary6-student02', 'Ethan Goh', 'M', 12, (SELECT class_id FROM classes WHERE class_code = 'primary6'), 'Mrs Goh', '+65 8025 0925', 'ethan.goh@example.com', '2025-02-17', 'Active')
ON CONFLICT (student_code) DO UPDATE SET full_name = EXCLUDED.full_name, gender = EXCLUDED.gender, age = EXCLUDED.age,
  class_id = EXCLUDED.class_id, guardian_name = EXCLUDED.guardian_name, guardian_phone = EXCLUDED.guardian_phone,
  guardian_email = EXCLUDED.guardian_email, enrolment_date = EXCLUDED.enrolment_date, status = EXCLUDED.status;

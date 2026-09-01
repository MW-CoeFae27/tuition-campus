CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE teachers (
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

CREATE TABLE classes (
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

CREATE TABLE students (
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

CREATE INDEX students_class_id_index ON students(class_id);
CREATE INDEX classes_teacher_id_index ON classes(teacher_id);

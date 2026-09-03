import "./env.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import XLSX from "xlsx";

const { Pool } = pg;
const directory = path.dirname(fileURLToPath(import.meta.url));
const workbookPath = path.join(directory, "..", "..", "tuition_school_dummy_data.xlsx");
const workbook = XLSX.readFile(workbookPath, { cellDates: true });
const rows = (sheet) => XLSX.utils.sheet_to_json(workbook.Sheets[sheet], { defval: null, raw: false });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const date = (value) => value ? String(value).slice(0, 10) : null;

const client = await pool.connect();
try {
  await client.query("BEGIN");
  const teacherIds = new Map();
  for (const teacher of rows("Teachers")) {
    const result = await client.query(`INSERT INTO teachers (teacher_code,full_name,email,phone,subject_specialty,join_date,status)
      VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (teacher_code) DO UPDATE SET full_name=EXCLUDED.full_name,email=EXCLUDED.email,phone=EXCLUDED.phone,subject_specialty=EXCLUDED.subject_specialty,join_date=EXCLUDED.join_date,status=EXCLUDED.status RETURNING teacher_id`, [teacher.teacher_code, teacher.full_name, teacher.email, teacher.phone, teacher.subject_specialty, date(teacher.join_date), teacher.status]);
    teacherIds.set(teacher.teacher_id, result.rows[0].teacher_id);
  }
  const classIds = new Map();
  for (const item of rows("Classes")) {
    const result = await client.query(`INSERT INTO classes (class_code,class_name,subjects,schedule_days,schedule_time,room,teacher_id,status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (class_code) DO UPDATE SET class_name=EXCLUDED.class_name,subjects=EXCLUDED.subjects,schedule_days=EXCLUDED.schedule_days,schedule_time=EXCLUDED.schedule_time,room=EXCLUDED.room,teacher_id=EXCLUDED.teacher_id,status=EXCLUDED.status RETURNING class_id`, [item.class_code, item.class_name, item.subjects, item.schedule_days, item.schedule_time, item.room, teacherIds.get(item.teacher_id) || null, item.status]);
    classIds.set(item.class_id, result.rows[0].class_id);
  }
  for (const student of rows("Students")) await client.query(`INSERT INTO students (student_code,full_name,gender,age,class_id,guardian_name,guardian_phone,guardian_email,enrolment_date,status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT (student_code) DO UPDATE SET full_name=EXCLUDED.full_name,gender=EXCLUDED.gender,age=EXCLUDED.age,class_id=EXCLUDED.class_id,guardian_name=EXCLUDED.guardian_name,guardian_phone=EXCLUDED.guardian_phone,guardian_email=EXCLUDED.guardian_email,enrolment_date=EXCLUDED.enrolment_date,status=EXCLUDED.status`, [student.student_code, student.full_name, student.gender, Number(student.age), classIds.get(student.class_id), student.guardian_name, student.guardian_phone, student.guardian_email, date(student.enrolment_date), student.status]);
  await client.query("COMMIT");
  console.log("Seed complete.");
} catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); await pool.end(); }

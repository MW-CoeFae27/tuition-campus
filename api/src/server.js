import "dotenv/config";
import cors from "cors";
import express from "express";
import pg from "pg";

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 3000;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true }));
app.use(express.json());

const asyncRoute = (handler) => (request, response, next) => Promise.resolve(handler(request, response, next)).catch(next);
const text = (value) => typeof value === "string" ? value.trim() : value;
const required = (body, fields) => fields.find((field) => !text(body[field]));
const validEmail = (value) => !value || emailPattern.test(value);
const databaseError = (error, response) => {
  if (error.code === "23505") return response.status(409).json({ error: "A record with that code already exists." });
  if (error.code === "23503") return response.status(400).json({ error: "The selected related record does not exist." });
  throw error;
};

app.get("/api/health", (_request, response) => response.json({ status: "ok" }));
app.get("/api/db-check", asyncRoute(async (_request, response) => {
  const { rows } = await pool.query("SELECT NOW() AS now");
  response.json({ now: rows[0].now });
}));

app.get("/api/classes", asyncRoute(async (_request, response) => {
  const { rows } = await pool.query(`SELECT c.*, t.full_name AS teacher_name, COUNT(s.student_id)::int AS student_count
    FROM classes c LEFT JOIN teachers t ON t.teacher_id = c.teacher_id
    LEFT JOIN students s ON s.class_id = c.class_id
    GROUP BY c.class_id, t.full_name ORDER BY c.class_code`);
  response.json(rows);
}));
app.get("/api/classes/:id", asyncRoute(async (request, response) => {
  const result = await pool.query(`SELECT c.*, t.full_name AS teacher_name, COUNT(s.student_id)::int AS student_count
    FROM classes c LEFT JOIN teachers t ON t.teacher_id = c.teacher_id LEFT JOIN students s ON s.class_id = c.class_id
    WHERE c.class_id = $1 GROUP BY c.class_id, t.full_name`, [request.params.id]);
  if (!result.rowCount) return response.status(404).json({ error: "Class not found." });
  const students = await pool.query("SELECT * FROM students WHERE class_id = $1 ORDER BY student_code", [request.params.id]);
  response.json({ ...result.rows[0], students: students.rows });
}));
app.post("/api/classes", asyncRoute(async (request, response) => {
  const missing = required(request.body, ["class_code", "class_name"]);
  if (missing) return response.status(400).json({ error: `${missing} is required.` });
  try {
    const { rows } = await pool.query(`INSERT INTO classes (class_code,class_name,subjects,schedule_days,schedule_time,room,teacher_id,status)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`, [text(request.body.class_code), text(request.body.class_name), text(request.body.subjects) || null, text(request.body.schedule_days) || null, text(request.body.schedule_time) || null, text(request.body.room) || null, request.body.teacher_id || null, request.body.status || "Active"]);
    response.status(201).json(rows[0]);
  } catch (error) { databaseError(error, response); }
}));
app.put("/api/classes/:id", asyncRoute(async (request, response) => {
  const missing = required(request.body, ["class_code", "class_name"]);
  if (missing) return response.status(400).json({ error: `${missing} is required.` });
  try {
    const { rows } = await pool.query(`UPDATE classes SET class_code=$1,class_name=$2,subjects=$3,schedule_days=$4,schedule_time=$5,room=$6,teacher_id=$7,status=$8,updated_at=NOW()
      WHERE class_id=$9 RETURNING *`, [text(request.body.class_code), text(request.body.class_name), text(request.body.subjects) || null, text(request.body.schedule_days) || null, text(request.body.schedule_time) || null, text(request.body.room) || null, request.body.teacher_id || null, request.body.status || "Active", request.params.id]);
    if (!rows.length) return response.status(404).json({ error: "Class not found." });
    response.json(rows[0]);
  } catch (error) { databaseError(error, response); }
}));
app.delete("/api/classes/:id", asyncRoute(async (request, response) => {
  const count = await pool.query("SELECT COUNT(*)::int AS count FROM students WHERE class_id=$1", [request.params.id]);
  if (count.rows[0].count) return response.status(409).json({ error: "This class has students. Reassign or delete them before deleting the class." });
  const result = await pool.query("DELETE FROM classes WHERE class_id=$1", [request.params.id]);
  if (!result.rowCount) return response.status(404).json({ error: "Class not found." });
  response.status(204).end();
}));

app.get("/api/teachers", asyncRoute(async (_request, response) => {
  const { rows } = await pool.query(`SELECT t.*, COALESCE(array_agg(c.class_name) FILTER (WHERE c.class_id IS NOT NULL), '{}') AS class_names
    FROM teachers t LEFT JOIN classes c ON c.teacher_id=t.teacher_id GROUP BY t.teacher_id ORDER BY t.teacher_code`);
  response.json(rows);
}));
app.get("/api/teachers/:id", asyncRoute(async (request, response) => {
  const result = await pool.query("SELECT * FROM teachers WHERE teacher_id=$1", [request.params.id]);
  if (!result.rowCount) return response.status(404).json({ error: "Teacher not found." });
  response.json(result.rows[0]);
}));
app.post("/api/teachers", asyncRoute(async (request, response) => {
  const missing = required(request.body, ["teacher_code", "full_name", "email"]);
  if (missing) return response.status(400).json({ error: `${missing} is required.` });
  if (!validEmail(text(request.body.email))) return response.status(400).json({ error: "A valid email is required." });
  try {
    const { rows } = await pool.query(`INSERT INTO teachers (teacher_code,full_name,email,phone,subject_specialty,join_date,status)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`, [text(request.body.teacher_code), text(request.body.full_name), text(request.body.email), text(request.body.phone) || null, text(request.body.subject_specialty) || null, request.body.join_date || null, request.body.status || "Active"]);
    response.status(201).json(rows[0]);
  } catch (error) { databaseError(error, response); }
}));
app.put("/api/teachers/:id", asyncRoute(async (request, response) => {
  const missing = required(request.body, ["teacher_code", "full_name", "email"]);
  if (missing) return response.status(400).json({ error: `${missing} is required.` });
  if (!validEmail(text(request.body.email))) return response.status(400).json({ error: "A valid email is required." });
  try {
    const { rows } = await pool.query(`UPDATE teachers SET teacher_code=$1,full_name=$2,email=$3,phone=$4,subject_specialty=$5,join_date=$6,status=$7,updated_at=NOW()
      WHERE teacher_id=$8 RETURNING *`, [text(request.body.teacher_code), text(request.body.full_name), text(request.body.email), text(request.body.phone) || null, text(request.body.subject_specialty) || null, request.body.join_date || null, request.body.status || "Active", request.params.id]);
    if (!rows.length) return response.status(404).json({ error: "Teacher not found." });
    response.json(rows[0]);
  } catch (error) { databaseError(error, response); }
}));
app.delete("/api/teachers/:id", asyncRoute(async (request, response) => {
  const client = await pool.connect();
  try { await client.query("BEGIN"); await client.query("UPDATE classes SET teacher_id=NULL, updated_at=NOW() WHERE teacher_id=$1", [request.params.id]); const result = await client.query("DELETE FROM teachers WHERE teacher_id=$1", [request.params.id]); await client.query("COMMIT"); if (!result.rowCount) return response.status(404).json({ error: "Teacher not found." }); response.status(204).end(); }
  catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
}));

app.get("/api/students", asyncRoute(async (request, response) => {
  const values = []; let where = "";
  if (request.query.class_id) { values.push(request.query.class_id); where = "WHERE s.class_id=$1"; }
  const { rows } = await pool.query(`SELECT s.*, c.class_code, c.class_name FROM students s JOIN classes c ON c.class_id=s.class_id ${where} ORDER BY s.student_code`, values);
  response.json(rows);
}));
app.get("/api/students/:id", asyncRoute(async (request, response) => {
  const result = await pool.query("SELECT * FROM students WHERE student_id=$1", [request.params.id]);
  if (!result.rowCount) return response.status(404).json({ error: "Student not found." }); response.json(result.rows[0]);
}));
const studentValues = (body) => [text(body.student_code), text(body.full_name), text(body.gender) || null, body.age || null, body.class_id, text(body.guardian_name) || null, text(body.guardian_phone) || null, text(body.guardian_email) || null, body.enrolment_date || null, body.status || "Active"];
const validateStudent = (body, response) => { const missing = required(body, ["student_code", "full_name", "class_id"]); if (missing) { response.status(400).json({ error: `${missing} is required.` }); return false; } if (!validEmail(text(body.guardian_email))) { response.status(400).json({ error: "Guardian email is invalid." }); return false; } return true; };
app.post("/api/students", asyncRoute(async (request, response) => { if (!validateStudent(request.body, response)) return; try { const { rows } = await pool.query(`INSERT INTO students (student_code,full_name,gender,age,class_id,guardian_name,guardian_phone,guardian_email,enrolment_date,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`, studentValues(request.body)); response.status(201).json(rows[0]); } catch (error) { databaseError(error, response); } }));
app.put("/api/students/:id", asyncRoute(async (request, response) => { if (!validateStudent(request.body, response)) return; try { const { rows } = await pool.query(`UPDATE students SET student_code=$1,full_name=$2,gender=$3,age=$4,class_id=$5,guardian_name=$6,guardian_phone=$7,guardian_email=$8,enrolment_date=$9,status=$10,updated_at=NOW() WHERE student_id=$11 RETURNING *`, [...studentValues(request.body), request.params.id]); if (!rows.length) return response.status(404).json({ error: "Student not found." }); response.json(rows[0]); } catch (error) { databaseError(error, response); } }));
app.delete("/api/students/:id", asyncRoute(async (request, response) => { const result = await pool.query("DELETE FROM students WHERE student_id=$1", [request.params.id]); if (!result.rowCount) return response.status(404).json({ error: "Student not found." }); response.status(204).end(); }));

app.use((error, _request, response, _next) => { console.error(error); response.status(500).json({ error: "An unexpected server error occurred." }); });
app.listen(port, () => console.log(`API listening on ${port}`));

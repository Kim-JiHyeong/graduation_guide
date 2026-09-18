import { DatabaseSync } from "node:sqlite";
import path from "path";
import { fileURLToPath } from "url";
import { defaultRequirements } from "./defaultRequirements.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "data", "app.db");

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    student_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS requirements (
    user_id TEXT PRIMARY KEY REFERENCES users(id),
    data TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    category_id TEXT NOT NULL,
    credits REAL NOT NULL,
    semester TEXT
  );
`);

export function createUser({ id, studentId, name, passwordHash }) {
  db.prepare(
    `INSERT INTO users (id, student_id, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)`
  ).run(id, studentId, name, passwordHash, new Date().toISOString());

  db.prepare(`INSERT INTO requirements (user_id, data) VALUES (?, ?)`).run(
    id,
    JSON.stringify(defaultRequirements)
  );
}

export function getUserByStudentId(studentId) {
  return db.prepare(`SELECT * FROM users WHERE student_id = ?`).get(studentId);
}

export function getUserById(id) {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
}

export function getRequirements(userId) {
  const row = db
    .prepare(`SELECT data FROM requirements WHERE user_id = ?`)
    .get(userId);
  return row ? JSON.parse(row.data) : null;
}

export function saveRequirements(userId, data) {
  db.prepare(
    `INSERT INTO requirements (user_id, data) VALUES (?, ?)
     ON CONFLICT(user_id) DO UPDATE SET data = excluded.data`
  ).run(userId, JSON.stringify(data));
}

export function getCourses(userId) {
  const rows = db
    .prepare(`SELECT * FROM courses WHERE user_id = ? ORDER BY rowid`)
    .all(userId);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    categoryId: r.category_id,
    credits: r.credits,
    semester: r.semester,
  }));
}

export function addCourse(userId, course) {
  const id = crypto.randomUUID();
  db.prepare(
    `INSERT INTO courses (id, user_id, name, category_id, credits, semester) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(id, userId, course.name, course.categoryId, course.credits, course.semester || "");
  return { id, ...course };
}

export function updateCourse(userId, id, course) {
  const existing = db
    .prepare(`SELECT * FROM courses WHERE id = ? AND user_id = ?`)
    .get(id, userId);
  if (!existing) return null;
  const merged = {
    name: course.name ?? existing.name,
    categoryId: course.categoryId ?? existing.category_id,
    credits: course.credits ?? existing.credits,
    semester: course.semester ?? existing.semester,
  };
  db.prepare(
    `UPDATE courses SET name = ?, category_id = ?, credits = ?, semester = ? WHERE id = ? AND user_id = ?`
  ).run(merged.name, merged.categoryId, merged.credits, merged.semester, id, userId);
  return { id, ...merged };
}

export function deleteCourse(userId, id) {
  db.prepare(`DELETE FROM courses WHERE id = ? AND user_id = ?`).run(id, userId);
}

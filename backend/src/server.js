import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import {
  createUser,
  getUserByStudentId,
  getUserById,
  getRequirements as dbGetRequirements,
  saveRequirements as dbSaveRequirements,
  getCourses as dbGetCourses,
  addCourse as dbAddCourse,
  updateCourse as dbUpdateCourse,
  deleteCourse as dbDeleteCourse,
} from "./db.js";
import {
  hashPassword,
  verifyPassword,
  signToken,
  setAuthCookie,
  clearAuthCookie,
  authMiddleware,
} from "./auth.js";
import { calculateStatus } from "./calculate.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ---------- Auth ----------

app.post("/api/auth/signup", async (req, res) => {
  const { studentId, name, password } = req.body || {};
  if (!studentId || !name || !password) {
    return res.status(400).json({ error: "학번, 이름, 비밀번호를 모두 입력하세요." });
  }
  if (password.length < 4) {
    return res.status(400).json({ error: "비밀번호는 4자 이상이어야 합니다." });
  }
  if (getUserByStudentId(studentId)) {
    return res.status(409).json({ error: "이미 등록된 학번입니다." });
  }
  const passwordHash = await hashPassword(password);
  const id = crypto.randomUUID();
  createUser({ id, studentId, name, passwordHash });
  const token = signToken(id);
  setAuthCookie(res, token);
  res.status(201).json({ id, studentId, name });
});

app.post("/api/auth/login", async (req, res) => {
  const { studentId, password } = req.body || {};
  const user = getUserByStudentId(studentId || "");
  if (!user) return res.status(401).json({ error: "학번 또는 비밀번호가 올바르지 않습니다." });
  const ok = await verifyPassword(password || "", user.password_hash);
  if (!ok) return res.status(401).json({ error: "학번 또는 비밀번호가 올바르지 않습니다." });
  const token = signToken(user.id);
  setAuthCookie(res, token);
  res.json({ id: user.id, studentId: user.student_id, name: user.name });
});

app.post("/api/auth/logout", (req, res) => {
  clearAuthCookie(res);
  res.status(204).end();
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  const user = getUserById(req.userId);
  if (!user) return res.status(401).json({ error: "로그인이 필요합니다." });
  res.json({ id: user.id, studentId: user.student_id, name: user.name });
});

// ---------- Data (per-user) ----------

app.get("/api/requirements", authMiddleware, (req, res) => {
  res.json(dbGetRequirements(req.userId));
});

app.put("/api/requirements", authMiddleware, (req, res) => {
  dbSaveRequirements(req.userId, req.body);
  res.json(req.body);
});

app.get("/api/courses", authMiddleware, (req, res) => {
  res.json(dbGetCourses(req.userId));
});

app.post("/api/courses", authMiddleware, (req, res) => {
  const course = dbAddCourse(req.userId, req.body);
  res.status(201).json(course);
});

app.put("/api/courses/:id", authMiddleware, (req, res) => {
  const course = dbUpdateCourse(req.userId, req.params.id, req.body);
  if (!course) return res.status(404).json({ error: "Course not found" });
  res.json(course);
});

app.delete("/api/courses/:id", authMiddleware, (req, res) => {
  dbDeleteCourse(req.userId, req.params.id);
  res.status(204).end();
});

app.get("/api/status", authMiddleware, (req, res) => {
  const requirements = dbGetRequirements(req.userId);
  const courses = dbGetCourses(req.userId);
  res.json(calculateStatus(requirements, courses));
});

// ---------- Serve built frontend in production ----------

if (process.env.NODE_ENV === "production") {
  const frontendDist = path.join(__dirname, "..", "..", "frontend", "dist");
  app.use(express.static(frontendDist));
  app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`졸업요건계산기 backend listening on http://localhost:${PORT}`);
});

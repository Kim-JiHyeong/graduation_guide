import { buildRequirements } from "./defaultRequirements";
import type { CourseTakeStatus, GeneralCourseEntry, StudentData } from "./types";

const STORAGE_KEY = "gradcalc:v2:data";

function isBrowser() {
  return typeof window !== "undefined";
}

export function loadData(): StudentData | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StudentData) : null;
  } catch {
    return null;
  }
}

function save(data: StudentData) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// 개인정보(학번 뒷자리, 이름 등)는 저장하지 않는다 — 입학년도(연도)만 선택해서 저장.
export function initData(admissionYear: number): StudentData {
  const data: StudentData = {
    requirements: buildRequirements(admissionYear),
    majorCourseStatus: {},
    generalCourses: [],
  };
  save(data);
  return data;
}

export function changeAdmissionYear(admissionYear: number): StudentData {
  const current = loadData();
  const next: StudentData = {
    requirements: buildRequirements(admissionYear),
    majorCourseStatus: current?.majorCourseStatus ?? {},
    generalCourses: current?.generalCourses ?? [],
  };
  save(next);
  return next;
}

export function setMajorCourseStatus(
  courseId: string,
  status: CourseTakeStatus | null
): StudentData {
  const data = loadData();
  if (!data) throw new Error("초기화되지 않았습니다.");
  const next = { ...data.majorCourseStatus };
  if (status) {
    next[courseId] = status;
  } else {
    delete next[courseId];
  }
  const updated = { ...data, majorCourseStatus: next };
  save(updated);
  return updated;
}

export function addGeneralCourse(
  entry: Omit<GeneralCourseEntry, "id">
): StudentData {
  const data = loadData();
  if (!data) throw new Error("초기화되지 않았습니다.");
  const newEntry: GeneralCourseEntry = { id: crypto.randomUUID(), ...entry };
  const updated = { ...data, generalCourses: [...data.generalCourses, newEntry] };
  save(updated);
  return updated;
}

export function removeGeneralCourse(id: string): StudentData {
  const data = loadData();
  if (!data) throw new Error("초기화되지 않았습니다.");
  const updated = {
    ...data,
    generalCourses: data.generalCourses.filter((c) => c.id !== id),
  };
  save(updated);
  return updated;
}

export function updateGeneralCourseStatus(
  id: string,
  status: CourseTakeStatus
): StudentData {
  const data = loadData();
  if (!data) throw new Error("초기화되지 않았습니다.");
  const updated = {
    ...data,
    generalCourses: data.generalCourses.map((c) =>
      c.id === id ? { ...c, status } : c
    ),
  };
  save(updated);
  return updated;
}

export function setCertificationScore(areaId: string, score: number): StudentData {
  const data = loadData();
  if (!data) throw new Error("초기화되지 않았습니다.");
  const updated = {
    ...data,
    requirements: {
      ...data.requirements,
      certificationAreas: data.requirements.certificationAreas.map((a) =>
        a.id === areaId ? { ...a, score } : a
      ),
    },
  };
  save(updated);
  return updated;
}

export function resetAll() {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}

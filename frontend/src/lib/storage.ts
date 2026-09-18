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
    return raw ? normalizeData(JSON.parse(raw) as Partial<StudentData>) : null;
  } catch {
    return null;
  }
}

function save(data: StudentData) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function normalizeData(data: Partial<StudentData>): StudentData {
  const admissionYear = data.requirements?.admissionYear ?? 2022;
  const requirements = buildRequirements(admissionYear);
  const scoreByArea = new Map(
    data.requirements?.certificationAreas?.map((a) => [a.id, a.score]) ?? []
  );
  const fieldTrainingCredits = Number(data.fieldTraining?.credits);
  const fieldTrainingStatus = data.fieldTraining?.status;

  return {
    requirements: {
      ...requirements,
      certificationAreas: requirements.certificationAreas.map((a) => ({
        ...a,
        score: scoreByArea.get(a.id) ?? a.score,
      })),
    },
    majorCourseStatus: data.majorCourseStatus ?? {},
    generalCourseStatus: data.generalCourseStatus ?? {},
    generalCourses: (data.generalCourses ?? []).map((course) => ({
      ...course,
      areaId: course.areaId ?? "general_unclassified",
      areaName: course.areaName ?? "교양-영역 미지정",
    })),
    fieldTraining: {
      credits:
        Number.isFinite(fieldTrainingCredits) && fieldTrainingCredits >= 0
          ? fieldTrainingCredits
          : 0,
      status:
        fieldTrainingStatus === "completed" || fieldTrainingStatus === "planned"
          ? fieldTrainingStatus
          : null,
    },
  };
}

// 개인정보(학번 뒷자리, 이름 등)는 저장하지 않는다 — 입학년도(연도)만 선택해서 저장.
export function initData(admissionYear: number): StudentData {
  const data: StudentData = {
    requirements: buildRequirements(admissionYear),
    majorCourseStatus: {},
    generalCourseStatus: {},
    generalCourses: [],
    fieldTraining: { credits: 0, status: null },
  };
  save(data);
  return data;
}

export function changeAdmissionYear(admissionYear: number): StudentData {
  const current = loadData();
  const next: StudentData = {
    requirements: buildRequirements(admissionYear),
    majorCourseStatus: current?.majorCourseStatus ?? {},
    generalCourseStatus: current?.generalCourseStatus ?? {},
    generalCourses: current?.generalCourses ?? [],
    fieldTraining: current?.fieldTraining ?? { credits: 0, status: null },
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

export function setGeneralCourseStatus(
  courseId: string,
  status: CourseTakeStatus | null
): StudentData {
  const data = loadData();
  if (!data) throw new Error("초기화되지 않았습니다.");
  const next = { ...data.generalCourseStatus };
  if (status) {
    next[courseId] = status;
  } else {
    delete next[courseId];
  }
  const updated = { ...data, generalCourseStatus: next };
  save(updated);
  return updated;
}

export function resetMajorCourses(): StudentData {
  const data = loadData();
  if (!data) throw new Error("초기화되지 않았습니다.");
  const updated = {
    ...data,
    majorCourseStatus: {},
    fieldTraining: { credits: 0, status: null },
  };
  save(updated);
  return updated;
}

export function setFieldTrainingStatus(status: CourseTakeStatus | null): StudentData {
  const data = loadData();
  if (!data) throw new Error("초기화되지 않았습니다.");
  const updated = {
    ...data,
    fieldTraining: { ...data.fieldTraining, status },
  };
  save(updated);
  return updated;
}

export function setFieldTrainingCredits(credits: number): StudentData {
  const data = loadData();
  if (!data) throw new Error("초기화되지 않았습니다.");
  if (!Number.isFinite(credits) || credits < 0) return data;
  const updated = {
    ...data,
    fieldTraining: { ...data.fieldTraining, credits },
  };
  save(updated);
  return updated;
}

export function resetGeneralCourses(): StudentData {
  const data = loadData();
  if (!data) throw new Error("초기화되지 않았습니다.");
  const updated = {
    ...data,
    generalCourseStatus: {},
    generalCourses: [],
  };
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

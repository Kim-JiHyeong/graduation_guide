export type CourseTakeStatus = "completed" | "planned";

export interface MajorCourseDef {
  id: string;
  name: string;
  credits: number;
  kind: "required" | "elective";
}

export interface CertificationArea {
  id: string;
  name: string;
  score: number; // 0~100
  description: string;
}

export interface Requirements {
  department: string;
  admissionYear: number;
  isVerified: boolean; // 실제 학교 자료로 검증된 학번인지 (지금은 2022만 true)
  totalCreditsRequired: number;
  generalCreditsRequired: number;
  majorCreditsRequired: number; // 전공필수 + 전공선택 합계 최소
  majorRequiredCreditsRequired: number; // 전공필수만
  majorCourses: MajorCourseDef[];
  certificationRule: string;
  certificationAreas: CertificationArea[];
}

export interface GeneralCourseEntry {
  id: string;
  name: string;
  credits: number;
  status: CourseTakeStatus;
}

export interface StudentData {
  requirements: Requirements;
  majorCourseStatus: Record<string, CourseTakeStatus>; // courseId -> status
  generalCourses: GeneralCourseEntry[];
}

export interface MetricResult {
  label: string;
  completed: number;
  required: number;
  isSatisfied: boolean;
}

export interface CalculatedStatus {
  total: MetricResult;
  general: MetricResult;
  major: MetricResult;
  majorRequired: MetricResult;
  missingMajorRequired: MajorCourseDef[];
  certificationSatisfied: boolean;
  isGraduationReady: boolean;
}

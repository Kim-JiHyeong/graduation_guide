export type CourseTakeStatus = "completed" | "planned";

export interface MajorCourseEquivalent {
  statusId: string;
  code: string;
  name: string;
  credits: number;
  relation: "same" | "substitute";
  curriculumYear: number | null;
  sourceOrder: number;
  satisfiesRequired: boolean;
}

export interface MajorCourseDef {
  id: string;
  code: string;
  name: string;
  credits: number;
  kind: "required" | "elective";
  curriculumYear: number;
  equivalents: MajorCourseEquivalent[];
}

export interface GeneralCourseDef {
  id: string;
  code: string;
  name: string;
  credits: number;
  areaId: string;
  areaName: string;
}

export interface GeneralEducationRequirements {
  commonRequiredCredits: number;
  advancedRequiredCredits: number;
  advancedRequiredCourses: {
    code: string;
    name: string;
    credits: number;
  }[];
  requiredCourses: {
    code: string;
    name: string;
    credits: number;
  }[];
  oneOfCourseGroups: {
    id: string;
    label: string;
    codes: string[];
    credits: number;
  }[];
  areaMinimums: {
    areaId: string;
    label: string;
    credits: number;
  }[];
  advancedAreaPrefix: string;
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
  generalCourseCatalog: GeneralCourseDef[];
  generalEducationRequirements: GeneralEducationRequirements;
  certificationRule: string;
  certificationAreas: CertificationArea[];
}

export interface GeneralCourseEntry {
  id: string;
  name: string;
  credits: number;
  status: CourseTakeStatus;
}

export interface FieldTrainingState {
  credits: number;
  status: CourseTakeStatus | null;
}

export interface StudentData {
  requirements: Requirements;
  majorCourseStatus: Record<string, CourseTakeStatus>; // courseId -> status
  generalCourseStatus: Record<string, CourseTakeStatus>; // courseId -> status
  generalCourses: GeneralCourseEntry[]; // 목록에 없는 교양 과목 직접 입력분
  fieldTraining: FieldTrainingState;
}

export interface MetricResult {
  label: string;
  completed: number;
  required: number;
  isSatisfied: boolean;
}

export interface GeneralRequirementIssue {
  id: string;
  label: string;
  details: string[];
}

export interface CalculatedStatus {
  total: MetricResult;
  general: MetricResult;
  major: MetricResult;
  majorRequired: MetricResult;
  commonGeneral: MetricResult;
  advancedGeneral: MetricResult;
  missingMajorRequired: MajorCourseDef[];
  missingGeneralRequirements: GeneralRequirementIssue[];
  certificationSatisfied: boolean;
  isGraduationReady: boolean;
}

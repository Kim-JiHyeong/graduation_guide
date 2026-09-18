import type {
  CalculatedStatus,
  CourseTakeStatus,
  GeneralCourseEntry,
  MajorCourseDef,
  MetricResult,
  Requirements,
} from "./types";

function metric(label: string, completed: number, required: number): MetricResult {
  return {
    label,
    completed,
    required,
    isSatisfied: completed >= required,
  };
}

function countsAs(status: CourseTakeStatus | undefined, includePlanned: boolean): boolean {
  if (!status) return false;
  if (status === "completed") return true;
  return includePlanned; // status === "planned"
}

/**
 * includePlanned=false: 지금까지 실제로 이수완료한 것만 반영 ("현재 상태")
 * includePlanned=true: 수강예정 과목까지 포함해서 계산 ("이 과목들을 들으면 졸업 가능한가")
 */
export function calculateStatus(
  requirements: Requirements,
  majorCourseStatus: Record<string, CourseTakeStatus>,
  generalCourses: GeneralCourseEntry[],
  includePlanned: boolean
): CalculatedStatus {
  let majorCredits = 0;
  let majorRequiredCredits = 0;
  const missingMajorRequired: MajorCourseDef[] = [];

  for (const course of requirements.majorCourses) {
    const status = majorCourseStatus[course.id];
    const taken = countsAs(status, includePlanned);
    if (taken) {
      majorCredits += course.credits;
      if (course.kind === "required") majorRequiredCredits += course.credits;
    } else if (course.kind === "required") {
      missingMajorRequired.push(course);
    }
  }

  let generalCredits = 0;
  for (const entry of generalCourses) {
    if (countsAs(entry.status, includePlanned)) {
      generalCredits += entry.credits;
    }
  }

  const totalCredits = majorCredits + generalCredits;

  const certificationSatisfied = requirements.certificationAreas.some(
    (a) => a.score >= 100
  );

  const total = metric("총 졸업학점", totalCredits, requirements.totalCreditsRequired);
  const general = metric("교양학점", generalCredits, requirements.generalCreditsRequired);
  const major = metric("전공학점", majorCredits, requirements.majorCreditsRequired);
  const majorRequired = metric(
    "전공필수",
    majorRequiredCredits,
    requirements.majorRequiredCreditsRequired
  );

  const isGraduationReady =
    total.isSatisfied &&
    general.isSatisfied &&
    major.isSatisfied &&
    majorRequired.isSatisfied &&
    certificationSatisfied;

  return {
    total,
    general,
    major,
    majorRequired,
    missingMajorRequired,
    certificationSatisfied,
    isGraduationReady,
  };
}

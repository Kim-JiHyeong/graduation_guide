import type {
  CalculatedStatus,
  CourseTakeStatus,
  FieldTrainingState,
  GeneralCourseEntry,
  GeneralRequirementIssue,
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
  generalCourseStatus: Record<string, CourseTakeStatus>,
  generalCourses: GeneralCourseEntry[],
  fieldTraining: FieldTrainingState,
  includePlanned: boolean
): CalculatedStatus {
  let majorCredits = 0;
  let majorRequiredCredits = 0;
  const missingMajorRequired: MajorCourseDef[] = [];

  for (const course of requirements.majorCourses) {
    const canonicalTaken = countsAs(majorCourseStatus[course.id], includePlanned);
    let requiredSatisfied = canonicalTaken && course.kind === "required";
    if (canonicalTaken) {
      majorCredits += course.credits;
    }

    for (const equivalent of course.equivalents) {
      if (countsAs(majorCourseStatus[equivalent.statusId], includePlanned)) {
        majorCredits += equivalent.credits;
        if (equivalent.satisfiesRequired) requiredSatisfied = true;
      }
    }

    if (course.kind === "required" && requiredSatisfied) {
      majorRequiredCredits += course.credits;
    } else if (course.kind === "required") {
      missingMajorRequired.push(course);
    }
  }

  if (
    countsAs(fieldTraining.status ?? undefined, includePlanned) &&
    Number.isFinite(fieldTraining.credits) &&
    fieldTraining.credits > 0
  ) {
    majorCredits += fieldTraining.credits;
  }

  let generalCredits = 0;
  const completedGeneralCourses = [] as Requirements["generalCourseCatalog"];
  for (const course of requirements.generalCourseCatalog) {
    const status = generalCourseStatus[course.id];
    if (countsAs(status, includePlanned)) {
      generalCredits += course.credits;
      completedGeneralCourses.push(course);
    }
  }

  for (const entry of generalCourses) {
    if (countsAs(entry.status, includePlanned)) {
      generalCredits += entry.credits;
    }
  }

  const totalCredits = majorCredits + generalCredits;

  const generalRules = requirements.generalEducationRequirements;
  const completedCodes = new Set(completedGeneralCourses.map((course) => course.code));
  const creditsByArea = new Map<string, number>();
  for (const course of completedGeneralCourses) {
    creditsByArea.set(course.areaId, (creditsByArea.get(course.areaId) ?? 0) + course.credits);
  }

  const foundationDetails: string[] = [];
  let commonGeneralCredits = 0;
  for (const rule of generalRules.requiredCourses) {
    if (completedCodes.has(rule.code)) {
      commonGeneralCredits += rule.credits;
    } else {
      foundationDetails.push(`${rule.name} ${rule.credits}학점 미이수`);
    }
  }
  for (const group of generalRules.oneOfCourseGroups) {
    if (group.codes.some((code) => completedCodes.has(code))) {
      commonGeneralCredits += group.credits;
    } else {
      foundationDetails.push(`${group.label} 중 택1 ${group.credits}학점 필요`);
    }
  }

  const missingGeneralRequirements: GeneralRequirementIssue[] = [];
  if (foundationDetails.length > 0) {
    missingGeneralRequirements.push({
      id: "common_foundation",
      label: "기초",
      details: foundationDetails,
    });
  }

  for (const rule of generalRules.areaMinimums) {
    const completed = creditsByArea.get(rule.areaId) ?? 0;
    commonGeneralCredits += Math.min(completed, rule.credits);
    if (completed < rule.credits) {
      const shortage = rule.credits - completed;
      missingGeneralRequirements.push({
        id: rule.areaId,
        label: rule.label,
        details: [
          completed === 0
            ? `${rule.credits}학점 필요`
            : `${completed} / ${rule.credits}학점 (${shortage}학점 부족)`,
        ],
      });
    }
  }

  const advancedGeneralCredits = completedGeneralCourses
    .filter((course) => course.areaId.startsWith(generalRules.advancedAreaPrefix))
    .reduce((sum, course) => sum + course.credits, 0);
  const advancedDetails = generalRules.advancedRequiredCourses
    .filter((course) => !completedCodes.has(course.code))
    .map((course) => `${course.name} ${course.credits}학점 미이수`);
  if (advancedGeneralCredits < generalRules.advancedRequiredCredits) {
    advancedDetails.push(
      `${advancedGeneralCredits} / ${generalRules.advancedRequiredCredits}학점 (${generalRules.advancedRequiredCredits - advancedGeneralCredits}학점 부족)`
    );
  }
  if (advancedDetails.length > 0) {
    missingGeneralRequirements.push({
      id: "advanced_general",
      label: "심화교양",
      details: advancedDetails,
    });
  }

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
  const commonGeneral = metric(
    "공통교양",
    commonGeneralCredits,
    generalRules.commonRequiredCredits
  );
  const advancedGeneral = metric(
    "심화교양",
    advancedGeneralCredits,
    generalRules.advancedRequiredCredits
  );
  advancedGeneral.isSatisfied =
    advancedGeneral.isSatisfied &&
    generalRules.advancedRequiredCourses.every((course) => completedCodes.has(course.code));

  const isGraduationReady =
    total.isSatisfied &&
    general.isSatisfied &&
    major.isSatisfied &&
    majorRequired.isSatisfied &&
    commonGeneral.isSatisfied &&
    advancedGeneral.isSatisfied &&
    certificationSatisfied;

  return {
    total,
    general,
    major,
    majorRequired,
    commonGeneral,
    advancedGeneral,
    missingMajorRequired,
    missingGeneralRequirements,
    certificationSatisfied,
    isGraduationReady,
  };
}

import type { CalculatedStatus } from "./types";

export function formatStatusSummary(current: CalculatedStatus, projected: CalculatedStatus): string {
  const line = (s: CalculatedStatus["total"]) =>
    `${s.label}: ${s.completed}/${s.required} (${s.isSatisfied ? "충족" : "부족"})`;

  const missing = current.missingMajorRequired.map((c) => c.name).join(", ") || "없음";
  const missingProjected =
    projected.missingMajorRequired.map((c) => c.name).join(", ") || "없음";
  const generalMissing = (status: CalculatedStatus) =>
    status.missingGeneralRequirements
      .map((requirement) => `${requirement.label}: ${requirement.details.join(", ")}`)
      .join(" / ") || "없음";
  const generalSelectionLine = (status: CalculatedStatus) =>
    `일반선택: ${status.generalSelection.completed}/${status.generalSelection.limit} (졸업학점 반영 ${status.generalSelection.applied})`;

  return [
    "[현재 이수완료 기준]",
    line(current.total),
    line(current.general),
    line(current.major),
    line(current.majorRequired),
    line(current.commonGeneral),
    line(current.advancedGeneral),
    generalSelectionLine(current),
    `졸업자격인증제: ${current.certificationSatisfied ? "충족" : "미충족"}`,
    `미이수 전공필수: ${missing}`,
    `미이수 교양요건: ${generalMissing(current)}`,
    `졸업 가능 여부: ${current.isGraduationReady ? "예" : "아니오"}`,
    "",
    "[수강예정 과목까지 포함한 기준]",
    line(projected.total),
    line(projected.general),
    line(projected.major),
    line(projected.majorRequired),
    line(projected.commonGeneral),
    line(projected.advancedGeneral),
    generalSelectionLine(projected),
    `미이수 전공필수: ${missingProjected}`,
    `미이수 교양요건: ${generalMissing(projected)}`,
    `졸업 가능 여부: ${projected.isGraduationReady ? "예" : "아니오"}`,
  ].join("\n");
}

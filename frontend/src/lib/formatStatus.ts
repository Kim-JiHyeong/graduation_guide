import type { CalculatedStatus } from "./types";

export function formatStatusSummary(current: CalculatedStatus, projected: CalculatedStatus): string {
  const line = (s: CalculatedStatus["total"]) =>
    `${s.label}: ${s.completed}/${s.required} (${s.isSatisfied ? "충족" : "부족"})`;

  const missing = current.missingMajorRequired.map((c) => c.name).join(", ") || "없음";
  const missingProjected =
    projected.missingMajorRequired.map((c) => c.name).join(", ") || "없음";

  return [
    "[현재 이수완료 기준]",
    line(current.total),
    line(current.general),
    line(current.major),
    line(current.majorRequired),
    `졸업자격인증제: ${current.certificationSatisfied ? "충족" : "미충족"}`,
    `미이수 전공필수: ${missing}`,
    `졸업 가능 여부: ${current.isGraduationReady ? "예" : "아니오"}`,
    "",
    "[수강예정 과목까지 포함한 기준]",
    line(projected.total),
    line(projected.general),
    line(projected.major),
    line(projected.majorRequired),
    `미이수 전공필수: ${missingProjected}`,
    `졸업 가능 여부: ${projected.isGraduationReady ? "예" : "아니오"}`,
  ].join("\n");
}

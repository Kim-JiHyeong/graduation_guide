"use client";

import { useMemo, useState } from "react";
import type {
  CourseTakeStatus,
  FieldTrainingState,
  MajorCourseDef,
} from "@/lib/types";
import { useCourseSearch } from "@/hooks/useCourseSearch";
import CourseSearchBar from "./CourseSearchBar";
import CourseStatusPicker from "./CourseStatusPicker";

function normalizeCourseName(name: string) {
  return name.replace(/\s+/g, "").toLocaleLowerCase("ko-KR");
}

function getVisibleEquivalents(course: MajorCourseDef) {
  const seen = new Set([normalizeCourseName(course.name)]);
  return [...course.equivalents]
    .sort((a, b) => {
      if (a.curriculumYear === null && b.curriculumYear !== null) return -1;
      if (a.curriculumYear !== null && b.curriculumYear === null) return 1;
      if (a.curriculumYear !== null && b.curriculumYear !== null) {
        return a.curriculumYear - b.curriculumYear || a.sourceOrder - b.sourceOrder;
      }
      return a.sourceOrder - b.sourceOrder;
    })
    .filter((equivalent) => {
      const normalizedName = normalizeCourseName(equivalent.name);
      if (seen.has(normalizedName)) return false;
      seen.add(normalizedName);
      return true;
    });
}

function CourseRow({
  course,
  statusMap,
  onChangeStatus,
  expanded,
  onToggleExpanded,
  highlighted,
}: {
  course: MajorCourseDef;
  statusMap: Record<string, CourseTakeStatus>;
  onChangeStatus: (courseId: string, status: CourseTakeStatus | null) => void;
  expanded: boolean;
  onToggleExpanded: () => void;
  highlighted: boolean;
}) {
  const equivalents = getVisibleEquivalents(course);
  const completedEquivalentCount = equivalents.filter(
    (equivalent) => statusMap[equivalent.statusId] === "completed"
  ).length;
  const plannedEquivalentCount = equivalents.filter(
    (equivalent) => statusMap[equivalent.statusId] === "planned"
  ).length;

  return (
    <li
      id={`major-course-${course.id}`}
      className={`scroll-mt-36 rounded-lg bg-bg-subtle px-3 py-2 transition-shadow ${
        highlighted ? "ring-2 ring-accent" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        {equivalents.length > 0 ? (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={onToggleExpanded}
            className="flex min-w-0 flex-1 self-stretch items-center gap-1 text-left text-sm font-medium text-text-h"
          >
            <span>
              {course.name} <span className="text-text/50">· {course.credits}학점</span>
              {completedEquivalentCount > 0 && (
                <span className="ml-2 text-xs font-semibold text-success">
                  이전 과목 {completedEquivalentCount}개 이수완료
                </span>
              )}
              {plannedEquivalentCount > 0 && (
                <span className="ml-2 text-xs font-semibold text-accent">
                  이전 과목 {plannedEquivalentCount}개 수강예정
                </span>
              )}
            </span>
            <span
              aria-hidden="true"
              className={`text-xs text-text/50 transition-transform ${expanded ? "rotate-180" : ""}`}
            >
              ▼
            </span>
          </button>
        ) : (
          <span className="text-sm font-medium text-text-h">
            {course.name} <span className="text-text/50">· {course.credits}학점</span>
          </span>
        )}
        <CourseStatusPicker
          value={statusMap[course.id] ?? null}
          onChange={(status) => onChangeStatus(course.id, status)}
        />
      </div>
      {expanded && equivalents.length > 0 && (
        <ul className="mt-2 flex flex-col gap-1 border-t border-border pt-2">
          {equivalents.map((equivalent) => (
            <li
              key={equivalent.code}
              className="flex flex-wrap items-center justify-between gap-2 pl-2"
            >
              <span className="text-xs text-text/70">
                {equivalent.name} · {equivalent.credits}학점
              </span>
              <CourseStatusPicker
                value={statusMap[equivalent.statusId] ?? null}
                onChange={(status) => onChangeStatus(equivalent.statusId, status)}
              />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

export default function MajorCourses({
  courses,
  statusMap,
  fieldTraining,
  onChangeStatus,
  onReset,
  onChangeFieldTrainingStatus,
  onChangeFieldTrainingCredits,
}: {
  courses: MajorCourseDef[];
  statusMap: Record<string, CourseTakeStatus>;
  fieldTraining: FieldTrainingState;
  onChangeStatus: (courseId: string, status: CourseTakeStatus | null) => void;
  onReset: () => void;
  onChangeFieldTrainingStatus: (status: CourseTakeStatus | null) => void;
  onChangeFieldTrainingCredits: (credits: number) => void;
}) {
  const [expandedCourseIds, setExpandedCourseIds] = useState<Set<string>>(
    () => new Set()
  );
  const required = courses.filter((c) => c.kind === "required");
  const elective = courses.filter((c) => c.kind === "elective");
  const searchItems = useMemo(
    () => [
      ...courses.map((course) => ({
        id: course.id,
        elementId: `major-course-${course.id}`,
        primaryName: course.name,
        alternateNames: course.equivalents.map((equivalent) => equivalent.name),
      })),
      {
        id: "field_training",
        elementId: "major-course-field_training",
        primaryName: "현장실습",
      },
    ],
    [courses]
  );
  const courseSearch = useCourseSearch(searchItems, (item, matchedAlternate) => {
    if (!matchedAlternate) return;
    setExpandedCourseIds((current) => new Set(current).add(item.id));
  });
  const fieldTrainingNeedsCredits =
    fieldTraining.status !== null && fieldTraining.credits <= 0;
  const hasMajorData =
    Object.keys(statusMap).length > 0 ||
    fieldTraining.status !== null ||
    fieldTraining.credits > 0;

  function toggleExpanded(courseId: string) {
    setExpandedCourseIds((current) => {
      const next = new Set(current);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-text-h">📖 전공 과목</h3>
        <button
          type="button"
          disabled={!hasMajorData}
          onClick={() => {
            if (window.confirm("전공 과목의 모든 이수 상태를 초기화할까요?")) onReset();
          }}
          className="rounded-md px-2 py-1 text-xs font-semibold text-danger hover:bg-danger-bg disabled:cursor-not-allowed disabled:opacity-40"
        >
          초기화
        </button>
      </div>
      <p className="mb-4 text-xs text-text/60">
        컴퓨터공학과 전공 교육과정에 등록된 과목이에요. 이수 상태를 체크하세요.
      </p>

      <CourseSearchBar
        query={courseSearch.query}
        onChange={courseSearch.setQuery}
        onSearch={courseSearch.search}
        message={courseSearch.message}
      />

      <h4 className="mb-2 mt-2 text-sm font-bold text-text-h">전공필수</h4>
      <ul className="mb-5 flex flex-col gap-2">
        {required.map((c) => (
          <CourseRow
            key={c.id}
            course={c}
            statusMap={statusMap}
            onChangeStatus={onChangeStatus}
            expanded={expandedCourseIds.has(c.id)}
            onToggleExpanded={() => toggleExpanded(c.id)}
            highlighted={courseSearch.highlightedId === c.id}
          />
        ))}
      </ul>

      <h4 className="mb-2 text-sm font-bold text-text-h">전공선택</h4>
      <ul className="flex flex-col gap-2">
        {elective.map((c) => (
          <CourseRow
            key={c.id}
            course={c}
            statusMap={statusMap}
            onChangeStatus={onChangeStatus}
            expanded={expandedCourseIds.has(c.id)}
            onToggleExpanded={() => toggleExpanded(c.id)}
            highlighted={courseSearch.highlightedId === c.id}
          />
        ))}
        <li
          id="major-course-field_training"
          className={`scroll-mt-36 rounded-lg bg-bg-subtle px-3 py-2 transition-shadow ${
            courseSearch.highlightedId === "field_training" ? "ring-2 ring-accent" : ""
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-text-h">현장실습</span>
            <CourseStatusPicker
              value={fieldTraining.status}
              onChange={onChangeFieldTrainingStatus}
            />
          </div>
          <div className="mt-2 border-t border-border pt-2">
            <label className="flex flex-wrap items-center gap-2 text-xs text-text/70">
              이수학점
              <input
                type="number"
                min={0.5}
                step={0.5}
                value={fieldTraining.credits || ""}
                onChange={(event) => {
                  const value = event.target.value;
                  if (value === "") {
                    onChangeFieldTrainingCredits(0);
                    return;
                  }
                  const credits = Number(value);
                  if (Number.isFinite(credits) && credits >= 0) {
                    onChangeFieldTrainingCredits(credits);
                  }
                }}
                aria-invalid={fieldTrainingNeedsCredits}
                className="w-20 rounded-md border border-border bg-card px-2 py-1 text-right text-xs focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-bg"
              />
              학점
            </label>
            {fieldTrainingNeedsCredits && (
              <p className="mt-1 text-xs text-danger">0보다 큰 이수학점을 입력하세요.</p>
            )}
          </div>
        </li>
      </ul>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import type {
  CourseTakeStatus,
  GeneralCourseDef,
  GeneralCourseEntry,
} from "@/lib/types";
import { useCourseSearch } from "@/hooks/useCourseSearch";
import CourseSearchBar from "./CourseSearchBar";
import CourseStatusPicker from "./CourseStatusPicker";

function groupByArea(courses: GeneralCourseDef[]) {
  const groups: { areaId: string; areaName: string; courses: GeneralCourseDef[] }[] = [];
  for (const course of courses) {
    const group = groups.find((g) => g.areaId === course.areaId);
    if (group) {
      group.courses.push(course);
    } else {
      groups.push({
        areaId: course.areaId,
        areaName: course.areaName,
        courses: [course],
      });
    }
  }
  return groups;
}

export default function GeneralCourses({
  catalog,
  statusMap,
  courses,
  onChangeCatalogStatus,
  onAdd,
  onRemove,
  onChangeStatus,
  onReset,
}: {
  catalog: GeneralCourseDef[];
  statusMap: Record<string, CourseTakeStatus>;
  courses: GeneralCourseEntry[];
  onChangeCatalogStatus: (courseId: string, status: CourseTakeStatus | null) => void;
  onAdd: (entry: Omit<GeneralCourseEntry, "id">) => void;
  onRemove: (id: string) => void;
  onChangeStatus: (id: string, status: CourseTakeStatus) => void;
  onReset: () => void;
}) {
  const [name, setName] = useState("");
  const [credits, setCredits] = useState("");
  const [status, setStatus] = useState<CourseTakeStatus>("completed");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !credits) return;
    onAdd({ name: name.trim(), credits: Number(credits), status });
    setName("");
    setCredits("");
  }

  const groupedCourses = groupByArea(catalog);
  const searchItems = useMemo(
    () => [
      ...catalog.map((course) => ({
        id: course.id,
        elementId: `general-course-${course.id}`,
        primaryName: course.name,
      })),
      ...courses.map((course) => ({
        id: `custom-${course.id}`,
        elementId: `general-course-custom-${course.id}`,
        primaryName: course.name,
      })),
    ],
    [catalog, courses]
  );
  const courseSearch = useCourseSearch(searchItems);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-3">
        <h3 className="text-base font-bold text-text-h">🎨 교양 과목</h3>
        <button
          type="button"
          disabled={Object.keys(statusMap).length === 0 && courses.length === 0}
          onClick={() => {
            if (window.confirm("교양 과목의 선택 상태와 직접 추가한 과목을 모두 초기화할까요?")) {
              onReset();
            }
          }}
          className="rounded-md px-2 py-1 text-xs font-semibold text-danger hover:bg-danger-bg disabled:cursor-not-allowed disabled:opacity-40"
        >
          초기화
        </button>
      </div>
      <p className="mb-4 text-xs text-text/60">
        2022학년도 교육과정에 등록된 교양 과목이에요. 이수 상태를 체크하세요.
      </p>

      <CourseSearchBar
        query={courseSearch.query}
        onChange={courseSearch.setQuery}
        onSearch={courseSearch.search}
        message={courseSearch.message}
      />

      {groupedCourses.map((group) => (
        <section key={group.areaId} className="mb-5">
          <h4 className="mb-2 text-sm font-bold text-text-h">{group.areaName}</h4>
          <ul className="flex flex-col gap-2">
            {group.courses.map((course) => (
              <li
                key={course.id}
                id={`general-course-${course.id}`}
                onClick={
                  courseSearch.highlightedId === course.id
                    ? courseSearch.clearHighlight
                    : undefined
                }
                className={`scroll-mt-36 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-bg-subtle px-3 py-2 transition-shadow ${
                  courseSearch.highlightedId === course.id ? "ring-2 ring-accent" : ""
                }`}
              >
                <span className="text-sm font-medium text-text-h">
                  {course.name}
                  <span className="text-text/50">
                    {" "}
                    · {course.credits}학점
                  </span>
                </span>
                <CourseStatusPicker
                  value={statusMap[course.id] ?? null}
                  onChange={(v) => onChangeCatalogStatus(course.id, v)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <h4 className="mb-2 mt-6 text-sm font-bold text-text-h">
        목록에 없는 교양 과목 직접 추가
      </h4>
      <p className="mb-3 text-xs text-text/60">
        사회봉사, 해외봉사처럼 학점 처리 기준이 다르거나 목록에서 찾기 어려운 과목만 직접 입력하세요.
      </p>

      <form onSubmit={handleSubmit} className="mb-4 flex flex-wrap gap-2">
        <input
          className="min-w-[120px] flex-1 rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm focus:border-accent focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent-bg"
          placeholder="강의명 (예: 대학영어)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-20 rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm focus:border-accent focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent-bg"
          type="number"
          min={0}
          step={0.5}
          placeholder="학점"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
        />
        <select
          className="rounded-lg border border-border bg-bg-subtle px-2 py-2 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as CourseTakeStatus)}
        >
          <option value="completed">이수완료</option>
          <option value="planned">수강예정</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-gradient-to-br from-accent to-accent-2 px-4 py-2 text-sm font-bold text-white"
        >
          추가
        </button>
      </form>

      <h4 className="mb-2 text-sm font-bold text-text-h">직접 추가한 과목</h4>
      <ul className="flex flex-col gap-2">
        {courses.map((c) => (
          <li
            key={c.id}
            id={`general-course-custom-${c.id}`}
            onClick={
              courseSearch.highlightedId === `custom-${c.id}`
                ? courseSearch.clearHighlight
                : undefined
            }
            className={`scroll-mt-36 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-bg-subtle px-3 py-2 transition-shadow ${
              courseSearch.highlightedId === `custom-${c.id}` ? "ring-2 ring-accent" : ""
            }`}
          >
            <span className="text-sm font-medium text-text-h">
              {c.name} <span className="text-text/50">· {c.credits}학점</span>
            </span>
            <div className="flex items-center gap-2">
              <select
                className="rounded-md border border-border bg-card px-2 py-1 text-xs"
                value={c.status}
                onChange={(e) =>
                  onChangeStatus(c.id, e.target.value as CourseTakeStatus)
                }
              >
                <option value="completed">이수완료</option>
                <option value="planned">수강예정</option>
              </select>
              <button
                type="button"
                onClick={() => onRemove(c.id)}
                className="rounded-md px-2 py-1 text-xs font-semibold text-danger hover:bg-danger-bg"
              >
                삭제
              </button>
            </div>
          </li>
        ))}
        {courses.length === 0 && (
          <li className="text-sm text-text/50">직접 추가한 교양 과목이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}

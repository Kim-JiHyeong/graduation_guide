"use client";

import type { CourseTakeStatus, MajorCourseDef } from "@/lib/types";

const STATUS_OPTIONS: { value: CourseTakeStatus | null; label: string }[] = [
  { value: null, label: "미이수" },
  { value: "planned", label: "수강예정" },
  { value: "completed", label: "이수완료" },
];

function StatusPicker({
  value,
  onChange,
}: {
  value: CourseTakeStatus | null;
  onChange: (v: CourseTakeStatus | null) => void;
}) {
  return (
    <div className="flex shrink-0 gap-1 rounded-lg bg-bg-subtle p-1">
      {STATUS_OPTIONS.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.label}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`rounded-md px-2 py-1 text-xs font-semibold transition-colors ${
              active
                ? opt.value === "completed"
                  ? "bg-success text-white"
                  : opt.value === "planned"
                    ? "bg-accent text-white"
                    : "bg-border text-text-h"
                : "text-text/60 hover:text-text-h"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function CourseRow({
  course,
  status,
  onChange,
}: {
  course: MajorCourseDef;
  status: CourseTakeStatus | null;
  onChange: (v: CourseTakeStatus | null) => void;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-bg-subtle px-3 py-2">
      <span className="text-sm font-medium text-text-h">
        {course.name} <span className="text-text/50">· {course.credits}학점</span>
      </span>
      <StatusPicker value={status} onChange={onChange} />
    </li>
  );
}

export default function MajorCourses({
  courses,
  statusMap,
  onChangeStatus,
}: {
  courses: MajorCourseDef[];
  statusMap: Record<string, CourseTakeStatus>;
  onChangeStatus: (courseId: string, status: CourseTakeStatus | null) => void;
}) {
  const required = courses.filter((c) => c.kind === "required");
  const elective = courses.filter((c) => c.kind === "elective");

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-1 text-base font-bold text-text-h">📖 전공 과목</h3>
      <p className="mb-4 text-xs text-text/60">
        컴퓨터공학과 22학번 전공 교육과정에 등록된 과목이에요. 이수 상태를 체크하세요.
      </p>

      <h4 className="mb-2 mt-2 text-sm font-bold text-text-h">전공필수</h4>
      <ul className="mb-5 flex flex-col gap-2">
        {required.map((c) => (
          <CourseRow
            key={c.id}
            course={c}
            status={statusMap[c.id] ?? null}
            onChange={(v) => onChangeStatus(c.id, v)}
          />
        ))}
      </ul>

      <h4 className="mb-2 text-sm font-bold text-text-h">전공선택</h4>
      <ul className="flex flex-col gap-2">
        {elective.map((c) => (
          <CourseRow
            key={c.id}
            course={c}
            status={statusMap[c.id] ?? null}
            onChange={(v) => onChangeStatus(c.id, v)}
          />
        ))}
      </ul>
    </div>
  );
}

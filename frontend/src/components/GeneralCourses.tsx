"use client";

import { useState } from "react";
import type { CourseTakeStatus, GeneralCourseEntry } from "@/lib/types";

export default function GeneralCourses({
  courses,
  onAdd,
  onRemove,
  onChangeStatus,
}: {
  courses: GeneralCourseEntry[];
  onAdd: (entry: Omit<GeneralCourseEntry, "id">) => void;
  onRemove: (id: string) => void;
  onChangeStatus: (id: string, status: CourseTakeStatus) => void;
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

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-1 text-base font-bold text-text-h">🎨 교양 과목</h3>
      <p className="mb-4 text-xs text-text/60">
        들은(또는 들을 예정인) 교양 과목을 직접 입력하세요.
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

      <ul className="flex flex-col gap-2">
        {courses.map((c) => (
          <li
            key={c.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-bg-subtle px-3 py-2"
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
          <li className="text-sm text-text/50">아직 등록된 교양 과목이 없습니다.</li>
        )}
      </ul>
    </div>
  );
}

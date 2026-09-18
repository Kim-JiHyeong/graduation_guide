"use client";

import type { CourseTakeStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: CourseTakeStatus | null; label: string }[] = [
  { value: null, label: "미이수" },
  { value: "planned", label: "수강예정" },
  { value: "completed", label: "이수완료" },
];

export default function CourseStatusPicker({
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

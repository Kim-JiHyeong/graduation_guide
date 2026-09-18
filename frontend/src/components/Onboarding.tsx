"use client";

import { useState } from "react";

const YEARS = [22, 23, 24, 25, 26];

export default function Onboarding({
  onSubmit,
}: {
  onSubmit: (admissionYear: number) => void;
}) {
  const [year, setYear] = useState(22);

  return (
    <div className="min-h-screen flex items-center justify-center p-5">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-7 shadow-lg">
        <h1 className="mb-2 flex items-center gap-2 text-xl font-bold text-text-h">
          🎓 순천대 컴퓨터공학과 졸업요건 계산기
        </h1>
        <p className="mb-6 text-sm text-text/70">
          개인정보는 저장하지 않아요. 학과와 입학년도만 선택하면 시작할 수 있습니다.
          데이터는 이 브라우저에만 저장돼요 (서버 없음).
        </p>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-semibold text-text-h">학과</label>
          <div className="rounded-xl border border-border bg-bg-subtle px-4 py-3 text-sm text-text-h">
            컴퓨터공학전공 <span className="text-text/50">(현재는 이 전공만 계산 지원)</span>
          </div>
        </div>

        <div className="mb-7">
          <label className="mb-2 block text-sm font-semibold text-text-h">입학년도</label>
          <div className="grid grid-cols-5 gap-2">
            {YEARS.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setYear(y)}
                className={`rounded-xl border px-2 py-3 text-sm font-bold transition-colors ${
                  year === y
                    ? "border-accent bg-accent text-white shadow-sm"
                    : "border-border bg-bg-subtle text-text-h hover:border-accent/50"
                }`}
              >
                {y}학번
              </button>
            ))}
          </div>
          {year !== 22 && (
            <p className="mt-2 text-xs text-danger">
              ⚠️ {year}학번 졸업요건은 아직 학교 자료로 검증되지 않았어요. 우선 22학번과 같은
              기준으로 보여드리고, 정확한 자료가 확인되면 반영할게요.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onSubmit(2000 + year)}
          className="w-full rounded-xl bg-gradient-to-br from-accent to-accent-2 px-5 py-3 font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}

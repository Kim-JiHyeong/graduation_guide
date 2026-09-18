"use client";

const TABS = [
  { id: "dashboard", label: "대시보드" },
  { id: "major", label: "전공 과목" },
  { id: "general", label: "교양 과목" },
  { id: "chat", label: "AI 상담" },
  { id: "settings", label: "설정" },
] as const;

export type TabId = (typeof TABS)[number]["id"];

export default function Header({
  admissionYear,
  tab,
  onTabChange,
}: {
  admissionYear: number;
  tab: TabId;
  onTabChange: (tab: TabId) => void;
}) {
  return (
    <header className="sticky top-0 z-10 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto max-w-3xl px-5 pb-3 pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h1 className="flex items-center gap-2 text-lg font-bold text-text-h">
            🎓 졸업요건 계산기
          </h1>
          <span className="text-xs text-text/60">{admissionYear}학번 · 컴퓨터공학과</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto rounded-full bg-bg-subtle p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onTabChange(t.id)}
              className={`whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition-colors ${
                tab === t.id ? "bg-accent text-white shadow-sm" : "text-text/70 hover:text-text-h"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

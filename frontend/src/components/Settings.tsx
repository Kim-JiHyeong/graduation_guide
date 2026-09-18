"use client";

const YEARS = [22, 23, 24, 25, 26];

export default function Settings({
  admissionYear,
  onChangeYear,
}: {
  admissionYear: number;
  onChangeYear: (admissionYear: number) => void;
}) {
  const currentShort = admissionYear - 2000;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-1 text-base font-bold text-text-h">⚙️ 설정</h3>
      <p className="mb-5 text-xs text-text/60">
        학과·이름·학번 뒷자리 같은 개인정보는 저장하지 않아요. 입학년도만 바꿀 수 있습니다.
      </p>

      <label className="mb-2 block text-sm font-semibold text-text-h">입학년도</label>
      <div className="grid grid-cols-5 gap-2">
        {YEARS.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => onChangeYear(2000 + y)}
            className={`rounded-xl border px-2 py-3 text-sm font-bold transition-colors ${
              currentShort === y
                ? "border-accent bg-accent text-white shadow-sm"
                : "border-border bg-bg-subtle text-text-h hover:border-accent/50"
            }`}
          >
            {y}학번
          </button>
        ))}
      </div>
      {currentShort !== 22 && (
        <p className="mt-3 text-xs text-danger">
          ⚠️ {currentShort}학번 졸업요건은 아직 학교 자료로 검증되지 않았어요. 지금은 22학번과
          같은 기준으로 계산됩니다.
        </p>
      )}
    </div>
  );
}

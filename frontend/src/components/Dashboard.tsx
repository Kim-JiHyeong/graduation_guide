"use client";

import { useState } from "react";
import type { CalculatedStatus, CertificationArea } from "@/lib/types";

function ProgressBar({ completed, required }: { completed: number; required: number }) {
  const pct = required > 0 ? Math.min((completed / required) * 100, 100) : 100;
  const satisfied = completed >= required;
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-bg-subtle">
      <div
        className={`h-full rounded-full transition-all duration-300 ${
          satisfied
            ? "bg-gradient-to-r from-success to-emerald-400"
            : "bg-gradient-to-r from-accent to-accent-2"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function MetricCard({
  icon,
  status,
}: {
  icon: string;
  status: CalculatedStatus["total"];
}) {
  return (
    <div className="rounded-xl bg-bg-subtle p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-text-h">
          {icon} {status.label}
        </span>
        <span className="text-text-h">
          {status.completed} / {status.required}학점
          {!status.isSatisfied && (
            <span className="ml-2 rounded-full bg-danger-bg px-2 py-0.5 text-xs font-bold text-danger">
              부족 {Math.max(status.required - status.completed, 0)}
            </span>
          )}
        </span>
      </div>
      <ProgressBar completed={status.completed} required={status.required} />
    </div>
  );
}

export default function Dashboard({
  department,
  admissionYear,
  current,
  projected,
  certificationAreas,
  onChangeCertScore,
}: {
  department: string;
  admissionYear: number;
  current: CalculatedStatus;
  projected: CalculatedStatus;
  certificationAreas: CertificationArea[];
  onChangeCertScore: (areaId: string, score: number) => void;
}) {
  const [includePlanned, setIncludePlanned] = useState(false);
  const status = includePlanned ? projected : current;
  const certSatisfied = certificationAreas.some((a) => a.score >= 100);

  return (
    <div className="flex flex-col gap-5">
      <div
        className={`flex items-center gap-3 rounded-2xl p-5 text-white shadow-md ${
          status.isGraduationReady
            ? "bg-gradient-to-br from-success to-emerald-500"
            : "bg-gradient-to-br from-accent to-accent-2"
        }`}
      >
        <span className="text-2xl">{status.isGraduationReady ? "🎉" : "📋"}</span>
        <span className="text-sm">
          <strong>{department}</strong> ({admissionYear}학번) —{" "}
          {status.isGraduationReady ? "졸업요건을 모두 충족했습니다!" : "아직 부족한 요건이 있습니다"}
        </span>
      </div>

      <div className="flex gap-1 self-start rounded-full bg-bg-subtle p-1">
        <button
          type="button"
          onClick={() => setIncludePlanned(false)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            !includePlanned ? "bg-accent text-white shadow-sm" : "text-text/70"
          }`}
        >
          현재 상태
        </button>
        <button
          type="button"
          onClick={() => setIncludePlanned(true)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
            includePlanned ? "bg-accent text-white shadow-sm" : "text-text/70"
          }`}
        >
          수강예정 포함
        </button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-base font-bold text-text-h">
          {includePlanned ? "📈 수강예정 과목 포함 현황" : "📊 현재 이수 현황"}
        </h3>
        <MetricCard icon="🎓" status={status.total} />
        <p className="mt-2 text-xs text-text/60">
          일반선택은 최대 20학점까지만 이수할 수 있습니다.
        </p>

        <h4 className="mb-2 mt-5 text-sm font-bold text-text-h">전공</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MetricCard icon="🗂️" status={status.major} />
          <MetricCard icon="✅" status={status.majorRequired} />
        </div>

        <h4 className="mb-2 mt-5 text-sm font-bold text-text-h">교양</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <MetricCard icon="🎨" status={status.general} />
          <MetricCard icon="📘" status={status.commonGeneral} />
          <MetricCard icon="📚" status={status.advancedGeneral} />
        </div>

        {status.missingMajorRequired.length > 0 && (
          <div className="mt-5">
            <h4 className="mb-2 text-sm font-bold text-text-h">미이수 전공필수</h4>
            <ul className="flex flex-wrap gap-2">
              {status.missingMajorRequired.map((c) => (
                <li
                  key={c.id}
                  className="rounded-full bg-danger-bg px-3 py-1 text-xs font-semibold text-danger"
                >
                  {c.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5">
          <h4 className="mb-2 text-sm font-bold text-text-h">미이수 교양요건</h4>
          {status.missingGeneralRequirements.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {status.missingGeneralRequirements.map((requirement) => (
                <li key={requirement.id} className="rounded-lg bg-bg-subtle px-3 py-2">
                  <p className="text-sm font-semibold text-text-h">{requirement.label}</p>
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {requirement.details.map((detail) => (
                      <li key={detail} className="text-xs text-danger">
                        · {detail}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg bg-success-bg px-3 py-2 text-sm font-semibold text-success">
              모든 교양 최소 이수요건을 충족했습니다.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="text-base font-bold text-text-h">🏅 졸업자격인증제</h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              certSatisfied ? "bg-success-bg text-success" : "bg-danger-bg text-danger"
            }`}
          >
            {certSatisfied ? "충족" : "미충족"}
          </span>
        </div>
        <p className="mb-4 text-xs text-text/60">
          4개 영역 중 1개 영역만 100점 이상이면 충족 (합산 불가)
        </p>
        <ul className="flex flex-col gap-3">
          {certificationAreas.map((area) => (
            <li key={area.id} className="rounded-lg bg-bg-subtle p-3">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-text-h">
                  {area.score >= 100 ? "✅" : "⬜"} {area.name}
                </span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={area.score}
                  onChange={(e) => onChangeCertScore(area.id, Number(e.target.value))}
                  className="w-20 rounded-md border border-border bg-card px-2 py-1 text-right text-xs"
                />
              </div>
              <p className="text-xs text-text/60">{area.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

"use client";

import { Fragment } from "react";
import {
  academicSchools,
  DEFAULT_DEPARTMENT,
  findSchool,
  getDepartments,
} from "@/lib/academicUnits";

const YEARS = [22, 23, 24, 25, 26];
const selectClassName =
  "w-full rounded-xl border border-border bg-bg-subtle px-3 py-3 text-sm text-text-h outline-none transition-colors focus:border-accent";

export default function Settings({
  school,
  department,
  admissionYear,
  onChangeAcademicUnit,
  onChangeYear,
}: {
  school: string;
  department: string;
  admissionYear: number;
  onChangeAcademicUnit: (school: string, department: string) => void;
  onChangeYear: (admissionYear: number) => void;
}) {
  const currentShort = admissionYear - 2000;
  const selectedSchool = findSchool(school) ?? academicSchools[0];
  const isComputerEngineering = department === DEFAULT_DEPARTMENT;

  const handleSchoolChange = (nextSchoolName: string) => {
    const nextSchool = findSchool(nextSchoolName);
    if (!nextSchool) return;
    onChangeAcademicUnit(nextSchool.name, getDepartments(nextSchool)[0]);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-1 text-base font-bold text-text-h">⚙️ 설정</h3>
      <p className="mb-5 text-xs text-text/60">
        이름·학번 뒷자리 같은 개인정보는 저장하지 않아요. 선택한 소속과 입학년도만 이
        브라우저에 저장됩니다.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="school" className="mb-2 block text-sm font-semibold text-text-h">
            스쿨·대학
          </label>
          <select
            id="school"
            value={selectedSchool.name}
            onChange={(event) => handleSchoolChange(event.target.value)}
            className={selectClassName}
          >
            {academicSchools.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="department" className="mb-2 block text-sm font-semibold text-text-h">
            학과·전공
          </label>
          <select
            id="department"
            value={department}
            onChange={(event) => onChangeAcademicUnit(selectedSchool.name, event.target.value)}
            className={selectClassName}
          >
            {selectedSchool.groups.map((group, groupIndex) =>
              group.label ? (
                <optgroup key={group.label} label={group.label}>
                  {group.departments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </optgroup>
              ) : (
                <Fragment key={`${selectedSchool.name}-${groupIndex}`}>
                  {group.departments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </Fragment>
              )
            )}
          </select>
        </div>
      </div>

      <div className="mt-5 max-w-xs">
        <label htmlFor="admission-year" className="mb-2 block text-sm font-semibold text-text-h">
          학번
        </label>
        <select
          id="admission-year"
          value={admissionYear}
          onChange={(event) => onChangeYear(Number(event.target.value))}
          className={selectClassName}
        >
          {YEARS.map((year) => (
            <option key={year} value={2000 + year}>
              {year}학번
            </option>
          ))}
        </select>
      </div>

      {!isComputerEngineering && (
        <p className="mt-3 text-xs text-danger">
          ⚠️ 현재 졸업요건 계산 데이터는 컴퓨터공학전공만 구현되어 있습니다. 선택한 학과의
          전용 교육과정은 아직 반영되지 않았습니다.
        </p>
      )}
      {currentShort !== 22 && (
        <p className="mt-3 text-xs text-danger">
          ⚠️ {currentShort}학번 졸업요건은 아직 학교 자료로 검증되지 않았어요. 지금은 22학번과
          같은 기준으로 계산됩니다.
        </p>
      )}
    </div>
  );
}

export interface DepartmentGroup {
  label?: string;
  departments: readonly string[];
}

export interface AcademicSchool {
  name: string;
  groups: readonly DepartmentGroup[];
}

export const academicSchools: readonly AcademicSchool[] = [
  {
    name: "본부직속",
    groups: [
      {
        departments: [
          "자유전공학부",
          "식품영양학과",
          "융합바이오시스템기계공학과",
          "간호학과",
          "건축학부",
        ],
      },
    ],
  },
  {
    name: "그린스마트팜스쿨",
    groups: [
      {
        departments: [
          "농생명과학전공",
          "산림자원학전공",
          "조경학전공",
          "동물자원과학전공",
          "원예학전공",
          "식품공학전공",
          "농업경제학전공",
          "의생명과학전공",
          "조리과학전공",
          "바이오한약자원학전공",
        ],
      },
    ],
  },
  {
    name: "애니메이션·문화콘텐츠스쿨",
    groups: [
      {
        label: "사회과학분야",
        departments: [
          "경제학전공",
          "무역학전공",
          "경영학전공",
          "법학전공",
          "행정학전공",
          "회계학전공",
          "물류학전공",
          "사회복지학전공",
        ],
      },
      {
        label: "인문분야",
        departments: [
          "글로벌중국학전공",
          "일본어일본문화학전공",
          "사학전공",
          "철학전공",
        ],
      },
      {
        label: "예체능분야",
        departments: [
          "문예창작학전공",
          "사회체육학전공",
          "음악예술융합학전공",
          "사진미디어학전공",
          "영상디자인학전공",
          "만화애니메이션학전공",
          "패션디자인학전공",
        ],
      },
    ],
  },
  {
    name: "우주항공·첨단소재스쿨",
    groups: [
      {
        departments: [
          "토목공학전공",
          "환경공학전공",
          "기계우주항공공학전공",
          "첨단신소재공학전공",
          "화학공학전공",
          "전기공학전공",
          "전자공학전공",
          "인공지능공학전공",
          "컴퓨터공학전공",
          "화학전공",
          "에너지응용공학전공",
        ],
      },
    ],
  },
  {
    name: "사범대학",
    groups: [
      {
        departments: [
          "국어교육과",
          "영어교육과",
          "사회교육과",
          "농업교육과",
          "수학교육과",
          "컴퓨터교육과",
          "환경교육과",
          "물리교육과",
          "화학교육과",
        ],
      },
    ],
  },
  {
    name: "약학대학",
    groups: [{ departments: ["약학과"] }],
  },
  {
    name: "평생교육스쿨",
    groups: [
      {
        departments: [
          "물류비즈니스전공트랙",
          "융합산업전공트랙",
          "정원문화산업전공트랙",
          "스포츠레저전공트랙",
        ],
      },
    ],
  },
] as const;

export const DEFAULT_SCHOOL = "우주항공·첨단소재스쿨";
export const DEFAULT_DEPARTMENT = "컴퓨터공학전공";

const LEGACY_DEPARTMENT_ALIASES: Record<string, string> = {
  컴퓨터공학과: DEFAULT_DEPARTMENT,
};

export function findSchool(schoolName: string | undefined): AcademicSchool | undefined {
  return academicSchools.find((school) => school.name === schoolName);
}

export function getDepartments(school: AcademicSchool): string[] {
  return school.groups.flatMap((group) => [...group.departments]);
}

export function resolveAcademicUnit(
  schoolName?: string,
  departmentName?: string
): { school: string; department: string } {
  const normalizedDepartment = departmentName
    ? (LEGACY_DEPARTMENT_ALIASES[departmentName] ?? departmentName)
    : undefined;
  const requestedSchool = findSchool(schoolName);

  if (requestedSchool) {
    const departments = getDepartments(requestedSchool);
    return {
      school: requestedSchool.name,
      department:
        normalizedDepartment && departments.includes(normalizedDepartment)
          ? normalizedDepartment
          : departments[0],
    };
  }

  if (normalizedDepartment) {
    const matchingSchool = academicSchools.find((school) =>
      getDepartments(school).includes(normalizedDepartment)
    );
    if (matchingSchool) {
      return { school: matchingSchool.name, department: normalizedDepartment };
    }
  }

  return { school: DEFAULT_SCHOOL, department: DEFAULT_DEPARTMENT };
}

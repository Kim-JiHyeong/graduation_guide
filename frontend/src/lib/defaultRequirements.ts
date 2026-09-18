import type { CertificationArea, MajorCourseDef, Requirements } from "./types";

// 컴퓨터공학과 22학번 기준. 출처: 순천대학교 「2022학년도 교육과정」책자
// ([별표 1] 학과·학부(전공)별 졸업소요학점 구성표 p.26, 컴퓨터공학과 전공 교육과정편성표 p.157),
// 「순천대학교 졸업자격 인증제 운영 지침」(2015.5.18 제정, 2019.11.28 개정).
export const majorCourses22: MajorCourseDef[] = [
  { id: "c_cs", name: "컴퓨터과학", credits: 3, kind: "required" },
  { id: "c_ds", name: "자료구조", credits: 3, kind: "required" },
  { id: "c_ca", name: "컴퓨터구조", credits: 3, kind: "required" },
  { id: "c_db", name: "데이터베이스", credits: 3, kind: "required" },
  { id: "c_os", name: "운영체제", credits: 3, kind: "required" },
  { id: "c_pl", name: "프로그래밍언어론", credits: 3, kind: "required" },
  { id: "c_cg", name: "컴퓨터그래픽스", credits: 3, kind: "required" },
  { id: "c_di", name: "디지털이미징", credits: 3, kind: "required" },
  { id: "c_cap1", name: "종합설계Ⅰ", credits: 3, kind: "required" },
  { id: "c_sad", name: "시스템분석및설계", credits: 3, kind: "required" },
  { id: "c_sec", name: "정보보호", credits: 3, kind: "required" },
  { id: "c_cap2", name: "종합설계Ⅱ", credits: 3, kind: "required" },

  { id: "e_acp", name: "고급컴퓨터프로그래밍", credits: 3, kind: "elective" },
  { id: "e_cm", name: "컴퓨터수학", credits: 3, kind: "elective" },
  { id: "e_me1", name: "전공영어Ⅰ", credits: 2, kind: "elective" },
  { id: "e_mp", name: "모바일프로그래밍", credits: 3, kind: "elective" },
  { id: "e_bd", name: "빅데이터 분석 및 응용", credits: 3, kind: "elective" },
  { id: "e_me2", name: "전공영어Ⅱ", credits: 2, kind: "elective" },
  { id: "e_mm", name: "멀티미디어", credits: 3, kind: "elective" },
  { id: "e_ls", name: "리눅스시스템", credits: 3, kind: "elective" },
  { id: "e_alg", name: "컴퓨터알고리즘", credits: 3, kind: "elective" },
  { id: "e_ip", name: "영상처리기초", credits: 3, kind: "elective" },
  { id: "e_ca2", name: "컴퓨터구조응용", credits: 3, kind: "elective" },
  { id: "e_wp", name: "웹프로그래밍", credits: 3, kind: "elective" },
  { id: "e_comp", name: "컴파일러", credits: 3, kind: "elective" },
  { id: "e_dbd", name: "데이터베이스설계및응용", credits: 3, kind: "elective" },
  { id: "e_dc", name: "데이터통신", credits: 3, kind: "elective" },
  { id: "e_ani", name: "컴퓨터애니메이션", credits: 3, kind: "elective" },
  { id: "e_cv", name: "컴퓨터비전", credits: 3, kind: "elective" },
  { id: "e_ai", name: "인공지능", credits: 3, kind: "elective" },
  { id: "e_se", name: "소프트웨어공학", credits: 3, kind: "elective" },
];

export const certificationAreas22: CertificationArea[] = [
  {
    id: "personality_art_pe",
    name: "① 인성·예술·체육 분야",
    score: 0,
    description:
      "다음 중 1가지 이상 참가(각 향림포인트 100점 이상): 인성개발프로그램 참가 / 상담활동 참가(진로·심리·취업·학습법 등) / 예술체육 특기개발 활동 참가 / 문화예술 활동 참가",
  },
  {
    id: "volunteer",
    name: "② 지역·해외봉사 분야",
    score: 0,
    description: "사회봉사활동 80시간 이상 (향림포인트 '사회 및 해외봉사활동' 100점 이상)",
  },
  {
    id: "computer_literacy",
    name: "③ 컴퓨터·정보화 분야",
    score: 0,
    description:
      "국내외 컴퓨터 관련 자격증 취득: 컴퓨터활용능력 1급, 사무자동화산업기사, 정보처리산업기사, MOS, ICDL 등 (향림포인트 '컴퓨터정보화 자격증 취득 활동' 100점 이상)",
  },
  {
    id: "language_cert",
    name: "④ 외국어 분야",
    score: 0,
    description:
      "영어 TOEIC 500점 이상 / 일본어 JPT 500점 이상 / 중국어 HSK 6급(신HSK 5급 180~194점) 이상 (그 외 외국어는 공인어학성적 환산표 적용, 향림포인트 '외국어성적' 4등급(100점) 이상)",
  },
];

export const certificationRule22 =
  "순천대학교 졸업자격 인증제 운영 지침(2015.5.18 제정, 2019.11.28 개정) 제3조: 4개 영역 중 1개 영역 이상 선택하여 인증 (여러 영역 점수 합산 불가). 각 영역 향림취업향상포인트 100점 이상이면 인증.";

export function buildRequirements(admissionYear: number): Requirements {
  // TODO: 추후 학번별로 실제 교육과정이 다르면 연도별 템플릿을 분리할 것.
  // 지금은 2022학번 자료만 검증되어 있고, 다른 학번은 같은 템플릿을 임시로 재사용한다.
  return {
    department: "컴퓨터공학과",
    admissionYear,
    isVerified: admissionYear === 2022,
    totalCreditsRequired: 130,
    generalCreditsRequired: 30,
    majorCreditsRequired: 70,
    majorRequiredCreditsRequired: 36,
    majorCourses: majorCourses22,
    certificationRule: certificationRule22,
    certificationAreas: certificationAreas22.map((a) => ({ ...a })),
  };
}

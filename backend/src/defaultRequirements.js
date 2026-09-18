// 컴퓨터공학과 22학번 기준 기본 졸업요건 템플릿.
// 회원가입 시 각 사용자의 requirements 행으로 복제되어, 이후 사용자별로 독립적으로 수정 가능.
export const defaultRequirements = {
  department: "컴퓨터공학과",
  admissionYear: 2022,
  totalCreditsRequired: 130,
  categories: [
    { id: "major_required", name: "전공필수", creditsRequired: 36 },
    { id: "major_elective", name: "전공선택", creditsRequired: 34 },
    { id: "gen_common", name: "공통교양(기초+핵심+글로벌의사소통+인성)", creditsRequired: 15 },
    { id: "gen_advanced", name: "심화교양", creditsRequired: 15 },
    { id: "free_elective", name: "일반선택(자유선택)", creditsRequired: 0 },
  ],
  requiredCourses: [
    { id: "req_1", name: "컴퓨터과학", credits: 3, categoryId: "major_required", year: 1, semester: 1 },
    { id: "req_2", name: "자료구조", credits: 3, categoryId: "major_required", year: 2, semester: 1 },
    { id: "req_3", name: "컴퓨터구조", credits: 3, categoryId: "major_required", year: 2, semester: 2 },
    { id: "req_4", name: "데이터베이스", credits: 3, categoryId: "major_required", year: 3, semester: 1 },
    { id: "req_5", name: "운영체제", credits: 3, categoryId: "major_required", year: 3, semester: 2 },
    { id: "req_6", name: "프로그래밍언어론", credits: 3, categoryId: "major_required", year: 3, semester: 2 },
    { id: "req_7", name: "컴퓨터그래픽스", credits: 3, categoryId: "major_required", year: 3, semester: 2 },
    { id: "req_8", name: "디지털이미징", credits: 3, categoryId: "major_required", year: 3, semester: 2 },
    { id: "req_9", name: "종합설계Ⅰ", credits: 3, categoryId: "major_required", year: 4, semester: 1 },
    { id: "req_10", name: "시스템분석및설계", credits: 3, categoryId: "major_required", year: 4, semester: 1 },
    { id: "req_11", name: "정보보호", credits: 3, categoryId: "major_required", year: 4, semester: 1 },
    { id: "req_12", name: "종합설계Ⅱ", credits: 3, categoryId: "major_required", year: 4, semester: 2 },
  ],
  certificationRule:
    "순천대학교 졸업자격 인증제 운영 지침(2015.5.18 제정, 2019.11.28 개정) 제3조: 4개 영역 중 1개 영역 이상 선택하여 인증 (여러 영역 점수 합산 불가). 각 영역 향림취업향상포인트 100점 이상이면 인증.",
  nonSubjectRequirements: [
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
  ],
};

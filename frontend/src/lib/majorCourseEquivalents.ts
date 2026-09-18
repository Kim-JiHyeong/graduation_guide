import type { MajorCourseEquivalent } from "./types";

type EquivalentInput = Omit<
  MajorCourseEquivalent,
  "curriculumYear" | "sourceOrder"
>;

function equivalents(items: EquivalentInput[]): MajorCourseEquivalent[] {
  return items.map((item, sourceOrder) => ({
    ...item,
    curriculumYear: null,
    sourceOrder,
  }));
}

// 출처: Major_Course_Equivalents.pdf 컴퓨터공학 동일·대체교과목 표(p.22~23).
// PDF에 적용 연도가 없어 이전 교과목의 curriculumYear는 null로 보존한다.
// 같은 이름의 중간 코드가 반복되면 최신 중간 코드 하나로 묶어 화면 중복을 제거한다.
export const majorCourseEquivalentsByCode: Record<
  string,
  MajorCourseEquivalent[]
> = {
  CS0617: equivalents([
    { statusId: "m_cs0609", code: "CS0609", name: "데이터베이스설계", credits: 3, relation: "substitute", satisfiesRequired: true },
    { statusId: "e_dbd", code: "CS0859", name: "데이터베이스설계및응용", credits: 3, relation: "substitute", satisfiesRequired: false },
  ]),
  CS0621: equivalents([
    { statusId: "m_cs0619", code: "CS0619", name: "패턴인식", credits: 3, relation: "substitute", satisfiesRequired: true },
  ]),
  CS0622: equivalents([
    { statusId: "m_cs0620", code: "CS0620", name: "컴퓨터네트워크", credits: 3, relation: "substitute", satisfiesRequired: true },
    { statusId: "m_cs0403", code: "CS0403", name: "차세대인터넷", credits: 3, relation: "substitute", satisfiesRequired: true },
  ]),
  CS0661: equivalents([
    { statusId: "m_cs0404", code: "CS0404", name: "전자상거래시스템", credits: 3, relation: "substitute", satisfiesRequired: false },
    { statusId: "m_cs0416", code: "CS0416", name: "임베디드소프트웨어", credits: 3, relation: "substitute", satisfiesRequired: false },
    { statusId: "m_cs0123", code: "CS0123", name: "신호 및 시스템", credits: 3, relation: "substitute", satisfiesRequired: false },
  ]),
  CS0667: equivalents([
    { statusId: "m_cs0664", code: "CS0664", name: "HCI", credits: 3, relation: "substitute", satisfiesRequired: false },
  ]),
  CS0855: equivalents([
    { statusId: "m_cs0604", code: "CS0604", name: "객체지향프로그래밍", credits: 3, relation: "substitute", satisfiesRequired: false },
    { statusId: "m_cs0108", code: "CS0108", name: "자료처리기초 및 설계", credits: 3, relation: "substitute", satisfiesRequired: false },
  ]),
  CS0623: equivalents([
    { statusId: "e_cm", code: "CS0851", name: "컴퓨터수학", credits: 3, relation: "same", satisfiesRequired: false },
  ]),
  IC0701: equivalents([
    { statusId: "e_me1", code: "CS0701", name: "전공영어Ⅰ", credits: 2, relation: "same", satisfiesRequired: false },
    { statusId: "e_me2", code: "CS0702", name: "전공영어Ⅱ", credits: 2, relation: "same", satisfiesRequired: false },
  ]),
  CS0856: equivalents([
    { statusId: "m_cs0601", code: "CS0601", name: "기초설계", credits: 3, relation: "same", satisfiesRequired: false },
  ]),
  CS2001: equivalents([
    { statusId: "e_bd", code: "CS0853", name: "빅데이터 분석 및 응용", credits: 3, relation: "same", satisfiesRequired: false },
    { statusId: "m_cs0657", code: "CS0657", name: "확률과 통계", credits: 3, relation: "same", satisfiesRequired: false },
  ]),
  CS0857: equivalents([
    { statusId: "m_cs0668", code: "CS0668", name: "시스템프로그래밍", credits: 3, relation: "substitute", satisfiesRequired: false },
  ]),
  CS0863: equivalents([
    { statusId: "c_cg", code: "CS0612", name: "컴퓨터그래픽스", credits: 3, relation: "substitute", satisfiesRequired: true },
    { statusId: "e_ip", code: "CS0676", name: "영상처리기초", credits: 3, relation: "same", satisfiesRequired: false },
    { statusId: "m_cs0616", code: "CS0616", name: "영상처리", credits: 3, relation: "same", satisfiesRequired: false },
  ]),
  CS0858: equivalents([
    { statusId: "m_cs0677", code: "CS0677", name: "임베디드프로그래밍", credits: 3, relation: "same", satisfiesRequired: false },
    { statusId: "m_cs0671", code: "CS0671", name: "임베디드시스템", credits: 3, relation: "same", satisfiesRequired: false },
  ]),
  CS0864: equivalents([
    { statusId: "e_dc", code: "CS0658", name: "데이터통신", credits: 3, relation: "same", satisfiesRequired: false },
  ]),
  CS0865: equivalents([
    { statusId: "e_ca2", code: "CS0670", name: "컴퓨터구조응용", credits: 3, relation: "same", satisfiesRequired: false },
  ]),
  CS0715: equivalents([
    { statusId: "c_cap1", code: "CS0713", name: "종합설계Ⅰ", credits: 3, relation: "same", satisfiesRequired: true },
    { statusId: "m_cs0418", code: "CS0418", name: "종합설계", credits: 3, relation: "same", satisfiesRequired: true },
  ]),
  CS0716: equivalents([
    { statusId: "c_cap2", code: "CS0714", name: "종합설계Ⅱ", credits: 3, relation: "same", satisfiesRequired: true },
  ]),
  CS2003: equivalents([
    { statusId: "e_ani", code: "CS0674", name: "컴퓨터애니메이션", credits: 3, relation: "same", satisfiesRequired: false },
    { statusId: "m_cs0861", code: "CS0861", name: "객체지향프로그램", credits: 3, relation: "same", satisfiesRequired: false },
  ]),
};

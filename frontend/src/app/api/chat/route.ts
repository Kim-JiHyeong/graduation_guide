import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

// 졸업 가능 여부 자체는 여기서 판단하지 않는다 — 클라이언트가 calculate.ts로 계산한
// 결과를 그대로 전달받아, AI는 그 결과를 자연어로 설명/상담하는 역할만 한다.
export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENAI_API_KEY가 설정되지 않았습니다. frontend/.env.local에 OPENAI_API_KEY=... 를 추가하고 서버를 재시작하세요.",
      },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const question = body?.question as string | undefined;
  const statusSummary = body?.statusSummary as string | undefined;

  if (!question || !statusSummary) {
    return NextResponse.json({ error: "question, statusSummary가 필요합니다." }, { status: 400 });
  }

  const client = new OpenAI({ apiKey });

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "너는 순천대학교 컴퓨터공학과 학생의 졸업요건 상담을 도와주는 도우미야. " +
            "아래에 주어지는 '현재 졸업요건 현황'은 학교 교육과정 데이터를 바탕으로 프로그램이 이미 정확히 계산한 결과이니, " +
            "이 숫자를 절대 다시 계산하거나 추측으로 바꾸지 말고 그대로 근거로 삼아서 친절하고 간결하게 한국어로 답변해. " +
            "이 데이터에 없는 정보(예: 특정 학기 개설 여부, 시간표)는 모른다고 솔직히 말하고, 학과사무실 확인을 권해줘.",
        },
        {
          role: "user",
          content: `현재 졸업요건 현황:\n${statusSummary}\n\n질문: ${question}`,
        },
      ],
      temperature: 0.4,
    });

    const answer = completion.choices[0]?.message?.content ?? "답변을 생성하지 못했습니다.";
    return NextResponse.json({ answer });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "AI 응답 생성 중 오류가 발생했습니다." }, { status: 500 });
  }
}

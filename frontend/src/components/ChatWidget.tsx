"use client";

import { useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "내 졸업요건에서 뭐가 부족해?",
  "수강 예정 과목까지 포함하면 졸업할 수 있어?",
  "전공필수에서 남은 과목이 뭐야?",
  "현재 졸업까지 몇 학점 남았어?",
];

export default function ChatWidget({ statusSummary }: { statusSummary: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(question: string) {
    if (!question.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", content: question }]);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, statusSummary }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "오류가 발생했습니다.");
      setMessages((prev) => [...prev, { role: "assistant", content: body.answer }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <h3 className="mb-1 text-base font-bold text-text-h">🤖 AI 졸업 상담</h3>
      <p className="mb-4 text-xs text-text/60">
        졸업요건 계산은 이미 프로그램이 정확히 끝냈어요. AI는 그 결과를 바탕으로 질문에
        답해줄 뿐, 스스로 학점을 다시 계산하지 않아요.
      </p>

      {messages.length === 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="rounded-full border border-border bg-bg-subtle px-3 py-1.5 text-xs font-medium text-text-h hover:border-accent hover:text-accent"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="mb-4 flex max-h-80 flex-col gap-3 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
              m.role === "user"
                ? "self-end bg-accent text-white"
                : "self-start bg-bg-subtle text-text-h"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && (
          <div className="self-start rounded-xl bg-bg-subtle px-3 py-2 text-sm text-text/60">
            생각 중...
          </div>
        )}
      </div>

      {error && <p className="mb-3 rounded-lg bg-danger-bg p-3 text-xs text-danger">{error}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="졸업 관련 질문을 입력하세요"
          className="flex-1 rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm focus:border-accent focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent-bg"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-gradient-to-br from-accent to-accent-2 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          전송
        </button>
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";

export interface CourseSearchItem {
  id: string;
  elementId: string;
  primaryName: string;
  alternateNames?: string[];
}

function normalizeSearchText(value: string) {
  return value
    .normalize("NFKC")
    .replace(/Ⅰ/g, "I")
    .replace(/Ⅱ/g, "II")
    .replace(/\s+/g, "")
    .toLocaleLowerCase("ko-KR");
}

export function useCourseSearch(
  items: CourseSearchItem[],
  onMatch?: (item: CourseSearchItem, matchedAlternate: boolean) => void
) {
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  function search() {
    const normalizedQuery = normalizeSearchText(query.trim());
    if (!normalizedQuery) {
      setMessage("검색할 교과목명을 입력하세요.");
      return;
    }

    const matches = items.filter((item) => {
      const names = [item.primaryName, ...(item.alternateNames ?? [])];
      return names.some((name) => normalizeSearchText(name).includes(normalizedQuery));
    });

    if (matches.length === 0) {
      setHighlightedId(null);
      setMessage("일치하는 교과목이 없습니다.");
      return;
    }

    const match = matches[0];
    const primaryMatches = normalizeSearchText(match.primaryName).includes(normalizedQuery);
    const matchedAlternate =
      !primaryMatches &&
      (match.alternateNames ?? []).some((name) =>
        normalizeSearchText(name).includes(normalizedQuery)
      );

    onMatch?.(match, matchedAlternate);
    setHighlightedId(match.id);
    setMessage(matches.length > 1 ? `${matches.length}개 중 첫 번째 교과목으로 이동했습니다.` : null);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const element = document.getElementById(match.elementId);
        if (!element) return;
        const rect = element.getBoundingClientRect();
        const sufficientlyVisible = rect.top >= 140 && rect.bottom <= window.innerHeight - 24;
        const pageIsAtTop = window.scrollY <= 1;
        if (pageIsAtTop || !sufficientlyVisible) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  return {
    query,
    setQuery,
    message,
    highlightedId,
    clearHighlight: () => setHighlightedId(null),
    search,
  };
}

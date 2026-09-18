"use client";

export default function CourseSearchBar({
  query,
  onChange,
  onSearch,
  message,
}: {
  query: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  message: string | null;
}) {
  return (
    <div className="mb-5">
      <form
        className="flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          onSearch();
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(event) => onChange(event.target.value)}
          placeholder="교과목명 검색"
          aria-label="교과목명 검색"
          className="min-w-0 flex-1 rounded-lg border border-border bg-bg-subtle px-3 py-2 text-sm focus:border-accent focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent-bg"
        />
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-bold text-white hover:bg-accent-2"
        >
          검색
        </button>
      </form>
      {message && <p className="mt-2 text-xs text-text/60">{message}</p>}
    </div>
  );
}

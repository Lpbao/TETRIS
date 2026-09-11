"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProjectPaginationProps {
  page: number;
  pageCount: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

function clampPage(value: number, pageCount: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(pageCount, Math.max(1, Math.trunc(value)));
}

export function ProjectPagination({
  page,
  pageCount,
  pageSize,
  total,
  onPageChange,
  className,
}: ProjectPaginationProps) {
  const [draftPage, setDraftPage] = useState(String(page));

  useEffect(() => {
    // eslint-disable-next-line
    setDraftPage(String(page));
  }, [page]);

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const atStart = page <= 1;
  const atEnd = page >= pageCount;

  const commitDraft = () => {
    const next = clampPage(Number.parseInt(draftPage, 10), pageCount);
    setDraftPage(String(next));
    if (next !== page) onPageChange(next);
  };

  const onDraftChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDraftPage(event.target.value.replace(/[^\d]/g, ""));
  };

  const onDraftKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.currentTarget.blur();
      commitDraft();
    }
  };

  const navBtnClass =
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-foreground transition-colors touch-manipulation hover:bg-muted disabled:pointer-events-none disabled:opacity-40";

  return (
    <nav
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-3 border-border/60 px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-4",
        className,
      )}
      aria-label="Phân trang dự án"
    >
      <p className="shrink-0 text-center sm:text-left">
        Hiển thị {from}-{to} / {total}
      </p>

      <div className="flex items-center justify-center gap-1.5 sm:justify-end">
        <button
          type="button"
          className={navBtnClass}
          disabled={atStart}
          aria-label="Trang đầu"
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          className={navBtnClass}
          disabled={atStart}
          aria-label="Trang trước"
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>

        <input
          type="text"
          inputMode="numeric"
          value={draftPage}
          onChange={onDraftChange}
          onBlur={commitDraft}
          onKeyDown={onDraftKeyDown}
          aria-label="Số trang hiện tại"
          className="h-8 w-10 rounded-md border border-border bg-background text-center text-sm text-foreground tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <span className="whitespace-nowrap px-0.5">trên {pageCount}</span>

        <button
          type="button"
          className={navBtnClass}
          disabled={atEnd}
          aria-label="Trang sau"
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          className={navBtnClass}
          disabled={atEnd}
          aria-label="Trang cuối"
          onClick={() => onPageChange(pageCount)}
        >
          <ChevronsRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </nav>
  );
}

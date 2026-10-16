import type { ReactElement } from 'react';
import { AlertCircle, Check, ChevronDown } from 'lucide-react';
import { cn, formatNumber } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface PathRow {
  name: string;
  sessions: number;
}

interface SideState {
  rows: PathRow[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

interface PageFlowPanelProps {
  /** The page in the middle, or null while there is nothing to pick yet. */
  page: string | null;
  /** Pages offered by the picker (the period's top pages). */
  pages: string[];
  /** Visitors to `page` this period, when the top-pages list has it. */
  pageVisitors?: number;
  onSelect: (page: string) => void;
  prev: SideState;
  next: SideState;
  className?: string;
}

/** One side of the flow. Rows are buttons: picking one moves it to the middle,
 *  following the path a step further. "Came from" bars grow from the right,
 *  toward the page in the middle. */
function FlowSide({
  label,
  side,
  towardRight,
  emptyText,
  onSelect,
}: {
  label: string;
  side: SideState;
  towardRight: boolean;
  emptyText: string;
  onSelect: (page: string) => void;
}): ReactElement {
  const max = side.rows && side.rows.length > 0 ? side.rows[0].sessions : 1;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span
        className={cn(
          'px-2.5 pb-1 text-[11px] font-medium uppercase tracking-wider text-[#B5B0AA]',
          towardRight && 'sm:text-right'
        )}
      >
        {label}
      </span>
      {side.isError ? (
        <p className="flex items-center gap-1.5 px-2.5 py-3 text-[12.5px] text-[#e07a5f]">
          <AlertCircle className="h-3.5 w-3.5" strokeWidth={1.7} />
          Couldn&rsquo;t load
        </p>
      ) : side.isLoading || !side.rows ? (
        [90, 68, 50, 36, 24].map(w => (
          <div
            key={w}
            className={cn(
              'h-[30px] animate-pulse rounded-md bg-muted',
              towardRight && 'sm:ml-auto'
            )}
            style={{ width: `${w}%` }}
          />
        ))
      ) : side.rows.length === 0 ? (
        <p
          className={cn('px-2.5 py-3 text-[12.5px] text-[#9B9590]', towardRight && 'sm:text-right')}
        >
          {emptyText}
        </p>
      ) : (
        side.rows.map(row => (
          <button
            key={row.name}
            onClick={() => onSelect(row.name)}
            title={`Follow to ${row.name}`}
            className={cn(
              'relative flex h-[30px] w-full items-center justify-between gap-3 rounded-md px-2.5 text-left transition-colors hover:bg-[#E6E4DE] cursor-pointer',
              towardRight && 'sm:flex-row-reverse sm:text-right'
            )}
          >
            <span
              className={cn(
                'absolute inset-y-0 left-0 rounded-md bg-muted',
                towardRight && 'sm:left-auto sm:right-0'
              )}
              style={{ width: `${(row.sessions / max) * 100}%` }}
            />
            <span className="relative z-10 min-w-0 truncate text-[13px] text-[#3D3B4F]">
              {row.name}
            </span>
            <span className="relative z-10 shrink-0 text-[13px] font-medium tabular-nums text-[#3D3B4F]">
              {formatNumber(row.sessions)}
            </span>
          </button>
        ))
      )}
    </div>
  );
}

/**
 * Page flow: where visits came from right before a page, and where they went
 * right after it, counted in visits. Pick the page in the header, or click a
 * page on either side to make it the middle.
 */
export function PageFlowPanel({
  page,
  pages,
  pageVisitors,
  onSelect,
  prev,
  next,
  className,
}: PageFlowPanelProps): ReactElement {
  // The selected page stays in the picker even when it isn't a top page
  // (reached by following a path).
  const options = page && !pages.includes(page) ? [page, ...pages] : pages;

  return (
    <div className={cn('rounded-[20px] bg-white p-5 shadow-float sm:p-6', className)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2.5">
        <h3 className="text-[15px] font-bold tracking-[-0.01em] text-[#3D3B4F]">Page flow</h3>
        {options.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex max-w-full items-center gap-1.5 rounded-full border border-[#E6E4DE] py-1 pl-3 pr-2 text-[13px] font-semibold text-[#3D3B4F] hover:bg-[#F2F1ED] transition-colors cursor-pointer sm:max-w-[20rem]">
              <span className="truncate">{page ?? 'Pick a page'}</span>
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#9B9590]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="max-h-80 w-72 max-w-[calc(100vw-3rem)] overflow-y-auto border-0 p-1.5 shadow-float-lg max-sm:left-0 max-sm:right-auto"
            >
              <p className="px-2.5 pb-1 pt-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-[#B5B0AA]">
                Show flow for
              </p>
              {options.map(p => (
                <DropdownMenuItem
                  key={p}
                  onClick={() => onSelect(p)}
                  className={cn(
                    'gap-2 rounded-[10px] px-2.5 py-2 hover:bg-[#F2F1ED] focus:bg-[#F2F1ED]',
                    p === page && 'bg-[#F2F1ED]'
                  )}
                >
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[#3D3B4F]">{p}</span>
                  {p === page && <Check className="h-3.5 w-3.5 shrink-0 text-[#3D3B4F]" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {page === null ? (
        <p className="py-10 text-center text-[13px] text-[#9B9590]">
          No pageviews in this period yet
        </p>
      ) : (
        // Phones stack the three parts; from sm the page sits between its two
        // sides.
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[minmax(0,1fr)_128px_minmax(0,1fr)] sm:gap-3">
          <FlowSide
            label="Came from"
            side={prev}
            towardRight
            emptyText="No page before this one"
            onSelect={onSelect}
          />
          <div className="flex min-w-0 items-center justify-between gap-3 rounded-[14px] bg-[#3D3B4F] px-4 py-3 text-white sm:min-h-[168px] sm:flex-col sm:justify-center sm:gap-1 sm:px-2.5 sm:text-center">
            <span className="min-w-0 truncate text-[13px] font-semibold sm:max-w-full" title={page}>
              {page}
            </span>
            {pageVisitors !== undefined && (
              <span className="shrink-0 sm:flex sm:flex-col sm:items-center">
                <span className="text-[16px] font-bold tabular-nums sm:text-[20px]">
                  {formatNumber(pageVisitors)}
                </span>
                <span className="ml-1 text-[11px] text-[#D8D5CD] sm:ml-0">visitors</span>
              </span>
            )}
          </div>
          <FlowSide
            label="Went to"
            side={next}
            towardRight={false}
            emptyText="No page after this one"
            onSelect={onSelect}
          />
        </div>
      )}
    </div>
  );
}

import type { ReactElement } from 'react';
import { CalendarDays, Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { Period } from '@traks/shared';

interface PeriodPickerProps {
  value: Period;
  onChange: (period: Period) => void;
}

const PERIOD_OPTIONS: { label: string; value: Period }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: '7D', value: '7d' },
  { label: '30D', value: '30d' },
  { label: '90D', value: '90d' },
  { label: '6M', value: '6m' },
  { label: '1Y', value: '1y' },
  { label: 'All', value: 'all' },
];

/** Pill label below md: fits beside the toolbar at phone width. */
const PERIOD_SHORT: Record<Period, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  '7d': '7 days',
  '30d': '30 days',
  '90d': '90 days',
  '6m': '6 months',
  '1y': '1 year',
  all: 'All time',
};

/** Full period names: the phone menu's options, and the dashboard's labels. */
export const PERIOD_NAMES: Record<Period, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  '6m': 'Last 6 months',
  '1y': 'Last year',
  all: 'All time',
};

/**
 * Floating pill segmented control; the active segment fills with ink. Below
 * md the eight segments don't fit beside the site toolbar, so the same pill
 * becomes a single button that opens a menu below it.
 */
export function PeriodPicker({ value, onChange }: PeriodPickerProps): ReactElement {
  return (
    <>
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Period"
            className="flex h-[38px] items-center gap-2 rounded-full border border-[#E6E4DE] bg-white pl-3.5 pr-3 text-[12.5px] font-semibold text-[#3D3B4F] cursor-pointer"
          >
            <CalendarDays
              className="h-[15px] w-[15px] text-[#9B9590] max-[359px]:hidden"
              strokeWidth={1.8}
            />
            <span className="whitespace-nowrap">{PERIOD_SHORT[value]}</span>
            <ChevronDown className="h-3.5 w-3.5 text-[#9B9590]" />
          </DropdownMenuTrigger>
          {/* Right-aligned under the pill; below 360px the pill wraps to the
              start of its row, so the menu opens rightward instead. */}
          <DropdownMenuContent
            align="end"
            className="w-48 rounded-2xl border-none bg-white p-1.5 shadow-float max-[359px]:left-0 max-[359px]:right-auto"
          >
            {PERIOD_OPTIONS.map(option => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onChange(option.value)}
                className={cn(
                  'justify-between rounded-[10px] px-3 py-2.5 text-[13.5px] text-[#3D3B4F]',
                  value === option.value && 'bg-[#F2F1ED] font-semibold'
                )}
              >
                {PERIOD_NAMES[option.value]}
                {value === option.value && <Check className="h-4 w-4 text-[#3D3B4F]" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="hidden md:inline-flex rounded-full border border-[#E6E4DE] bg-white p-1 gap-0.5">
        {PERIOD_OPTIONS.map(option => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all cursor-pointer',
              value === option.value
                ? 'bg-[#3D3B4F] text-white font-semibold'
                : 'text-[#9B9590] hover:text-[#6b6560]'
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
}

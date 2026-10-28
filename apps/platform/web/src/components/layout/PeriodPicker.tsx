import { useLayoutEffect, useRef, useState, type ReactElement } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Sticker } from '@/components/ui/sticker';
import {
  CUSTOM_PERIOD_MIN_DATE,
  customPeriod,
  isPreset,
  parseCustomPeriod,
  type Period,
  type PeriodParam,
} from '@traks/shared';

interface PeriodPickerProps {
  value: PeriodParam;
  onChange: (period: PeriodParam) => void;
  /** Offer the custom-range option (off on public share pages). */
  allowCustom?: boolean;
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

/** A YYYY-MM-DD day as a local Date (no timezone shift). */
function dayDate(day: string): Date {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDay(day: string, withYear: boolean): string {
  return dayDate(day).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  });
}

/** "3 Mar – 15 Mar 2026"; the year shows once unless the range spans two. */
function customLabel(from: string, to: string): string {
  if (from === to) return formatDay(from, true);
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  return `${formatDay(from, !sameYear)} – ${formatDay(to, true)}`;
}

/** Display name for any period: the preset's name, or the custom range's days. */
export function periodLabel(period: PeriodParam): string {
  if (isPreset(period)) return PERIOD_NAMES[period];
  const custom = parseCustomPeriod(period);
  return custom ? customLabel(custom.from, custom.to) : PERIOD_NAMES.today;
}

/** Pill-sized custom label without the year: "3–15 Mar" within a month,
 *  "28 Feb – 3 Mar" across months, so it fits beside the site toolbar. */
function compactLabel(period: PeriodParam): string {
  const custom = parseCustomPeriod(period);
  if (!custom) return PERIOD_SHORT.today;
  if (custom.from === custom.to) return formatDay(custom.from, false);
  if (custom.from.slice(0, 7) === custom.to.slice(0, 7)) {
    const month = dayDate(custom.to).toLocaleDateString(undefined, { month: 'short' });
    return `${dayDate(custom.from).getDate()}–${dayDate(custom.to).getDate()} ${month}`;
  }
  return `${formatDay(custom.from, false)} – ${formatDay(custom.to, false)}`;
}

/** Today in the viewer's calendar, YYYY-MM-DD. */
function localToday(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function shiftDay(day: string, n: number): string {
  const d = dayDate(day);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * From/to day picker. Native date inputs: no calendar dependency, and phones
 * get their own picker. Days are in the site's timezone on the server.
 */
function CustomRangeDialog({
  open,
  onOpenChange,
  value,
  onApply,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: PeriodParam;
  onApply: (period: PeriodParam) => void;
}): ReactElement {
  const today = localToday();
  const current = parseCustomPeriod(value);
  const [from, setFrom] = useState(current?.from ?? shiftDay(today, -6));
  const [to, setTo] = useState(current?.to ?? today);
  const error =
    !from || !to
      ? 'Pick both days.'
      : from > to
        ? 'The start day must be on or before the end day.'
        : from < CUSTOM_PERIOD_MIN_DATE
          ? 'Ranges start in 2000 or later.'
          : null;

  const apply = (): void => {
    if (error) return;
    onApply(customPeriod(from, to));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Custom range</DialogTitle>
          <DialogDescription>
            Both days are included, in the site&apos;s timezone.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form
            className="grid grid-cols-2 gap-3"
            onSubmit={e => {
              e.preventDefault();
              apply();
            }}
          >
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-[#3D3B4F]">From</span>
              <Input
                type="date"
                value={from}
                min={CUSTOM_PERIOD_MIN_DATE}
                max={to || today}
                onChange={e => setFrom(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[13px] font-medium text-[#3D3B4F]">To</span>
              <Input
                type="date"
                value={to}
                min={from || CUSTOM_PERIOD_MIN_DATE}
                max={today}
                onChange={e => setTo(e.target.value)}
              />
            </label>
            {error && <p className="col-span-2 text-[12.5px] text-[#e07a5f]">{error}</p>}
            {/* Enter in either field applies. */}
            <button type="submit" className="hidden" aria-hidden tabIndex={-1} />
          </form>
        </DialogBody>
        <DialogFooter className="border-t border-[#e6e5ea]/50 mx-6 px-0 pb-5 pt-4">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-[13px]"
          >
            Cancel
          </Button>
          <Button onClick={apply} disabled={!!error} className="rounded-xl text-[13px]">
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Floating pill segmented control; the active segment fills with ink. Below
 * md the eight segments don't fit beside the site toolbar, so the same pill
 * becomes a single button that opens a menu below it. The last segment opens
 * the custom-range dialog and, while one is active, shows its days.
 */
export function PeriodPicker({
  value,
  onChange,
  allowCustom = true,
}: PeriodPickerProps): ReactElement {
  const [customOpen, setCustomOpen] = useState(false);
  const isCustom = !isPreset(value);
  const shortLabel = isPreset(value) ? PERIOD_SHORT[value] : compactLabel(value);

  // Desktop switch: the ink thumb slides under the selected segment. It is
  // measured from the segment itself, so labels of any width line up, and
  // re-measured when the track resizes (fonts loading, custom label).
  const trackRef = useRef<HTMLDivElement>(null);
  const [thumb, setThumb] = useState<{ left: number; width: number } | null>(null);
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const place = (): void => {
      const on = track.querySelector<HTMLElement>('[data-on="true"]');
      setThumb(on ? { left: on.offsetLeft, width: on.offsetWidth } : null);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(track);
    return () => ro.disconnect();
  }, [value, allowCustom, shortLabel]);

  return (
    <>
      {/* Mounted only while open, so each opening starts from the current value. */}
      {customOpen && (
        <CustomRangeDialog
          open={customOpen}
          onOpenChange={setCustomOpen}
          value={value}
          onApply={onChange}
        />
      )}
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Period"
            className="flex h-[36px] items-center gap-2 rounded-[10px] bg-[#F2F1ED] pl-2.5 pr-3 text-[12.5px] font-semibold text-[#3D3B4F] cursor-pointer"
          >
            <Sticker name="calendar" className="h-[18px] w-[18px] max-[359px]:hidden" />
            <span className="whitespace-nowrap">{shortLabel}</span>
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
            {allowCustom && (
              <DropdownMenuItem
                onClick={() => setCustomOpen(true)}
                className={cn(
                  'justify-between rounded-[10px] px-3 py-2.5 text-[13.5px] text-[#3D3B4F]',
                  isCustom && 'bg-[#F2F1ED] font-semibold'
                )}
              >
                Custom range…
                {isCustom && <Check className="h-4 w-4 text-[#3D3B4F]" />}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div
        ref={trackRef}
        className="relative hidden rounded-full bg-[#F2F1ED] p-[3px] md:inline-flex"
      >
        {thumb && (
          <span
            aria-hidden
            className="absolute bottom-[3px] top-[3px] rounded-full bg-[#3D3B4F] transition-[left,width] duration-300 ease-[cubic-bezier(.3,.7,.2,1)] motion-reduce:transition-none"
            style={{ left: thumb.left, width: thumb.width }}
          />
        )}
        {PERIOD_OPTIONS.map(option => (
          <button
            key={option.value}
            data-on={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              'relative z-[1] rounded-full px-[11px] py-1.5 text-[12.5px] transition-colors cursor-pointer',
              value === option.value
                ? 'font-semibold text-white'
                : 'font-medium text-[#6E6C7C] hover:text-[#3D3B4F]'
            )}
          >
            {option.label}
          </button>
        ))}
        {allowCustom && (
          <button
            data-on={isCustom}
            onClick={() => setCustomOpen(true)}
            aria-label="Custom range"
            title="Custom range"
            className={cn(
              'relative z-[1] flex items-center gap-1.5 rounded-full px-2 py-1 text-[12.5px] transition-colors cursor-pointer',
              isCustom ? 'pr-3 font-semibold text-white' : 'font-medium text-[#6E6C7C]'
            )}
          >
            <Sticker name="calendar" className={cn('h-5 w-5', isCustom && 'text-white')} />
            {isCustom && <span className="whitespace-nowrap">{shortLabel}</span>}
          </button>
        )}
      </div>
    </>
  );
}

import { useMemo } from 'react';
import type { MetricKey } from '../types';
import { stateData, METRICS } from '../data/stateData';
import { stateAbbreviations } from '../data/stateAbbreviations';

interface Props {
  metric: MetricKey;
  selectedFips: string | null;
  onSelect: (fips: string) => void;
}

export function RankList({ metric, selectedFips, onSelect }: Props) {
  const config = METRICS[metric];

  const sorted = useMemo(
    () =>
      [...stateData].sort(
        (a, b) => (b[metric] as number) - (a[metric] as number),
      ),
    [metric],
  );

  const top5 = sorted.slice(0, 5);
  const bottom5 = sorted.slice(-5).reverse();

  const barMax = sorted[0][metric] as number;

  function RankRow({
    state,
    rank,
    isTop,
  }: {
    state: (typeof stateData)[0];
    rank: number;
    isTop: boolean;
  }) {
    const value = state[metric] as number;
    const barWidth = (value / barMax) * 100;
    const isSelected = selectedFips === state.fips;
    const abbr = stateAbbreviations[state.fips] ?? '??';

    return (
      <button
        onClick={() => onSelect(state.fips)}
        className={`w-full flex flex-col gap-1 px-3 py-2 rounded-lg transition-all cursor-pointer text-left
          ${
            isSelected
              ? 'bg-zinc-700 border border-zinc-600'
              : 'hover:bg-zinc-800/60 border border-transparent'
          }`}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <span className='text-[10px] font-mono text-zinc-600 w-5'>
              #{rank}
            </span>
            <span className='text-xs font-mono text-zinc-400'>{abbr}</span>
            <span className='text-xs text-zinc-300 truncate max-w-24'>
              {state.name === 'District of Columbia' ? 'D.C.' : state.name}
            </span>
          </div>
          <span className='text-xs font-mono text-zinc-300 shrink-0'>
            {config.format(value)}
          </span>
        </div>
        <div className='h-1 bg-zinc-800 rounded-full overflow-hidden ml-7'>
          <div
            className='h-full rounded-full transition-all duration-500'
            style={{
              width: `${barWidth}%`,
              backgroundColor: isTop
                ? metric === 'population'
                  ? '#3b82f6'
                  : '#f97316'
                : metric === 'population'
                  ? '#93c5fd'
                  : '#fdba74',
            }}
          />
        </div>
      </button>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      {/* Top 5 */}
      <div className='flex flex-col gap-1'>
        <span className='text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider px-3'>
          ▲ Top 5 — {config.label}
        </span>
        {top5.map((state, i) => (
          <RankRow key={state.fips} state={state} rank={i + 1} isTop />
        ))}
      </div>

      {/* Bottom 5 */}
      <div className='flex flex-col gap-1'>
        <span className='text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider px-3'>
          ▼ Bottom 5 — {config.label}
        </span>
        {bottom5.map((state, i) => (
          <RankRow
            key={state.fips}
            state={state}
            rank={stateData.length - i}
            isTop={false}
          />
        ))}
      </div>
    </div>
  );
}

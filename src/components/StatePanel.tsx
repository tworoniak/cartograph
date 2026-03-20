import type { StateData, MetricKey } from '../types';
import { METRICS, stateData } from '../data/stateData';

interface Props {
  state: StateData;
  metric: MetricKey;
  onClose: () => void;
}

function getRank(state: StateData, metric: MetricKey): number {
  const sorted = [...stateData].sort(
    (a, b) => (b[metric] as number) - (a[metric] as number),
  );
  return sorted.findIndex((s) => s.fips === state.fips) + 1;
}

function getAverage(metric: MetricKey): number {
  const values = stateData.map((s) => s[metric] as number);
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export function StatePanel({ state, metric, onClose }: Props) {
  const config = METRICS[metric];
  const value = state[metric] as number;
  const rank = getRank(state, metric);
  const avg = getAverage(metric);
  const vsAvg = value - avg;
  const aboveAvg = vsAvg > 0;

  return (
    <div className='bg-zinc-900 border border-zinc-800 rounded-2xl p-5 w-64 flex flex-col gap-4'>
      <div className='flex items-start justify-between'>
        <div>
          <h2 className='text-sm font-bold text-white'>{state.name}</h2>
          <p className='text-xs text-zinc-500 font-mono'>FIPS {state.fips}</p>
        </div>
        <button
          onClick={onClose}
          className='text-zinc-600 hover:text-zinc-400 transition-colors text-lg leading-none cursor-pointer'
        >
          ×
        </button>
      </div>

      <div className='flex flex-col gap-3'>
        {/* Active metric */}
        <div className='p-3 bg-zinc-800/60 rounded-xl border border-zinc-700'>
          <p className='text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1'>
            {config.label}
          </p>
          <p className='text-2xl font-bold text-white'>
            {config.format(value)}
          </p>
          <div className='flex items-center gap-2 mt-1'>
            <span className='text-[10px] font-mono text-zinc-500'>
              Rank #{rank} of {stateData.length}
            </span>
            <span
              className={`text-[10px] font-mono font-semibold ${aboveAvg ? 'text-red-400' : 'text-emerald-400'}`}
            >
              {aboveAvg ? '▲' : '▼'} {config.format(Math.abs(vsAvg))} vs avg
            </span>
          </div>
        </div>

        {/* All metrics */}
        <div className='flex flex-col gap-2'>
          <p className='text-[10px] font-mono text-zinc-600 uppercase tracking-wider'>
            All Metrics
          </p>
          {Object.values(METRICS).map((m) => (
            <div key={m.key} className='flex items-center justify-between'>
              <span className='text-xs text-zinc-400'>{m.label}</span>
              <span className='text-xs font-mono text-zinc-300'>
                {m.format(state[m.key] as number)}
              </span>
            </div>
          ))}
          <div className='flex items-center justify-between'>
            <span className='text-xs text-zinc-400'>Population density</span>
            <span className='text-xs font-mono text-zinc-300'>
              {state.populationDensity.toFixed(1)}/mi²
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

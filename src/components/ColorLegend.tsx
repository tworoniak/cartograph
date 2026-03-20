import type { MetricKey } from '../types';
import { METRICS } from '../data/stateData';

interface Props {
  metric: MetricKey;
  min: number;
  max: number;
}

const GRADIENT: Record<MetricKey, string> = {
  population: 'linear-gradient(to right, #dbeafe, #1d4ed8)',
  unemployment: 'linear-gradient(to right, #ffedd5, #c2410c)',
};

export function ColorLegend({ metric, min, max }: Props) {
  const config = METRICS[metric];

  return (
    <div className='flex flex-col gap-1.5'>
      <span className='text-[10px] font-mono text-zinc-500 uppercase tracking-wider'>
        {config.label}
      </span>
      <div
        className='h-3 w-48 rounded-full'
        style={{ background: GRADIENT[metric] }}
      />
      <div className='flex justify-between w-48'>
        <span className='text-[10px] font-mono text-zinc-400'>
          {config.format(min)}
        </span>
        <span className='text-[10px] font-mono text-zinc-400'>
          {config.format(max)}
        </span>
      </div>
    </div>
  );
}

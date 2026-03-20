import type { TooltipData, MetricKey } from '../types';
import { METRICS } from '../data/stateData';

interface Props {
  data: TooltipData;
  metric: MetricKey;
}

export function Tooltip({ data, metric }: Props) {
  const config = METRICS[metric];
  const value = data.state[metric] as number;

  return (
    <div
      className='fixed z-50 pointer-events-none'
      style={{ left: data.x + 12, top: data.y - 48 }}
    >
      <div className='bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 shadow-xl min-w-36'>
        <p className='text-xs font-bold text-white mb-1'>{data.state.name}</p>
        <p className='text-xs text-zinc-400'>
          {config.label}:{' '}
          <span className='text-zinc-200 font-semibold'>
            {config.format(value)}
          </span>
        </p>
      </div>
    </div>
  );
}

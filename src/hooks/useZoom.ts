import { useCallback, useRef, useState } from 'react';
import { zoom as d3Zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom';
import { select } from 'd3-selection';
import 'd3-transition';
import type { ZoomTransform } from '../types';
import { getFeatureBounds } from '../lib/projection';
import { WIDTH, HEIGHT } from '../lib/projection';
import type { GeoPermissibleObjects } from 'd3-geo';

export function useZoom(svgRef: React.RefObject<SVGSVGElement | null>) {
  const [transform, setTransform] = useState<ZoomTransform>({
    x: 0,
    y: 0,
    k: 1,
  });
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(
    null,
  );

  const initZoom = useCallback(() => {
    if (!svgRef.current) return;

    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.8, 8])
      .on('zoom', (event) => {
        const { x, y, k } = event.transform;
        setTransform({ x, y, k });
      });

    select(svgRef.current).call(zoomBehavior);
    zoomBehaviorRef.current = zoomBehavior;
  }, [svgRef]);

  const applyTransform = useCallback(
    (tx: number, ty: number, scale: number, duration: number) => {
      if (!svgRef.current || !zoomBehaviorRef.current) return;
      const newTransform = zoomIdentity.translate(tx, ty).scale(scale);
      select(svgRef.current)
        .transition()
        .duration(duration)
        .call((t) => {
          zoomBehaviorRef.current!.transform(t as never, newTransform);
        });
    },
    [svgRef],
  );

  const focusFeature = useCallback(
    (feature: GeoPermissibleObjects) => {
      const [[x0, y0], [x1, y1]] = getFeatureBounds(feature);
      const scale = Math.min(
        8,
        0.9 / Math.max((x1 - x0) / WIDTH, (y1 - y0) / HEIGHT),
      );
      const tx = WIDTH / 2 - (scale * (x0 + x1)) / 2;
      const ty = HEIGHT / 2 - (scale * (y0 + y1)) / 2;
      applyTransform(tx, ty, scale, 750);
    },
    [applyTransform],
  );

  const resetZoom = useCallback(() => {
    applyTransform(0, 0, 1, 500);
  }, [applyTransform]);

  return { transform, initZoom, focusFeature, resetZoom };
}

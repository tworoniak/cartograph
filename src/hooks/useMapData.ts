import { useEffect, useState } from 'react';
import { feature } from 'topojson-client';
import type { Topology } from 'topojson-specification';
import type { FeatureCollection } from 'geojson';
import type { StateFeature } from '../types';

const TOPO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

export function useMapData() {
  const [features, setFeatures] = useState<StateFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(TOPO_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((topo: Topology) => {
        const states = feature(
          topo,
          topo.objects['states'] as Parameters<typeof feature>[1],
        ) as FeatureCollection;

        setFeatures(
          (states.features as StateFeature[]).map((f) => ({
            ...f,
            properties: {
              ...f.properties,
              fips: String(f.id).padStart(2, '0'),
              name: f.properties?.name ?? '',
            },
          })),
        );

        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  return { features, loading, error };
}

# Cartograph

A US states choropleth map renderer built entirely in pure SVG — no Mapbox, no Google Maps, no Leaflet. Converts TopoJSON geographic data to SVG paths using D3's Albers USA projection, with zoom, pan, click-to-focus, hover tooltips, animated metric transitions, state abbreviation labels, and a ranked leaderboard panel.

Built with React, TypeScript, Tailwind CSS, Vite, and individual D3 packages.

---

## Purpose

Most developers treat maps as a black box — drop in a Mapbox token and render tiles. Building a choropleth from scratch requires understanding geographic projections, coordinate systems, path generation, and color scales that are usually hidden behind map library APIs.

This project implements every layer from scratch:

- Converting TopoJSON to GeoJSON features client-side
- Projecting latitude/longitude coordinates to SVG x/y using the Albers USA projection
- Generating SVG `<path>` `d` attributes from GeoJSON polygons
- Mapping data values to colors using a square root scale
- Implementing zoom and pan via D3's zoom behavior on an SVG element
- Computing feature bounding boxes to animate the viewport to a selected state

---

## Features

### Choropleth Map

US states rendered as SVG `<path>` elements, colored by data value using a `scaleSequentialSqrt` color scale. Square root scaling is used deliberately — linear scaling causes high-population states like California and Texas to dominate the color range, washing out variation between smaller states. Square root compression makes differences between mid-range states visible.

### Two Metrics

- **Population** — 2023 census estimates, blue color scale
- **Unemployment Rate** — 2023 data, orange color scale

Switching metrics triggers a CSS `transition: fill 500ms` on every path simultaneously, animating the entire map between color schemes.

### Zoom & Pan

D3's zoom behavior applied to the SVG element with a scale extent of 0.8–8×. The zoom transform is stored in React state and applied to a `<g>` group via a `transform` attribute. Border stroke widths divide by the current zoom scale so state borders stay visually consistent at any zoom level.

### Click to Focus

Clicking a state computes its bounding box using `geoPath.bounds()`, calculates the scale and translation needed to center it in the viewport, and animates the zoom transform over 750ms. Clicking the same state again resets the zoom.

### State Abbreviation Labels

SVG `<text>` elements rendered at each state's centroid via `geoPath.centroid()`. Font size scales inversely with zoom so labels remain a consistent visual size. Small northeast states (RI, DE, CT, NJ, MD, MA, VT, NH, DC) are hidden at zoom levels below 2× to avoid label collision. Label color is determined by the fill's relative luminance — dark text on light states, light text on dark states.

### Hover Tooltips

Fixed-position div following the cursor showing state name and formatted metric value. Built without a tooltip library.

### State Detail Panel

Clicking a state opens a detail panel showing the active metric value, rank out of 51, comparison to the national average, and all metrics including population density.

### Top 5 / Bottom 5 Rank List

A persistent right panel showing the five highest and five lowest states for the active metric, with proportional bar indicators. Clicking a row focuses the map on that state. Updates instantly when switching metrics.

### Color Legend

Gradient bar showing the min and max values for the active metric, formatted appropriately (millions for population, percentage for unemployment).

---

## Tech Stack

| Tool                  | Purpose                                   |
| --------------------- | ----------------------------------------- |
| React 18 + TypeScript | UI and type safety                        |
| Vite                  | Dev server and bundler                    |
| Tailwind CSS v4       | Styling                                   |
| `d3-geo`              | Albers USA projection and path generation |
| `d3-scale`            | Sequential square root color scale        |
| `d3-scale-chromatic`  | Blues and Oranges color interpolators     |
| `d3-zoom`             | Zoom and pan behavior                     |
| `d3-selection`        | SVG element selection for zoom            |
| `d3-transition`       | Animated zoom transitions                 |
| `topojson-client`     | TopoJSON → GeoJSON conversion             |

Individual D3 packages are used rather than the full `d3` bundle to keep bundle size minimal.

---

## Getting Started

```bash
git clone https://github.com/your-username/cartograph
cd cartograph
npm install
npm run dev
```

The map data is fetched at runtime from the `us-atlas` CDN — no file to check in, no API key required.

---

## Project Structure

```
src/
├── App.tsx                          # Root layout, state management, event wiring
├── types/
│   └── index.ts                     # StateFeature, StateData, MetricKey, MetricConfig,
│                                    # TooltipData, ZoomTransform
├── data/
│   ├── stateData.ts                 # Population + unemployment data by FIPS code,
│   │                                # METRICS config map
│   └── stateAbbreviations.ts        # FIPS → state abbreviation lookup
├── lib/
│   ├── projection.ts                # Albers USA projection, geoPath, centroid, bounds
│   ├── colorScale.ts                # scaleSequentialSqrt, getStateColor
│   └── colorUtils.ts                # Luminance-based label contrast (getContrastFromFill)
├── hooks/
│   ├── useMapData.ts                # Fetch + parse TopoJSON → GeoJSON features
│   ├── useTooltip.ts                # Tooltip position and content state
│   └── useZoom.ts                   # D3 zoom behavior, focusFeature, resetZoom
└── components/
    ├── USMap.tsx                    # SVG container, zoom group, path + label rendering
    ├── StatePath.tsx                # Individual state <path> with color + events
    ├── StateLabel.tsx               # SVG <text> abbreviation at centroid
    ├── Tooltip.tsx                  # Floating cursor-following tooltip
    ├── ColorLegend.tsx              # Gradient bar with min/max labels
    ├── StatePanel.tsx               # Selected state detail — rank, vs avg, all metrics
    ├── MetricSwitcher.tsx           # Population / Unemployment toggle
    └── RankList.tsx                 # Top 5 / Bottom 5 ranked rows with bar indicators
```

---

## How It Works

### Geographic Pipeline

1. **Fetch** — `us-atlas` TopoJSON is fetched from the CDN on mount via `useMapData`
2. **Convert** — `topojson-client`'s `feature()` converts the topology to a GeoJSON `FeatureCollection`
3. **Project** — `geoAlbersUsa().scale(1300).translate([480, 300])` maps lat/lng to SVG x/y
4. **Path** — `geoPath(projection)` generates SVG `d` attribute strings from each GeoJSON polygon
5. **Color** — `scaleSequentialSqrt` maps raw data values to D3 color interpolators

### Why Square Root Scale

A linear scale for population maps California (39.5M) at full saturation while Wyoming (577K) barely registers. Square root compression — `value^0.5` — reduces the range between extremes while preserving rank order, making variation across the full dataset visible.

### Zoom Architecture

D3's zoom behavior fires on every scroll/drag event and updates a `ZoomTransform` in React state `{ x, y, k }`. This is applied to a `<g>` group as a CSS `transform` attribute — all 50+ paths move together with a single attribute update rather than 50 individual re-renders. Border stroke widths divide by `k` to stay visually consistent.

### Click to Focus

`geoPath.bounds(feature)` returns `[[x0, y0], [x1, y1]]` in SVG coordinates. The required scale is `0.9 / max((x1-x0)/WIDTH, (y1-y0)/HEIGHT)` — fitting the state into 90% of the viewport. Translation centers the bounding box midpoint. D3's `zoomIdentity.translate(tx, ty).scale(k)` produces the target transform, animated via `d3-transition`.

### Label Contrast

SVG text labels use the same luminance-based contrast algorithm as the Chromatic project — `getLuminance(fill) > 0.179` determines whether to use dark or light text, correctly handling mid-range hues that fool HSL-based approaches.

---

## Scripts

```bash
npm run dev        # Start Vite dev server
npm run build      # Production build
npm run preview    # Preview production build locally
npm run lint       # ESLint
```

---

## What I Learned

The trickiest part was the D3/TypeScript integration. D3's zoom behavior types use `Selection<Element, unknown>` internally but `select(svgRef.current)` returns `Selection<SVGSVGElement, unknown>` — these are incompatible in TypeScript even though they work at runtime. The solution was using `as never` to bridge the type gap on the transition call, which is the idiomatic workaround for this known D3 typing limitation.

The FIPS code matching issue highlighted a real data pipeline problem: the `us-atlas` TopoJSON includes US territories (FIPS 60, 66, 69, 72, 78) that don't have matching entries in the state data. Rather than erroring, the map renders them in the default gray — which is actually the correct cartographic treatment for regions without data.

The square root color scale decision came from observing the linear scale in practice. With a linear scale, every state except California and Texas renders as near-white — the population range is too extreme. Square root scaling is the standard cartographic solution and produces a map where you can actually read the data.

---

## Related Projects

This is part of a series of frontend experiment projects exploring real tradeoffs in the React ecosystem:

- **Cartograph** ← you are here
- Physica — physics-based UI with spring animations and particle systems
- Chromatic — visual theme builder with WCAG 2.1 contrast checking
- Design Token Pipeline — W3C DTCG token transformation, 4 output formats
- State Management Comparison — Zustand vs. Jotai vs. Redux Toolkit
- Virtual List Renderer — from-scratch virtual rendering, 100k rows at 60fps
- UI Design Systems Comparison — shadcn/ui vs. Radix vs. Material UI

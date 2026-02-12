# Powers Site — Design Document

**Date:** 2025-02-11
**Status:** Draft

## Purpose

An interactive geopolitical power-mapping website. The site serves as both a personal analytical reference tool and a public-facing portfolio piece. Users can explore a layered world map, view regional deep-dives, and browse country profiles.

## Site Structure

### Homepage / World Map (`/`)

A full-width interactive SVG world map rendered with D3.js and TopoJSON. A toggle bar at the top switches between three layers: Power Tiers, Alliances, and Conflicts. Clicking a country opens a tooltip or side panel with quick stats. Clicking a region label navigates to that region's page.

### Regional Pages (`/regions/[id]`)

Each regional page (e.g. Red Sea, Balkans) has a zoomed-in D3 map of the area at the top, followed by written analysis in Markdown rendered below. The regional map inherits the same layer toggles from the homepage.

### Country Profiles (`/countries/[id]`) — Stretch Goal

A page per country showing power ranking, alliance memberships, active conflicts, and links to any regional pages it appears in.

## Tech Stack

- **Framework:** Next.js (App Router)
- **Map Rendering:** D3.js + TopoJSON
- **Styling:** Tailwind CSS
- **Content:** Markdown (rendered with next-mdx-remote or similar)
- **Data:** JSON files in the repo
- **Deployment:** Vercel

## Data Model

All data lives in a `data/` directory at the repo root.

### Country (`data/countries/{id}.json`)

```json
{
  "id": "USA",
  "name": "United States",
  "isoCode": "US",
  "powerTier": 1,
  "alliances": ["nato", "aukus", "five-eyes"],
  "conflicts": ["ukraine"],
  "description": "Brief summary."
}
```

### Alliance (`data/alliances/{id}.json`)

```json
{
  "id": "nato",
  "name": "NATO",
  "members": ["USA", "GBR", "FRA", "DEU"],
  "color": "#3B82F6",
  "type": "military",
  "description": "Analysis text."
}
```

### Conflict (`data/conflicts/{id}.json`)

```json
{
  "id": "ukraine",
  "name": "Ukraine War",
  "parties": ["RUS", "UKR"],
  "supporters": {
    "UKR": ["USA", "GBR"],
    "RUS": ["CHN", "IRN"]
  },
  "status": "active",
  "region": "eastern-europe"
}
```

### Region (`data/regions/{id}.json`)

```json
{
  "id": "red-sea",
  "name": "The Red Sea",
  "countries": ["YEM", "SAU", "ERI", "DJI", "EGY", "SDN"],
  "bounds": {
    "topLeft": [12.0, 32.0],
    "bottomRight": [28.0, 50.0]
  },
  "conflicts": ["yemen-houthi"],
  "analysis": "content/regions/red-sea.md"
}
```

### Layer Config (`data/layers/{id}.json`)

Each layer file defines rendering rules: which data field to color by, the color scale, and legend content.

## Map Interaction

### Power Tiers Layer

Countries are shaded on a gradient based on their `powerTier` value (Tier 1 = darkest, Tier 5 = lightest). A legend explains the scale. Hovering a country shows a tooltip with name, tier, and a one-line summary.

### Alliances Layer

Countries are colored by primary alliance membership using the `color` field from each alliance file. Countries in multiple alliances get a striped or split-color pattern. The legend lists each alliance with its color swatch.

### Conflicts Layer

Active conflict zones are highlighted with a distinct marker (pulsing dot or hatched overlay on involved countries). Hovering shows the conflict name, parties, and status. Clicking navigates to the relevant regional page.

### Shared Behavior

Across all layers, clicking a country opens an info panel with quick stats and links to the country profile and its associated regions. Region labels are clickable. Transitions between layers use a smooth color fade (~400ms via D3 transitions).

## Visual Design

- **Background:** Dark navy or charcoal base
- **Map colors:** Bright, saturated, high-contrast against the dark background
- **Typography:** Inter or IBM Plex Sans. Large bold headings on regional pages, readable body text for analysis.
- **Homepage layout:** Map dominates the viewport (~80% height). Layer toggle bar pinned at top.
- **Regional page layout:** Map takes ~50% of viewport. Markdown analysis scrolls below.
- **Navigation:** Minimal top bar with home link and region dropdown.

## Repo Structure

```
powers-site/
  app/                        # Next.js app directory
    page.tsx                  # Homepage with world map
    layout.tsx                # Root layout
    countries/[id]/page.tsx   # Country profile pages
    regions/[id]/page.tsx     # Regional pages
  components/
    WorldMap.tsx              # Main D3 map component
    RegionMap.tsx             # Zoomed regional map
    LayerToggle.tsx           # Layer switching UI
    CountryTooltip.tsx        # Hover/click info panel
    ConflictMarker.tsx        # Conflict overlay
  data/
    countries/                # Country JSON files
    alliances/                # Alliance JSON files
    conflicts/                # Conflict JSON files
    regions/                  # Region JSON files
    layers/                   # Layer config files
  content/
    regions/                  # Markdown analysis files
  lib/
    mapUtils.ts               # D3 rendering helpers
    dataLoader.ts             # Functions to read JSON/MD
  public/
    geo/                      # TopoJSON world map files
```

## Implementation Phases

### Phase 1 — Foundation
- Next.js project setup with Tailwind
- D3 world map rendering with TopoJSON
- Basic Power Tiers layer with sample country data
- Homepage layout with map and toggle bar

### Phase 2 — Layers & Interactivity
- Alliances layer
- Conflicts layer
- Layer toggle transitions
- Country tooltips and info panel

### Phase 3 — Regional Pages
- Region data model and zoomed map component
- Markdown rendering for analysis content
- Navigation between homepage and regions

### Phase 4 — Polish & Stretch
- Country profile pages
- Responsive design
- Performance optimization
- Deployment to Vercel

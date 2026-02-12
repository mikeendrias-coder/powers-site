"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import type { Country, Alliance, Conflict, LayerConfig } from "@/lib/dataLoader";

type LayerType = "power-tiers" | "alliances" | "conflicts";

interface WorldMapProps {
  countries: Country[];
  alliances: Alliance[];
  conflicts: Conflict[];
  powerTiersConfig: LayerConfig;
  countryLookup: Record<string, Country>;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  country: Country | null;
}

export default function WorldMap({
  countries,
  alliances,
  conflicts,
  powerTiersConfig,
  countryLookup,
}: WorldMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activeLayer, setActiveLayer] = useState<LayerType>("power-tiers");
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    country: null,
  });
  const [geoData, setGeoData] = useState<any>(null);

  // Build alliance color lookup
  const allianceColorMap: Record<string, string> = {};
  for (const alliance of alliances) {
    for (const memberId of alliance.members) {
      if (!allianceColorMap[memberId]) {
        allianceColorMap[memberId] = alliance.color;
      }
    }
  }

  // Build conflict party lookup
  const conflictParties = new Set<string>();
  for (const conflict of conflicts) {
    for (const party of conflict.parties) conflictParties.add(party);
    for (const supporters of Object.values(conflict.supporters)) {
      for (const s of supporters) conflictParties.add(s);
    }
  }

  // Load TopoJSON
  useEffect(() => {
    fetch("/geo/countries-110m.json")
      .then((res) => res.json())
      .then((topo) => {
        const features = topojson.feature(topo, topo.objects.countries) as any;
        setGeoData(features);
      });
  }, []);

  const getFill = useCallback(
    (featureId: string) => {
      const country = countryLookup[featureId];

      if (activeLayer === "power-tiers") {
        if (!country) return "#1a2035";
        const tier = String(country.powerTier);
        return powerTiersConfig.colorScale[tier] || "#1a2035";
      }

      if (activeLayer === "alliances") {
        if (!country) return "#1a2035";
        return allianceColorMap[country.id] || "#2a3045";
      }

      if (activeLayer === "conflicts") {
        if (!country) return "#1a2035";
        if (conflictParties.has(country.id)) return "#DC2626";
        return "#1a2035";
      }

      return "#1a2035";
    },
    [activeLayer, countryLookup, powerTiersConfig, allianceColorMap, conflictParties]
  );

  // Render map
  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const projection = d3
      .geoNaturalEarth1()
      .fitSize([width, height], geoData);

    const pathGenerator = d3.geoPath().projection(projection);

    // Clear and redraw
    svg.selectAll("g.map-layer").remove();
    const g = svg.append("g").attr("class", "map-layer");

    // Draw country paths
    g.selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("class", "country-path")
      .attr("d", (d: any) => pathGenerator(d) || "")
      .attr("fill", (d: any) => getFill(d.id))
      .on("mouseenter", (event: MouseEvent, d: any) => {
        const country = countryLookup[d.id];
        if (country) {
          setTooltip({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            country,
          });
        }
      })
      .on("mousemove", (event: MouseEvent) => {
        setTooltip((prev) => ({ ...prev, x: event.clientX, y: event.clientY }));
      })
      .on("mouseleave", () => {
        setTooltip({ visible: false, x: 0, y: 0, country: null });
      });

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);
  }, [geoData, getFill, countryLookup]);

  // Update fills on layer change (without full re-render)
  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current)
      .selectAll(".country-path")
      .transition()
      .duration(400)
      .attr("fill", function (d: any) {
        return getFill(d.id);
      });
  }, [activeLayer, getFill]);

  const tierLabel = (tier: number) => {
    const labels: Record<number, string> = {
      1: "Superpower",
      2: "Great Power",
      3: "Regional Power",
      4: "Middle Power",
      5: "Minor Power",
    };
    return labels[tier] || `Tier ${tier}`;
  };

  return (
    <div className="relative w-full h-[calc(100vh-3.5rem)] bg-bg-primary overflow-hidden">
      {/* Layer Toggle */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-bg-card/90 backdrop-blur-md border border-white/10 rounded-full p-1">
        {(
          [
            { id: "power-tiers", label: "Power Tiers" },
            { id: "alliances", label: "Alliances" },
            { id: "conflicts", label: "Conflicts" },
          ] as { id: LayerType; label: string }[]
        ).map((layer) => (
          <button
            key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            className={`px-5 py-2 text-sm font-display font-medium rounded-full transition-all duration-200 ${
              activeLayer === layer.id
                ? "bg-white text-bg-primary shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {layer.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-8 z-30 bg-bg-card/90 backdrop-blur-md border border-white/10 rounded-xl p-4 min-w-[180px]">
        <h3 className="text-xs font-display font-semibold text-slate-400 uppercase tracking-wider mb-3">
          {activeLayer === "power-tiers" && "Power Tiers"}
          {activeLayer === "alliances" && "Alliances"}
          {activeLayer === "conflicts" && "Conflicts"}
        </h3>

        {activeLayer === "power-tiers" &&
          powerTiersConfig.legend.map((item) => (
            <div key={item.label} className="flex items-center gap-2 mb-2 last:mb-0">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-xs font-body text-slate-300">{item.label}</span>
            </div>
          ))}

        {activeLayer === "alliances" &&
          alliances.map((a) => (
            <div key={a.id} className="flex items-center gap-2 mb-2 last:mb-0">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ background: a.color }}
              />
              <span className="text-xs font-body text-slate-300">{a.name}</span>
            </div>
          ))}

        {activeLayer === "conflicts" && (
          <>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-sm flex-shrink-0 bg-red-600" />
              <span className="text-xs font-body text-slate-300">Involved party</span>
            </div>
            {conflicts.map((c) => (
              <div key={c.id} className="mt-2 pt-2 border-t border-white/5">
                <span className="text-xs font-body text-slate-400">{c.name}</span>
                <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-600/20 text-red-400">
                  {c.status}
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Tooltip */}
      {tooltip.visible && tooltip.country && (
        <div
          className="tooltip visible"
          style={{
            left: tooltip.x + 16,
            top: tooltip.y - 16,
          }}
        >
          <div className="font-display font-bold text-white text-sm mb-1">
            {tooltip.country.name}
          </div>
          {activeLayer === "power-tiers" && (
            <div className="flex items-center gap-2">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{
                  background:
                    powerTiersConfig.colorScale[String(tooltip.country.powerTier)],
                }}
              />
              <span className="text-xs font-body text-slate-300">
                Tier {tooltip.country.powerTier} &mdash; {tierLabel(tooltip.country.powerTier)}
              </span>
            </div>
          )}
          {activeLayer === "alliances" && tooltip.country.alliances.length > 0 && (
            <div className="text-xs font-body text-slate-300">
              {tooltip.country.alliances
                .map((aId) => alliances.find((a) => a.id === aId)?.name || aId)
                .join(", ")}
            </div>
          )}
          <p className="text-xs font-body text-slate-400 mt-1.5">
            {tooltip.country.description}
          </p>
        </div>
      )}

      {/* Map SVG */}
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ background: "transparent" }}
      />

      {/* Subtle grid background */}
      <div
        className="absolute inset-0 z-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

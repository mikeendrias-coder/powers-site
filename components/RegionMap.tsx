"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";

interface RegionMapProps {
  bounds: {
    topLeft: [number, number];
    bottomRight: [number, number];
  };
  regionCountries: string[];
}

export default function RegionMap({ bounds, regionCountries }: RegionMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [geoData, setGeoData] = useState<any>(null);

  const isoToNumeric: Record<string, string> = {
    US: "840", CN: "156", RU: "643", GB: "826", FR: "250",
    DE: "276", JP: "392", IN: "356", BR: "076", CA: "124",
    AU: "036", KR: "410", IT: "380", ES: "724", MX: "484",
    ID: "360", TR: "792", SA: "682", IR: "364", EG: "818",
    PK: "586", NG: "566", ZA: "710", AR: "032", PL: "616",
    UA: "804", TH: "764", VN: "704", MY: "458", PH: "608",
    IL: "376", AE: "784", SG: "702", NZ: "554", NO: "578",
    SE: "752", DK: "208", FI: "246", NL: "528", BE: "056",
    CH: "756", AT: "040", PT: "620", GR: "300", CZ: "203",
    RO: "642", HU: "348", IE: "372", CO: "170", CL: "152",
    PE: "604", VE: "862", EC: "218", BO: "068", PY: "600",
    UY: "858", KE: "404", ET: "231", GH: "288", TZ: "834",
    YE: "887", ER: "232", DJ: "262", SD: "729", SO: "706",
    KP: "408", MM: "104", BD: "050", LK: "144", NP: "524",
    KZ: "398", UZ: "860", TM: "795", KG: "417", TJ: "762",
    GE: "268", AM: "051", AZ: "031", IQ: "368", SY: "760",
    JO: "400", LB: "422", LY: "434", TN: "788", DZ: "012",
    MA: "504", CU: "192", DO: "214", HT: "332", JM: "388",
    RS: "688", BA: "070", HR: "191", SI: "705", ME: "499",
    MK: "807", AL: "008", BG: "100", XK: "412",
    TW: "158", QA: "634", CD: "180", PS: "275",
  };

  const numericCodes = new Set(
    regionCountries.map((iso) => isoToNumeric[iso]).filter(Boolean)
  );

  useEffect(() => {
    fetch("/geo/countries-110m.json")
      .then((res) => res.json())
      .then((topo) => {
        const features = topojson.feature(topo, topo.objects.countries) as any;
        setGeoData(features);
      });
  }, []);

  useEffect(() => {
    if (!geoData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const [lat1, lon1] = bounds.topLeft;
    const [lat2, lon2] = bounds.bottomRight;
    const centerLon = (lon1 + lon2) / 2;
    const centerLat = (lat1 + lat2) / 2;

    const projection = d3
      .geoMercator()
      .center([centerLon, centerLat])
      .fitSize([width, height], {
        type: "FeatureCollection",
        features: geoData.features.filter((f: any) =>
          numericCodes.has(f.id)
        ),
      });

    const pathGenerator = d3.geoPath().projection(projection);

    svg.selectAll("*").remove();
    const g = svg.append("g");

    g.selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", (d: any) => pathGenerator(d) || "")
      .attr("fill", (d: any) =>
        numericCodes.has(d.id) ? "#3B82F6" : "#1a2035"
      )
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 0.5)
      .attr("opacity", (d: any) => (numericCodes.has(d.id) ? 1 : 0.3));

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 6])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);
  }, [geoData, bounds, numericCodes]);

  return (
    <svg
      ref={svgRef}
      className="w-full h-full"
      style={{ background: "transparent" }}
    />
  );
}

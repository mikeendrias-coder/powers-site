import { getAllRegions, getRegion, getRegionAnalysis, getAllCountries, getAllAlliances, getAllConflicts, getLayerConfig, buildCountryLookup } from "@/lib/dataLoader";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

export function generateStaticParams() {
  const regions = getAllRegions();
  return regions.map((r) => ({ id: r.id }));
}

export default function RegionPage({ params }: { params: { id: string } }) {
  const region = getRegion(params.id);

  if (!region) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl font-bold text-white mb-2">Region not found</h1>
          <Link href="/" className="text-accent-blue hover:underline text-sm">
            Back to map
          </Link>
        </div>
      </div>
    );
  }

  const analysis = getRegionAnalysis(region);
  const countries = getAllCountries().filter((c) => region.countries.includes(c.isoCode));

  return (
    <div className="min-h-screen">
      {/* Region header */}
      <div className="relative h-[50vh] bg-bg-secondary flex items-end">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto w-full px-8 pb-12">
          <Link href="/" className="text-xs font-mono text-accent-blue hover:text-white transition-colors mb-4 inline-block">
            &larr; Back to world map
          </Link>
          <h1 className="font-display text-5xl font-bold text-white tracking-tight mb-3">
            {region.name}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            {region.countries.map((code) => (
              <span
                key={code}
                className="text-xs font-mono px-2 py-1 bg-white/5 border border-white/10 rounded text-slate-400"
              >
                {code}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar stats + Analysis */}
      <div className="max-w-4xl mx-auto px-8 py-16">
        {/* Conflict badges */}
        {region.conflicts.length > 0 && (
          <div className="mb-8 flex gap-2 flex-wrap">
            {region.conflicts.map((cId) => (
              <span
                key={cId}
                className="text-xs font-mono px-3 py-1 rounded-full bg-red-600/10 border border-red-600/20 text-red-400"
              >
                {cId}
              </span>
            ))}
          </div>
        )}

        {/* Countries in region */}
        {countries.length > 0 && (
          <div className="mb-12 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {countries.map((c) => (
              <div
                key={c.id}
                className="bg-bg-card border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors"
              >
                <div className="font-display font-semibold text-white text-sm mb-1">
                  {c.name}
                </div>
                <div className="text-xs font-body text-slate-400">
                  Tier {c.powerTier}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Markdown analysis */}
        <article className="prose prose-invert prose-slate max-w-none font-body
          prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
          prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
          prose-p:text-slate-300 prose-p:leading-relaxed
          prose-a:text-accent-blue prose-a:no-underline hover:prose-a:underline
          prose-strong:text-white
        ">
          <ReactMarkdown>{analysis}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

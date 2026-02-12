import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const contentDir = path.join(process.cwd(), "content");

export interface Country {
  id: string;
  name: string;
  isoCode: string;
  powerTier: number;
  alliances: string[];
  conflicts: string[];
  description: string;
}

export interface Alliance {
  id: string;
  name: string;
  members: string[];
  color: string;
  type: string;
  description: string;
}

export interface Conflict {
  id: string;
  name: string;
  parties: string[];
  supporters: Record<string, string[]>;
  status: string;
  region: string;
}

export interface Region {
  id: string;
  name: string;
  countries: string[];
  bounds: {
    topLeft: [number, number];
    bottomRight: [number, number];
  };
  conflicts: string[];
  analysis: string;
}

export interface LayerConfig {
  id: string;
  name: string;
  field: string;
  colorScale: Record<string, string>;
  legend: { label: string; color: string }[];
}

function readJsonDir<T>(subdir: string): T[] {
  const dir = path.join(dataDir, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8")));
}

function readJsonFile<T>(subdir: string, filename: string): T | null {
  const filePath = path.join(dataDir, subdir, `${filename}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export function getAllCountries(): Country[] {
  return readJsonDir<Country>("countries");
}

export function getCountry(id: string): Country | null {
  return readJsonFile<Country>("countries", id.toLowerCase());
}

export function getAllAlliances(): Alliance[] {
  return readJsonDir<Alliance>("alliances");
}

export function getAllConflicts(): Conflict[] {
  return readJsonDir<Conflict>("conflicts");
}

export function getAllRegions(): Region[] {
  return readJsonDir<Region>("regions");
}

export function getRegion(id: string): Region | null {
  return readJsonFile<Region>("regions", id);
}

export function getLayerConfig(id: string): LayerConfig | null {
  return readJsonFile<LayerConfig>("layers", id);
}

export function getRegionAnalysis(region: Region): string {
  const filePath = path.join(process.cwd(), region.analysis);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf-8");
}

// Build a lookup map from ISO 3166-1 numeric codes (used in TopoJSON) to our country data
// The world-atlas TopoJSON uses numeric codes as feature IDs
export function buildCountryLookup(countries: Country[]): Record<string, Country> {
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
  };

  const lookup: Record<string, Country> = {};
  for (const country of countries) {
    const numericCode = isoToNumeric[country.isoCode];
    if (numericCode) {
      lookup[numericCode] = country;
    }
  }
  return lookup;
}

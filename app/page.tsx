import WorldMap from "@/components/WorldMap";
import {
  getAllCountries,
  getAllAlliances,
  getAllConflicts,
  getLayerConfig,
  buildCountryLookup,
} from "@/lib/dataLoader";

export default function HomePage() {
  const countries = getAllCountries();
  const alliances = getAllAlliances();
  const conflicts = getAllConflicts();
  const powerTiersConfig = getLayerConfig("power-tiers");
  const countryLookup = buildCountryLookup(countries);

  if (!powerTiersConfig) {
    return <div className="text-white p-8">Missing layer config.</div>;
  }

  return (
    <WorldMap
      countries={countries}
      alliances={alliances}
      conflicts={conflicts}
      powerTiersConfig={powerTiersConfig}
      countryLookup={countryLookup}
    />
  );
}

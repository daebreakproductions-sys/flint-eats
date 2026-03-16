import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";

// All locations from the CSV with real addresses
const RAW_LOCATIONS = [
  { name: "Shop & Go Mini Mart", address: "1516 W Pierson Rd Flint, MI 48505", phone: "(810) 787-5561", type: "Convenience" },
  { name: "Dort Liquor Shop", address: "2817 S Dort Hwy Flint, MI 48507", phone: "(810) 744-3733", type: "Convenience" },
  { name: "Amiras Beer & Wine Inc", address: "3102 N Saginaw St Flint, MI 48505", phone: "", type: "Convenience" },
  { name: "D & R Market Inc", address: "1402 N Chevrolet Ave Flint, MI 48504", phone: "(810) 239-7921", type: "Convenience" },
  { name: "Hazim Party Store", address: "2310 S Saginaw Flint, MI 48503", phone: "(810) 235-8424", type: "Convenience" },
  { name: "South Side Community Store", address: "2355 Lapeer Rd Flint, MI 48503", phone: "810-232-3730", type: "Convenience" },
  { name: "Davison Road Market", address: "2319 Davison Rd Flint, MI 48506", phone: "(810) 341-1326", type: "Convenience" },
  { name: "The Local Grocer", address: "601 MLK Ave Flint, MI 48502", phone: "810-285-9900", type: "GroceryStore" },
  { name: "Landmark Food Center #2", address: "4644 Fenton Rd Flint, MI 48507", phone: "810-238-2972", type: "GroceryStore" },
  { name: "Quick Stop Petroleum Inc", address: "2315 N Dort Hwy Flint, MI 48506", phone: "(810) 239-4449", type: "Convenience" },
  { name: "Stanleys Market", address: "101 E Flint Park Blvd Flint, MI 48505", phone: "(810) 787-4113", type: "GroceryStore" },
  { name: "Kroger Store #404", address: "3288 Corunna Rd Flint, MI 48532", phone: "(810) 235-6435", type: "GroceryStore" },
  { name: "Meijer Inc #44", address: "2474 Hill Rd Flint, MI 48507", phone: "(810) 235-2700", type: "GroceryStore" },
  { name: "Rite Aid Disc Pharmacy #4442", address: "4515 Corunna Rd Flint, MI 48532", phone: "(810) 732-7011", type: "Pharmacy" },
  { name: "Rite Aid Discount Pharmacy #4948", address: "4007 S Saginaw St Burton, MI 48529", phone: "(810) 742-7002", type: "Pharmacy" },
  { name: "Calkins Point Market", address: "3458 Calkins Rd Flint, MI 48532", phone: "(810) 732-0301", type: "Convenience" },
  { name: "Randy's Food Center", address: "5272 Miller Rd Flint, MI 48507", phone: "(810) 732-2150", type: "GroceryStore" },
  { name: "Paradise Mini Mart", address: "3352 Flushing Rd Flint, MI 48504", phone: "(810) 230-0229", type: "Convenience" },
  { name: "Bernies Market Burton", address: "2185 E Bristol Rd Burton, MI 48529", phone: "(810) 744-1509", type: "GroceryStore" },
  { name: "Tony Rs 2 Market", address: "6010 N Saginaw St Mount Morris, MI 48458", phone: "(810) 787-4599", type: "GroceryStore" },
  { name: "Happy Boy Market", address: "3572 Flushing Rd Flint, MI 48504", phone: "(810) 732-5181", type: "Convenience" },
  { name: "E & J Food Market", address: "5217 N Saginaw St Flint, MI 48505", phone: "(810) 785-6559", type: "GroceryStore" },
  { name: "Starr Mart", address: "4226 Fenton Rd Flint, MI 48507", phone: "(810) 235-5211", type: "Convenience" },
  { name: "Hanibals Liquor Store", address: "5010 N Dort Hwy Flint, MI 48505", phone: "(810) 785-8035", type: "Convenience" },
  { name: "Admiral Petroleum Co #285", address: "3265 Miller Rd Flint, MI 48507", phone: "(810) 223-0235", type: "Convenience" },
  { name: "Reena LLC", address: "5520 N Genesee Rd Flint, MI 48506", phone: "810-736-3570", type: "Convenience" },
  { name: "Speedway #2222", address: "1001 S Center Burton, MI 48509", phone: "(810) 744-3890", type: "Convenience" },
  { name: "Dollar Express", address: "6444 N Saginaw St Mount Morris, MI 48458", phone: "(810) 687-6600", type: "Convenience" },
  { name: "Dollar General Store #14560", address: "5238 Lapeer Rd Burton, MI 48509", phone: "(810) 447-0875", type: "Convenience" },
  { name: "Dollar Tree Store #187", address: "3192 S Linden Rd Flint, MI 48507", phone: "810-732-3680", type: "Convenience" },
  { name: "D & G Dollar Store Inc", address: "3404 Flushing Rd Flint, MI 48504", phone: "(810) 733-2145", type: "Convenience" },
  { name: "B & G Mini Mart LLC", address: "4196 Corunna Rd Flint, MI 48532", phone: "(810) 733-3270", type: "Convenience" },
  { name: "Khirfans Blue Collar Market", address: "3405 Van Slyke Rd Flint, MI 48507", phone: "", type: "Convenience" },
  { name: "Bueches Food World Inc", address: "300 W Main Flushing, MI 48433", phone: "", type: "GroceryStore" },
  { name: "Wal-Mart Store #2693", address: "3700 Owen Rd Fenton, MI 48430", phone: "", type: "GroceryStore" },
  { name: "Kroger Store #413", address: "5249 Corunna Rd Flint, MI 48532", phone: "", type: "GroceryStore" },
  { name: "Rite Aid #4471", address: "1020 E Hill Road Grand Blanc, MI 48439", phone: "", type: "Pharmacy" },
  { name: "Rite Aid #4440", address: "9090 Miller Rd Swartz Creek, MI 48473", phone: "", type: "Pharmacy" },
  { name: "Walgreens #07065", address: "3270 W Silver Lake Road Fenton, MI 48430", phone: "", type: "Pharmacy" },
  { name: "Walgreens #4676", address: "5703 S Saginaw St Grand Blanc, MI 48439", phone: "", type: "Pharmacy" },
  { name: "Rite Aid Discount Pharmacy #4441", address: "11609 S Saginaw St Grand Blanc, MI 48439", phone: "", type: "Pharmacy" },
  { name: "Rite Aid Of Michigan #4333", address: "100 E Vienna Rd Clio, MI 48420", phone: "", type: "Pharmacy" },
  { name: "Rite Aid Of MI Inc #1729", address: "218 W Main St Flushing, MI 48433", phone: "", type: "Pharmacy" },
  { name: "Marathon", address: "1138 N Belsay Rd Burton, MI 48509", phone: "", type: "Convenience" },
  { name: "Speedway #2240", address: "1020 Irish Rd Davison, MI 48423", phone: "", type: "Convenience" },
  { name: "Dollar Tree #5035", address: "7200 N Saginaw Rd Mount Morris, MI 48458", phone: "", type: "Convenience" },
  { name: "Dollar General Store #10758", address: "6092 Pierson Rd Flushing, MI 48433", phone: "", type: "Convenience" },
  { name: "Dollar Tree Store #3147", address: "638 N State Rd Davison, MI 48423", phone: "", type: "Convenience" },
  { name: "Family Dollar #7041", address: "8443 Davison Rd Davison, MI 48423", phone: "", type: "Convenience" },
  { name: "Dollar General Store #9635", address: "2187 W Vienna Rd Clio, MI 48420", phone: "", type: "Convenience" },
  { name: "Kims Supermarket", address: "11921 Lennon Rd Lennon, MI 48449", phone: "", type: "GroceryStore" },
  { name: "Golden Spot Liquor", address: "1909 E Court St Flint, MI 48503", phone: "810-239-5860", type: "Convenience" },
  { name: "Quik Pick Party Store", address: "1742 W Court St Flint, MI 48503", phone: "(810) 238-3846", type: "Convenience" },
  { name: "MLK Market", address: "1143 Martin Luther King Ave Flint, MI 48503", phone: "(810) 239-7831", type: "GroceryStore" },
  { name: "A & G Market Inc", address: "2012 W Dartmouth Flint, MI 48504", phone: "(810) 232-0226", type: "Convenience" },
  { name: "Downtown Food Shop", address: "615 Harrison St Flint, MI 48502", phone: "(810) 232-5520", type: "GroceryStore" },
  { name: "Wal-Mart Supercenter #2273", address: "5323 E Court St Burton, MI 48509", phone: "(810) 744-9690", type: "GroceryStore" },
  { name: "Kroger Store #406", address: "1200 E Bristol Rd Burton, MI 48529", phone: "(810) 234-6863", type: "GroceryStore" },
  { name: "Meijer Inc #29", address: "2333 S Center Rd Burton, MI 48519", phone: "(810) 744-4000", type: "GroceryStore" },
  { name: "Rite Aid Pharmacy #4340", address: "4033 Fenton Road Burton, MI 48529", phone: "(810) 239-4614", type: "Pharmacy" },
  { name: "Diplomat Pharmacy", address: "3320 Beecher Rd Flint, MI 48532", phone: "(810) 732-7357", type: "Pharmacy" },
  { name: "Quick Pick Party Store III", address: "3169 W Pasadena Flint, MI 48504", phone: "(810) 877-6062", type: "Convenience" },
  { name: "Mobil 1-Stop Food Store #29", address: "4107 Corunna Rd Flint, MI 48532", phone: "(810) 733-1279", type: "Convenience" },
  { name: "Speedway #8752", address: "5252 W Miller Rd Flint, MI 48507", phone: "(810) 732-8071", type: "Convenience" },
  { name: "Dollar General Store #9686", address: "5404 N Genesee Rd Flint, MI 48506", phone: "(810) 736-1315", type: "Convenience" },
  { name: "Family Dollar #3608", address: "3426 Flushing Rd Flint, MI 48504", phone: "(810) 732-1492", type: "Convenience" },
  { name: "Dollar General Store #8084", address: "5033 Fenton Rd Flint, MI 48507", phone: "(810) 424-5866", type: "Convenience" },
  { name: "Aldi #55", address: "1054 Center Rd Burton, MI 48509", phone: "", type: "GroceryStore" },
  { name: "Wal-Mart Store #4243", address: "11493 N Linden Rd Clio, MI 48420", phone: "", type: "GroceryStore" },
  { name: "Kroger Store #714", address: "700 N State St Davison, MI 48423", phone: "", type: "GroceryStore" },
  { name: "Kroger Store #711", address: "7084 Miller Rd Swartz Creek, MI 48473", phone: "", type: "GroceryStore" },
  { name: "Meijer Inc #244", address: "8089 Lapeer Rd Davison, MI 48423", phone: "", type: "GroceryStore" },
  { name: "Rite Aid #4443", address: "1565 Pierson Rd Flushing, MI 48433", phone: "", type: "Pharmacy" },
  { name: "Rite Aid Pharmacy #4956", address: "5370 E Hill Rd Grand Blanc, MI 48439", phone: "", type: "Pharmacy" },
  { name: "Rite Aid Discount Pharmacy #4408", address: "1001 N Leroy Fenton, MI 48430", phone: "", type: "Pharmacy" },
  { name: "Mi Pueblo Inc", address: "540 S Mill St Clio, MI 48420", phone: "", type: "GroceryStore" },
  { name: "Dennys Supermarket", address: "410 N State St Otisville, MI 48463", phone: "", type: "GroceryStore" },
  { name: "V & B Market", address: "5011 E Mt Morris Rd Mount Morris, MI 48458", phone: "", type: "GroceryStore" },
  { name: "Jimys Liquor", address: "5425 S Dort Hwy Flint, MI 48507", phone: "", type: "Convenience" },
  { name: "Luea Pharmacy Inc", address: "8021 Miller Rd Swartz Creek, MI 48473", phone: "", type: "Pharmacy" },
];

const BATCH_SIZE = 15;

export default function GeocodingTool() {
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState({ done: 0, total: RAW_LOCATIONS.length, saved: 0, failed: 0 });
  const [log, setLog] = useState([]);

  const addLog = (msg) => setLog(prev => [...prev, msg]);

  const geocodeBatch = async (batch) => {
    const addressList = batch.map((loc, i) => `${i + 1}. "${loc.address}"`).join("\n");
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Geocode these addresses to lat/lng coordinates. Return ONLY a JSON array with objects {index, lat, lng} for each address. Use accurate coordinates for each specific street address. If an address is invalid or ungeocodeable, use null for lat and lng.\n\nAddresses:\n${addressList}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          results: {
            type: "array",
            items: {
              type: "object",
              properties: {
                index: { type: "number" },
                lat: { type: "number" },
                lng: { type: "number" }
              }
            }
          }
        }
      }
    });
    return result.results || [];
  };

  const run = async () => {
    setStatus("running");
    setLog([]);
    let saved = 0, failed = 0, done = 0;

    for (let i = 0; i < RAW_LOCATIONS.length; i += BATCH_SIZE) {
      const batch = RAW_LOCATIONS.slice(i, i + BATCH_SIZE);
      addLog(`Geocoding batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} locations)...`);

      const coords = await geocodeBatch(batch);

      for (const loc of batch) {
        const batchIdx = batch.indexOf(loc) + 1;
        const coord = coords.find(c => c.index === batchIdx);
        done++;

        if (coord && coord.lat && coord.lng) {
          await base44.entities.FoodResource.create({
            name: loc.name,
            address: loc.address,
            phone: loc.phone || undefined,
            type: loc.type,
            lat: coord.lat,
            lng: coord.lng,
            is_active: true,
            ebt_accepted: false,
            dufb_offered: false,
            wic_accepted: false,
          });
          saved++;
          addLog(`✓ ${loc.name}`);
        } else {
          failed++;
          addLog(`✗ Could not geocode: ${loc.name}`);
        }
        setProgress({ done, total: RAW_LOCATIONS.length, saved, failed });
      }
    }

    setStatus("done");
    addLog(`\nComplete: ${saved} saved, ${failed} failed.`);
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-2">Geocoding Import Tool</h1>
      <p className="text-gray-500 mb-6">Geocodes {RAW_LOCATIONS.length} locations and saves them to the database.</p>

      {status === "idle" && (
        <Button onClick={run} className="bg-green-700 hover:bg-green-800 text-white">
          Start Import
        </Button>
      )}

      {status === "running" && (
        <div className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-5 h-5 border-2 border-green-200 border-t-green-700 rounded-full animate-spin" />
            <span className="text-sm font-medium">{progress.done} / {progress.total} processed — {progress.saved} saved, {progress.failed} failed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full transition-all"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 font-semibold">
          Done! {progress.saved} locations added, {progress.failed} could not be geocoded.
        </div>
      )}

      {log.length > 0 && (
        <div className="mt-4 bg-gray-900 text-gray-100 rounded-lg p-4 text-xs font-mono h-72 overflow-y-auto">
          {log.map((line, i) => <div key={i}>{line}</div>)}
        </div>
      )}
    </div>
  );
}
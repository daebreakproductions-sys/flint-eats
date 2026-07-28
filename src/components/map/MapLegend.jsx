export const TYPE_CONFIG = {
  FoodPantry:     { color: "#f97316", emoji: "🥫", label: "Food Pantry" },
  GroceryStore:   { color: "#2563eb", emoji: "🛒", label: "Grocery Store" },
  FarmersMarket:  { color: "#16a34a", emoji: "🍎", label: "Farmers Market" },
  SeniorMealSite: { color: "#db2777", emoji: "🍴", label: "Senior Meal Site" },
  Pharmacy:       { color: "#0891b2", emoji: "💊", label: "Pharmacy" },
  GasStation:     { color: "#ea580c", emoji: "⛽", label: "Gas Station" },
  Convenience:    { color: "#ca8a04", emoji: "🏪", label: "Convenience Store" },
  Other:          { color: "#6b7280", emoji: "📍", label: "Other" },
};

export default function MapLegend() {
  return (
    <div className="p-3 text-xs">
      <div className="grid grid-cols-2 gap-1">
        {Object.entries(TYPE_CONFIG).map(([type, { emoji, label }]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className="text-base leading-none">{emoji}</span>
            <span className="text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
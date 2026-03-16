import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

// Recipe Fields
export function RecipeFields({ extra, setExtra }) {
  const ingredients = extra.ingredients || [""];
  const steps = extra.steps || [""];

  const updateList = (key, idx, val) => {
    const arr = [...(extra[key] || [])];
    arr[idx] = val;
    setExtra(e => ({ ...e, [key]: arr }));
  };
  const addItem = (key) => setExtra(e => ({ ...e, [key]: [...(e[key] || []), ""] }));
  const removeItem = (key, idx) => setExtra(e => ({ ...e, [key]: (e[key] || []).filter((_, i) => i !== idx) }));

  return (
    <div className="space-y-3 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-gray-500">Prep Time</Label>
          <Input value={extra.prep_time || ""} onChange={e => setExtra(x => ({ ...x, prep_time: e.target.value }))} placeholder="e.g. 15 min" className="h-8 text-xs" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Cook Time</Label>
          <Input value={extra.cook_time || ""} onChange={e => setExtra(x => ({ ...x, cook_time: e.target.value }))} placeholder="e.g. 30 min" className="h-8 text-xs" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Servings</Label>
          <Input value={extra.servings || ""} onChange={e => setExtra(x => ({ ...x, servings: e.target.value }))} placeholder="e.g. 4" className="h-8 text-xs" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Budget</Label>
          <Input value={extra.budget || ""} onChange={e => setExtra(x => ({ ...x, budget: e.target.value }))} placeholder="e.g. Under $10" className="h-8 text-xs" />
        </div>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-1 block">Ingredients</Label>
        {ingredients.map((ing, i) => (
          <div key={i} className="flex gap-1.5 mb-1">
            <Input value={ing} onChange={e => updateList("ingredients", i, e.target.value)} placeholder={`Ingredient ${i + 1}`} className="h-8 text-xs" />
            {ingredients.length > 1 && <button onClick={() => removeItem("ingredients", i)} className="text-gray-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>}
          </div>
        ))}
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-green-700 px-2" onClick={() => addItem("ingredients")}>
          <Plus className="w-3 h-3 mr-1" /> Add ingredient
        </Button>
      </div>

      <div>
        <Label className="text-xs text-gray-500 mb-1 block">Steps</Label>
        {steps.map((step, i) => (
          <div key={i} className="flex gap-1.5 mb-1 items-start">
            <span className="text-xs text-gray-400 mt-2 w-4 shrink-0">{i + 1}.</span>
            <Input value={step} onChange={e => updateList("steps", i, e.target.value)} placeholder={`Step ${i + 1}`} className="h-8 text-xs" />
            {steps.length > 1 && <button onClick={() => removeItem("steps", i)} className="text-gray-400 hover:text-red-500 mt-2"><X className="w-3.5 h-3.5" /></button>}
          </div>
        ))}
        <Button type="button" variant="ghost" size="sm" className="h-7 text-xs text-green-700 px-2" onClick={() => addItem("steps")}>
          <Plus className="w-3 h-3 mr-1" /> Add step
        </Button>
      </div>
    </div>
  );
}

// Event Fields
export function EventFields({ extra, setExtra }) {
  return (
    <div className="grid grid-cols-2 gap-2 mt-2">
      <div>
        <Label className="text-xs text-gray-500">Event Date</Label>
        <Input type="date" value={extra.event_date || ""} onChange={e => setExtra(x => ({ ...x, event_date: e.target.value }))} className="h-8 text-xs" />
      </div>
      <div>
        <Label className="text-xs text-gray-500">Time</Label>
        <Input type="time" value={extra.event_time || ""} onChange={e => setExtra(x => ({ ...x, event_time: e.target.value }))} className="h-8 text-xs" />
      </div>
      <div className="col-span-2">
        <Label className="text-xs text-gray-500">Location</Label>
        <Input value={extra.location || ""} onChange={e => setExtra(x => ({ ...x, location: e.target.value }))} placeholder="Address or venue name" className="h-8 text-xs" />
      </div>
      <div className="col-span-2">
        <Label className="text-xs text-gray-500">RSVP / Link (optional)</Label>
        <Input value={extra.rsvp_url || ""} onChange={e => setExtra(x => ({ ...x, rsvp_url: e.target.value }))} placeholder="https://..." className="h-8 text-xs" />
      </div>
    </div>
  );
}

// Resource Tip Fields
export function ResourceTipFields({ extra, setExtra }) {
  return (
    <div className="space-y-2 mt-2">
      <div>
        <Label className="text-xs text-gray-500">Resource Name</Label>
        <Input value={extra.resource_name || ""} onChange={e => setExtra(x => ({ ...x, resource_name: e.target.value }))} placeholder="e.g. Flint Food Bank" className="h-8 text-xs" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-gray-500">Hours</Label>
          <Input value={extra.hours || ""} onChange={e => setExtra(x => ({ ...x, hours: e.target.value }))} placeholder="e.g. Mon–Fri 9am–5pm" className="h-8 text-xs" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Phone</Label>
          <Input value={extra.phone || ""} onChange={e => setExtra(x => ({ ...x, phone: e.target.value }))} placeholder="(810) 000-0000" className="h-8 text-xs" />
        </div>
      </div>
      <div>
        <Label className="text-xs text-gray-500">Website / Address</Label>
        <Input value={extra.url || ""} onChange={e => setExtra(x => ({ ...x, url: e.target.value }))} placeholder="Website or address" className="h-8 text-xs" />
      </div>
    </div>
  );
}

// Question Fields
export function QuestionFields({ extra, setExtra }) {
  return (
    <div className="space-y-2 mt-2">
      <div>
        <Label className="text-xs text-gray-500">Topic / Tag</Label>
        <Input value={extra.topic || ""} onChange={e => setExtra(x => ({ ...x, topic: e.target.value }))} placeholder="e.g. SNAP, Farmers Market, WIC…" className="h-8 text-xs" />
      </div>
    </div>
  );
}

// Success Story Fields
export function SuccessStoryFields({ extra, setExtra }) {
  return (
    <div className="space-y-2 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-gray-500">Program / Resource Used</Label>
          <Input value={extra.program || ""} onChange={e => setExtra(x => ({ ...x, program: e.target.value }))} placeholder="e.g. Double Up Bucks" className="h-8 text-xs" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Outcome (optional)</Label>
          <Input value={extra.outcome || ""} onChange={e => setExtra(x => ({ ...x, outcome: e.target.value }))} placeholder="e.g. Saved $40/week" className="h-8 text-xs" />
        </div>
      </div>
    </div>
  );
}

// Community News Fields
export function CommunityNewsFields({ extra, setExtra }) {
  return (
    <div className="space-y-2 mt-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs text-gray-500">Source / Organization</Label>
          <Input value={extra.source || ""} onChange={e => setExtra(x => ({ ...x, source: e.target.value }))} placeholder="e.g. City of Flint" className="h-8 text-xs" />
        </div>
        <div>
          <Label className="text-xs text-gray-500">Link (optional)</Label>
          <Input value={extra.link || ""} onChange={e => setExtra(x => ({ ...x, link: e.target.value }))} placeholder="https://..." className="h-8 text-xs" />
        </div>
      </div>
    </div>
  );
}
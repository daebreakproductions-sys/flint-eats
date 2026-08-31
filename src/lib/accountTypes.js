export const ACCOUNT_TYPES = [
  { value: "resident", label: "Resident", desc: "I'm looking for food resources near me", icon: "🏠" },
  { value: "volunteer", label: "Volunteer", desc: "I want to help support my community", icon: "🤝" },
  { value: "farmer", label: "Farmer / Producer", desc: "I grow or produce food locally", icon: "🌾" },
  { value: "service_provider", label: "Service Provider", desc: "We provide food resources or services", icon: "🏛️" },
  { value: "explorer", label: "Just Exploring", desc: "I'm curious about what Flint Eats offers", icon: "👀" },
];

const MAP = Object.fromEntries(ACCOUNT_TYPES.map(t => [t.value, t]));

export function getAccountType(value) {
  return MAP[value] || MAP.explorer;
}
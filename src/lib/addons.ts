// Addon catalog for the check-in flow.

export type AddonCategory = "food" | "baggage" | "comfort" | "digital";

export interface Addon {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: AddonCategory;
  icon: string; // emoji
}

export const ADDONS: Addon[] = [
  // Food
  {
    id: "meal-veg",
    name: "Vegetarian meal",
    description: "Fresh veggie wrap, fruit cup, and sparkling water.",
    price: 12,
    currency: "USD",
    category: "food",
    icon: "🥗",
  },
  {
    id: "meal-nonveg",
    name: "Chicken meal",
    description: "Grilled chicken with rice and steamed vegetables.",
    price: 15,
    currency: "USD",
    category: "food",
    icon: "🍗",
  },
  {
    id: "meal-vegan",
    name: "Vegan bowl",
    description: "Quinoa, chickpeas, roasted vegetables, tahini dressing.",
    price: 14,
    currency: "USD",
    category: "food",
    icon: "🌱",
  },
  {
    id: "meal-kids",
    name: "Kids meal",
    description: "Mac & cheese, apple slices, and a small juice box.",
    price: 10,
    currency: "USD",
    category: "food",
    icon: "🧒",
  },
  // Baggage
  {
    id: "bag-extra",
    name: "Extra checked bag",
    description: "Add one more checked bag up to 23 kg.",
    price: 50,
    currency: "USD",
    category: "baggage",
    icon: "🧳",
  },
  {
    id: "bag-carryon-upgrade",
    name: "Carry-on upgrade",
    description: "Bring a larger carry-on (cabin-size trolley).",
    price: 25,
    currency: "USD",
    category: "baggage",
    icon: "🎒",
  },
  // Comfort
  {
    id: "comfort-blanket",
    name: "Blanket + pillow",
    description: "Cozy blanket and neck pillow for long-haul comfort.",
    price: 8,
    currency: "USD",
    category: "comfort",
    icon: "🛏️",
  },
  {
    id: "comfort-headphones",
    name: "Premium headphones",
    description: "Noise-cancelling headphones for the flight.",
    price: 5,
    currency: "USD",
    category: "comfort",
    icon: "🎧",
  },
  // Digital
  {
    id: "digital-wifi",
    name: "In-flight Wi-Fi",
    description: "Unlimited Wi-Fi for the entire flight.",
    price: 20,
    currency: "USD",
    category: "digital",
    icon: "📶",
  },
  {
    id: "digital-entertainment",
    name: "Premium entertainment",
    description: "Access to premium movies, TV shows, and games.",
    price: 10,
    currency: "USD",
    category: "digital",
    icon: "🎬",
  },
];

export const ADDON_CATEGORIES: { key: AddonCategory; label: string; icon: string }[] = [
  { key: "food", label: "Food & meals", icon: "🍽️" },
  { key: "baggage", label: "Baggage", icon: "🧳" },
  { key: "comfort", label: "Comfort", icon: "🛏️" },
  { key: "digital", label: "Digital", icon: "📶" },
];

export function findAddon(id: string): Addon | undefined {
  return ADDONS.find((a) => a.id === id);
}

export function addonsTotal(addonIds: string[]): number {
  return addonIds
    .map((id) => findAddon(id)?.price ?? 0)
    .reduce((sum, p) => sum + p, 0);
}

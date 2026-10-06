/** Catégories d'aliments (slug stocké en base → libellé affiché), dans l'ordre d'affichage. */
export const FOOD_CATEGORIES = [
  { value: "viandes", label: "Viandes & volailles" },
  { value: "poissons", label: "Poissons & fruits de mer" },
  { value: "oeufs", label: "Œufs" },
  { value: "laitiers", label: "Produits laitiers" },
  { value: "feculents", label: "Féculents & céréales" },
  { value: "legumineuses", label: "Légumineuses & soja" },
  { value: "legumes", label: "Légumes" },
  { value: "fruits", label: "Fruits" },
  { value: "oleagineux", label: "Oléagineux & graines" },
  { value: "matieres_grasses", label: "Matières grasses" },
  { value: "complements", label: "Compléments sportifs" },
  { value: "autres", label: "Épicerie & divers" },
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number]["value"];

export const FOOD_CATEGORY_VALUES = FOOD_CATEGORIES.map((category) => category.value) as [
  FoodCategory,
  ...FoodCategory[],
];

export function categoryLabel(category: string): string {
  return FOOD_CATEGORIES.find((item) => item.value === category)?.label ?? "Autres";
}

export function categoryOrder(category: string): number {
  const index = FOOD_CATEGORIES.findIndex((item) => item.value === category);
  return index === -1 ? FOOD_CATEGORIES.length : index;
}

/** Aliment tel qu'utilisé dans l'interface (valeurs pour 100 g). */
export type Food = {
  id: string;
  name: string;
  category: FoodCategory;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  isCustom: boolean;
};

/** Normalise un texte pour la recherche (sans accents ni majuscules). */
export function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/œ/g, "oe")
    .toLowerCase()
    .trim();
}

export function matchesSearch(name: string, query: string): boolean {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return true;
  const normalizedName = normalizeSearch(name);
  return normalizedQuery.split(/\s+/).every((word) => normalizedName.includes(word));
}

/**
 * Catálogo da TuManera.
 *
 * Preços: tabela oficial v5 (data/tabela-precos-v5.csv -> src/data/tabela-precos.json,
 * gerada por `npm run precos`). Cada preço é por peça, por faixa de quantidade e tamanho da arte,
 * e já inclui UMA estampa daquele tamanho.
 *
 * Grade de tamanhos e cores: informadas pelo Emerson em 09/11/2026.
 * Áreas de estampa e tamanhos máximos por área: sugestão inicial, a confirmar com a produção.
 */
import tabela from "@/data/tabela-precos.json";

export type ProductKind = "camiseta" | "moletom" | "corta-vento" | "ecobag" | "bone";

/** Tamanhos de arte da tabela. "sem" = peça sem estampa. */
export type ArtSize = "a6" | "a5" | "a4" | "a3" | "a2";
export type PriceKey = "sem" | ArtSize;

export const ART_SIZES: ArtSize[] = ["a6", "a5", "a4", "a3", "a2"];

export const ART_SIZE_INFO: Record<ArtSize, { label: string; widthCm: number; heightCm: number }> = {
  a6: { label: "A6", widthCm: 10.5, heightCm: 14.8 },
  a5: { label: "A5", widthCm: 14.8, heightCm: 21 },
  a4: { label: "A4", widthCm: 21, heightCm: 29.7 },
  a3: { label: "A3", widthCm: 29.7, heightCm: 42 },
  a2: { label: "A2", widthCm: 42, heightCm: 59.4 },
};

export interface PrintArea {
  id: string;
  label: string;
  sizes: ArtSize[];
  /** Centro da área no mockup, em % da largura/altura. */
  x: number;
  y: number;
  side: "frente" | "costas";
}

export interface Tier {
  label: string;
  min: number;
  max: number | null;
}

export interface Model {
  slug: string;
  name: string;
  category: string;
  line: string;
  composition: string;
  tiers: Tier[];
  /** Preço por peça em centavos, indexado como `tiers`. */
  prices: Record<PriceKey, number[]>;
}

export interface Category {
  slug: string;
  /** Nome exatamente como na coluna `categoria` da tabela. */
  name: string;
  kind: ProductKind;
  tagline: string;
  sizes: string[];
  colors: Color[];
  printAreas: PrintArea[];
  models: Model[];
}

export interface Color {
  id: string;
  label: string;
  hex: string;
}

export const COLORS: Color[] = [
  { id: "preto", label: "Preto", hex: "#1d1d1f" },
  { id: "branco", label: "Branco", hex: "#f5f5f7" },
  { id: "offwhite", label: "OffWhite", hex: "#ece6d8" },
  { id: "chumbo", label: "Chumbo", hex: "#4a4a4f" },
  { id: "azul-marinho", label: "Azul Marinho", hex: "#1f2a44" },
  { id: "verde-militar", label: "Verde Militar", hex: "#4b5320" },
  { id: "marrom", label: "Marrom", hex: "#5b3a29" },
  { id: "bege", label: "Bege", hex: "#d8c7a8" },
  { id: "bordo", label: "Bordô", hex: "#6d1a2a" },
  { id: "roxo", label: "Roxo", hex: "#5b2c83" },
];

export const SIZE_GRID = ["PP", "P", "M", "G", "GG", "XG", "XGG", "G2", "G3"];

/** Escala do mockup: % da largura do desenho por cm de estampa. */
export const MOCKUP_PCT_PER_CM: Record<ProductKind, number> = {
  camiseta: 0.92,
  moletom: 0.93,
  "corta-vento": 0.93,
  ecobag: 1.66,
  bone: 1.2,
};

const TOP_AREAS: PrintArea[] = [
  { id: "peito", label: "Peito", sizes: ["a6", "a5"], x: 62, y: 34, side: "frente" },
  { id: "frente", label: "Frente inteira", sizes: ["a4", "a3"], x: 50, y: 52, side: "frente" },
  { id: "costas", label: "Costas", sizes: ["a4", "a3", "a2"], x: 50, y: 50, side: "costas" },
  { id: "manga", label: "Manga", sizes: ["a6"], x: 16, y: 30, side: "frente" },
];

const without = (areas: PrintArea[], ...ids: string[]) => areas.filter((a) => !ids.includes(a.id));
const capSizes = (areas: PrintArea[], max: ArtSize) =>
  areas.map((a) => ({ ...a, sizes: a.sizes.filter((s) => ART_SIZES.indexOf(s) <= ART_SIZES.indexOf(max)) }));

const CATEGORY_DEFS: Omit<Category, "models">[] = [
  {
    slug: "camisetas-regulares",
    name: "Camisetas Regulares",
    kind: "camiseta",
    tagline: "O clássico, do seu jeito.",
    sizes: SIZE_GRID,
    colors: COLORS,
    printAreas: TOP_AREAS,
  },
  {
    slug: "camisetas-oversized",
    name: "Camisetas Oversized",
    kind: "camiseta",
    tagline: "Caimento amplo, presença forte.",
    sizes: SIZE_GRID,
    colors: COLORS,
    printAreas: TOP_AREAS,
  },
  {
    slug: "polos",
    name: "Polos",
    kind: "camiseta",
    tagline: "Elegância para a sua equipe.",
    sizes: SIZE_GRID,
    colors: COLORS,
    printAreas: without(TOP_AREAS, "frente"),
  },
  {
    slug: "sport-uv",
    name: "Sport UV+",
    kind: "camiseta",
    tagline: "Proteção UV para treinar e competir.",
    sizes: SIZE_GRID,
    colors: COLORS,
    printAreas: TOP_AREAS,
  },
  {
    slug: "babylook",
    name: "Babylook",
    kind: "camiseta",
    tagline: "Modelagem feminina, acinturada.",
    sizes: SIZE_GRID,
    colors: COLORS,
    printAreas: capSizes(TOP_AREAS, "a3"),
  },
  {
    slug: "infantil",
    name: "Infantil",
    kind: "camiseta",
    tagline: "Para os pequenos com estilo.",
    sizes: SIZE_GRID,
    colors: COLORS,
    printAreas: capSizes(TOP_AREAS, "a4"),
  },
  {
    slug: "regatas",
    name: "Regatas",
    kind: "camiseta",
    tagline: "Leve para os dias quentes.",
    sizes: SIZE_GRID,
    colors: COLORS,
    printAreas: without(TOP_AREAS, "manga"),
  },
  {
    slug: "moletons",
    name: "Moletons",
    kind: "moletom",
    tagline: "Conforto com identidade.",
    sizes: SIZE_GRID,
    colors: COLORS,
    printAreas: [
      { id: "peito", label: "Peito", sizes: ["a6", "a5"], x: 62, y: 38, side: "frente" },
      { id: "frente", label: "Frente inteira", sizes: ["a4", "a3"], x: 50, y: 46, side: "frente" },
      { id: "costas", label: "Costas", sizes: ["a4", "a3", "a2"], x: 50, y: 48, side: "costas" },
      { id: "manga", label: "Manga", sizes: ["a6"], x: 14, y: 40, side: "frente" },
    ],
  },
  {
    slug: "corta-vento",
    name: "Corta Vento",
    kind: "corta-vento",
    tagline: "Leve, para qualquer tempo.",
    sizes: SIZE_GRID,
    colors: COLORS,
    printAreas: [
      { id: "peito", label: "Peito", sizes: ["a6"], x: 64, y: 36, side: "frente" },
      { id: "costas", label: "Costas", sizes: ["a4", "a3", "a2"], x: 50, y: 46, side: "costas" },
    ],
  },
  {
    slug: "ecobags",
    name: "Acessórios",
    kind: "ecobag",
    tagline: "Sua marca em todo lugar.",
    sizes: ["Único"],
    colors: [{ id: "cru", label: "Cru", hex: "#ece3d0" }],
    printAreas: [
      { id: "frente", label: "Frente", sizes: ["a6", "a5", "a4"], x: 50, y: 62, side: "frente" },
      { id: "verso", label: "Verso", sizes: ["a6", "a5", "a4"], x: 50, y: 62, side: "costas" },
    ],
  },
];

const MODELS = tabela as Model[];

export const CATEGORIES: Category[] = CATEGORY_DEFS.map((c) => ({
  ...c,
  // "Acessórios" hoje só tem a ecobag; o nome público da categoria é "Ecobags".
  name: c.slug === "ecobags" ? "Ecobags" : c.name,
  models: MODELS.filter((m) => m.category === c.name),
})).filter((c) => c.models.length > 0);

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

export function findModel(slug: string): { category: Category; model: Model } | undefined {
  for (const category of CATEGORIES) {
    const model = category.models.find((m) => m.slug === slug);
    if (model) return { category, model };
  }
  return undefined;
}

/** Menor preço por peça sem estampa do modelo (maior faixa). */
export function fromPriceCents(model: Model): number {
  return Math.min(...model.prices.sem);
}

/** Menor preço da categoria, sem estampa. */
export function categoryFromPriceCents(c: Category): number {
  return Math.min(...c.models.map(fromPriceCents));
}

/**
 * DTF por metro: não está na tabela v5. Valores de EXEMPLO até a TuManera informar o preço real.
 */
export const DTF_ROLL_WIDTH_CM = 58;
export const DTF_PRICE_PER_METER_CENTS = 6900;

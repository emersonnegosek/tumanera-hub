/**
 * Catálogo base da TuManera (Fase 0: dados estáticos).
 * Na Fase 1 estes dados passam a vir do banco (tabelas products / print_areas / product_variants).
 *
 * ATENÇÃO: todos os preços são valores de exemplo para o protótipo.
 * Substituir pela tabela real da TuManera antes de vender.
 */

export type ProductKind = "camiseta" | "moletom" | "corta-vento" | "ecobag" | "bone";

export type PrintSize = "escudo" | "a4" | "a3";

export interface PrintArea {
  id: string;
  label: string;
  /** Tamanhos de estampa permitidos nesta área. */
  sizes: PrintSize[];
  /** Posição do centro da área no mockup, em % (0–100) da largura/altura. */
  x: number;
  y: number;
  /** Lado do mockup em que a área aparece. */
  side: "frente" | "costas";
}

export interface Product {
  slug: string;
  kind: ProductKind;
  name: string;
  tagline: string;
  description: string;
  /** Preço da peça lisa, em centavos (exemplo). */
  basePriceCents: number;
  colors: { id: string; label: string; hex: string }[];
  sizes: string[];
  printAreas: PrintArea[];
}

export const PRINT_SIZE_LABEL: Record<PrintSize, string> = {
  escudo: "Escudo (até 10 × 10 cm)",
  a4: "A4 (até 21 × 30 cm)",
  a3: "A3 (até 30 × 42 cm)",
};

/** Preço por estampa DTF aplicada, em centavos (exemplo). */
export const PRINT_PRICE_CENTS: Record<PrintSize, number> = {
  escudo: 900,
  a4: 1900,
  a3: 2900,
};

const BASIC_COLORS = [
  { id: "branco", label: "Branco", hex: "#f5f5f7" },
  { id: "preto", label: "Preto", hex: "#1d1d1f" },
  { id: "areia", label: "Areia", hex: "#d8cbb3" },
  { id: "azul-marinho", label: "Azul-marinho", hex: "#1f2a44" },
];

const APPAREL_SIZES = ["P", "M", "G", "GG", "XG"];

export const PRODUCTS: Product[] = [
  {
    slug: "camiseta",
    kind: "camiseta",
    name: "Camiseta",
    tagline: "O clássico, do seu jeito.",
    description: "Algodão penteado, caimento reto. Ideal para eventos, equipes e marcas.",
    basePriceCents: 3900,
    colors: BASIC_COLORS,
    sizes: APPAREL_SIZES,
    printAreas: [
      { id: "peito", label: "Peito (escudo)", sizes: ["escudo"], x: 62, y: 34, side: "frente" },
      { id: "frente", label: "Frente inteira", sizes: ["a4", "a3"], x: 50, y: 50, side: "frente" },
      { id: "costas", label: "Costas", sizes: ["a4", "a3"], x: 50, y: 45, side: "costas" },
      { id: "manga", label: "Manga", sizes: ["escudo"], x: 16, y: 30, side: "frente" },
    ],
  },
  {
    slug: "moletom",
    kind: "moletom",
    name: "Moletom",
    tagline: "Conforto com identidade.",
    description: "Moletom flanelado com capuz e bolso canguru.",
    basePriceCents: 11900,
    colors: BASIC_COLORS,
    sizes: APPAREL_SIZES,
    printAreas: [
      { id: "peito", label: "Peito (escudo)", sizes: ["escudo"], x: 62, y: 38, side: "frente" },
      { id: "frente", label: "Frente inteira", sizes: ["a4"], x: 50, y: 46, side: "frente" },
      { id: "costas", label: "Costas", sizes: ["a4", "a3"], x: 50, y: 48, side: "costas" },
      { id: "manga", label: "Manga", sizes: ["escudo"], x: 14, y: 40, side: "frente" },
    ],
  },
  {
    slug: "corta-vento",
    kind: "corta-vento",
    name: "Corta-vento",
    tagline: "Leve, para qualquer tempo.",
    description: "Tecido tactel com forro, zíper frontal e capuz.",
    basePriceCents: 14900,
    colors: BASIC_COLORS.filter((c) => c.id !== "areia"),
    sizes: APPAREL_SIZES,
    printAreas: [
      { id: "peito", label: "Peito (escudo)", sizes: ["escudo"], x: 64, y: 36, side: "frente" },
      { id: "costas", label: "Costas", sizes: ["a4", "a3"], x: 50, y: 46, side: "costas" },
    ],
  },
  {
    slug: "ecobag",
    kind: "ecobag",
    name: "Ecobag",
    tagline: "Sua marca em todo lugar.",
    description: "Algodão cru 100%, alças longas.",
    basePriceCents: 2400,
    colors: [
      { id: "cru", label: "Cru", hex: "#ece3d0" },
      { id: "preto", label: "Preto", hex: "#1d1d1f" },
    ],
    sizes: ["Único"],
    printAreas: [
      { id: "frente", label: "Frente", sizes: ["a4", "a3"], x: 50, y: 60, side: "frente" },
      { id: "verso", label: "Verso", sizes: ["a4", "a3"], x: 50, y: 60, side: "costas" },
    ],
  },
  {
    slug: "bone",
    kind: "bone",
    name: "Boné",
    tagline: "O detalhe que completa.",
    description: "Boné trucker com aba curva e regulagem traseira.",
    basePriceCents: 3400,
    colors: BASIC_COLORS.filter((c) => c.id !== "areia"),
    sizes: ["Único"],
    printAreas: [
      { id: "frontal", label: "Frontal", sizes: ["escudo"], x: 50, y: 42, side: "frente" },
      { id: "lateral", label: "Lateral", sizes: ["escudo"], x: 24, y: 52, side: "frente" },
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** DTF por metro: largura útil do filme e preço por metro linear (exemplo). */
export const DTF_ROLL_WIDTH_CM = 58;
export const DTF_PRICE_PER_METER_CENTS = 6900;

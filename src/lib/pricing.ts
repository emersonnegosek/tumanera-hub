import {
  DTF_PRICE_PER_METER_CENTS,
  PRINT_PRICE_CENTS,
  type PrintSize,
  type Product,
} from "./catalog";

/** Desconto por faixa de quantidade (exemplo). Ordem decrescente de quantidade mínima. */
export const QUANTITY_TIERS = [
  { min: 100, discount: 0.2 },
  { min: 50, discount: 0.15 },
  { min: 20, discount: 0.1 },
  { min: 10, discount: 0.05 },
  { min: 1, discount: 0 },
] as const;

export function tierDiscount(quantity: number): number {
  return QUANTITY_TIERS.find((t) => quantity >= t.min)?.discount ?? 0;
}

export interface PrintSelection {
  areaId: string;
  size: PrintSize;
}

export interface Quote {
  unitCents: number;
  totalCents: number;
  discount: number;
}

/**
 * Preço de uma peça pronta (NF-e): peça lisa + estampas, com desconto por quantidade.
 * Se `customerSupplied` for true (personalização de peça do cliente, NFS-e),
 * a peça lisa não é cobrada.
 */
export function quotePiece(
  product: Product,
  prints: PrintSelection[],
  quantity: number,
  customerSupplied = false,
): Quote {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantidade deve ser um inteiro maior que zero");
  }
  for (const p of prints) {
    const area = product.printAreas.find((a) => a.id === p.areaId);
    if (!area) throw new Error(`Área ${p.areaId} não existe em ${product.slug}`);
    if (!area.sizes.includes(p.size)) {
      throw new Error(`Tamanho ${p.size} não permitido na área ${area.label}`);
    }
  }
  const base = customerSupplied ? 0 : product.basePriceCents;
  const printsCents = prints.reduce((sum, p) => sum + PRINT_PRICE_CENTS[p.size], 0);
  const discount = tierDiscount(quantity);
  const unitCents = Math.round((base + printsCents) * (1 - discount));
  return { unitCents, totalCents: unitCents * quantity, discount };
}

/** DTF por metro (serviço, NFS-e): cobra por metro linear, arredondando para cima em 10 cm. */
export function quoteDtfMeters(lengthCm: number): Quote & { billedCm: number } {
  if (!(lengthCm > 0)) throw new Error("Comprimento deve ser maior que zero");
  const billedCm = Math.ceil(lengthCm / 10) * 10;
  const totalCents = Math.round((billedCm / 100) * DTF_PRICE_PER_METER_CENTS);
  return { unitCents: DTF_PRICE_PER_METER_CENTS, totalCents, discount: 0, billedCm };
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

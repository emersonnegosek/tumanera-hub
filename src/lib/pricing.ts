import {
  DTF_PRICE_PER_METER_CENTS,
  type ArtSize,
  type Category,
  type Model,
} from "./catalog";

export interface PrintSelection {
  areaId: string;
  size: ArtSize;
}

export interface Quote {
  unitCents: number;
  totalCents: number;
  tierIndex: number;
  tierLabel: string;
  /** Próxima faixa, para mostrar "a partir de N peças sai R$ X". */
  next?: { min: number; unitCents: number };
}

export class QuoteError extends Error {}

/** Índice da faixa da tabela para a quantidade, ou -1 se abaixo do mínimo. */
export function tierIndexFor(model: Model, quantity: number): number {
  let idx = -1;
  model.tiers.forEach((t, i) => {
    if (quantity >= t.min) idx = i;
  });
  return idx;
}

export function minQuantity(model: Model): number {
  return model.tiers[0].min;
}

function unitAt(model: Model, tier: number, prints: PrintSelection[], customerSupplied: boolean): number {
  const base = model.prices.sem[tier];
  // A tabela traz o preço da peça com UMA estampa de cada tamanho.
  // Estampas adicionais somam a diferença (preço com a arte - preço sem estampa) da mesma faixa.
  const printsCents = prints.reduce((sum, p) => sum + (model.prices[p.size][tier] - base), 0);
  return (customerSupplied ? 0 : base) + printsCents;
}

/**
 * Preço de uma peça pronta (NF-e) ou da personalização de peça do cliente (NFS-e,
 * `customerSupplied`: cobra só as estampas).
 */
export function quotePiece(
  category: Category,
  model: Model,
  prints: PrintSelection[],
  quantity: number,
  customerSupplied = false,
): Quote {
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new QuoteError("Quantidade deve ser um inteiro maior que zero");
  }
  for (const p of prints) {
    const area = category.printAreas.find((a) => a.id === p.areaId);
    if (!area) throw new QuoteError(`Área ${p.areaId} não existe em ${category.name}`);
    if (!area.sizes.includes(p.size)) {
      throw new QuoteError(`Tamanho ${p.size.toUpperCase()} não permitido na área ${area.label}`);
    }
  }
  const tier = tierIndexFor(model, quantity);
  if (tier < 0) {
    throw new QuoteError(`Pedido mínimo de ${minQuantity(model)} peças para ${model.name}`);
  }
  const unitCents = unitAt(model, tier, prints, customerSupplied);
  const nextTier = model.tiers[tier + 1];
  return {
    unitCents,
    totalCents: unitCents * quantity,
    tierIndex: tier,
    tierLabel: model.tiers[tier].label,
    next: nextTier
      ? { min: nextTier.min, unitCents: unitAt(model, tier + 1, prints, customerSupplied) }
      : undefined,
  };
}

/** DTF por metro (serviço, NFS-e): cobra por metro linear, arredondando para cima em 10 cm. */
export function quoteDtfMeters(lengthCm: number): { unitCents: number; totalCents: number; billedCm: number } {
  if (!(lengthCm > 0)) throw new QuoteError("Comprimento deve ser maior que zero");
  const billedCm = Math.ceil(lengthCm / 10) * 10;
  const totalCents = Math.round((billedCm / 100) * DTF_PRICE_PER_METER_CENTS);
  return { unitCents: DTF_PRICE_PER_METER_CENTS, totalCents, billedCm };
}

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

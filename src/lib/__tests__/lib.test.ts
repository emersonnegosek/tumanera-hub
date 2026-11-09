import { describe, expect, it } from "vitest";
import { CATEGORIES, findModel, getCategory } from "../catalog";
import { quoteDtfMeters, quotePiece, tierIndexFor } from "../pricing";
import { tenantSlugFromHost } from "../tenant";

describe("tenantSlugFromHost", () => {
  it("domínio principal não é collab", () => {
    expect(tenantSlugFromHost("tumanera.com.br")).toBeNull();
    expect(tenantSlugFromHost("www.tumanera.com.br")).toBeNull();
    expect(tenantSlugFromHost("localhost:3000")).toBeNull();
  });
  it("subdomínio vira slug da collab", () => {
    expect(tenantSlugFromHost("marca.tumanera.com.br")).toBe("marca");
    expect(tenantSlugFromHost("Surf-Club.localhost:3000")).toBe("surf-club");
  });
  it("ignora reservados, níveis extras e domínios de fora", () => {
    expect(tenantSlugFromHost("painel.tumanera.com.br")).toBeNull();
    expect(tenantSlugFromHost("a.b.tumanera.com.br")).toBeNull();
    expect(tenantSlugFromHost("marca.outrodominio.com")).toBeNull();
    expect(tenantSlugFromHost(null)).toBeNull();
  });
});

describe("catálogo (tabela v5)", () => {
  it("carrega os 34 modelos em categorias", () => {
    expect(CATEGORIES.reduce((n, c) => n + c.models.length, 0)).toBe(34);
    expect(getCategory("ecobags")?.models[0].name).toBe("Ecobag 35 x 40 cm");
  });
  it("toda área de estampa usa só tamanhos da tabela", () => {
    for (const c of CATEGORIES) for (const a of c.printAreas) expect(a.sizes.length).toBeGreaterThan(0);
  });
});

describe("pricing", () => {
  const simple = findModel("camiseta-regular-basic-simple")!;
  const colors = findModel("camiseta-regular-essentials-colors")!;

  it("faixas de quantidade da tabela", () => {
    expect(tierIndexFor(simple.model, 4)).toBe(-1);
    expect(tierIndexFor(simple.model, 5)).toBe(0);
    expect(tierIndexFor(simple.model, 19)).toBe(1);
    expect(tierIndexFor(simple.model, 250)).toBe(6);
  });

  it("uma estampa = preço exato da tabela", () => {
    // Basic Simple, 10+, A4 = R$ 52
    const q = quotePiece(simple.category, simple.model, [{ areaId: "costas", size: "a4" }], 10);
    expect(q.unitCents).toBe(5200);
    expect(q.totalCents).toBe(52000);
    expect(q.tierLabel).toBe("10+");
    expect(q.next).toEqual({ min: 20, unitCents: 5000 });
  });

  it("sem estampa = preço da peça lisa", () => {
    expect(quotePiece(colors.category, colors.model, [], 1).unitCents).toBe(5500);
  });

  it("segunda estampa soma a diferença da tabela", () => {
    // Essentials Colors, 1+: sem 55, A6 65, A3 90 -> 90 + (65 - 55) = 100
    const q = quotePiece(
      colors.category,
      colors.model,
      [
        { areaId: "peito", size: "a6" },
        { areaId: "costas", size: "a3" },
      ],
      1,
    );
    expect(q.unitCents).toBe(10000);
  });

  it("peça do cliente cobra só a estampa", () => {
    const q = quotePiece(colors.category, colors.model, [{ areaId: "costas", size: "a4" }], 1, true);
    expect(q.unitCents).toBe(8000 - 5500);
  });

  it("respeita mínimo e tamanhos por área", () => {
    expect(() => quotePiece(simple.category, simple.model, [], 2)).toThrow(/mínimo de 5/);
    expect(() => quotePiece(simple.category, simple.model, [{ areaId: "peito", size: "a2" }], 5)).toThrow();
  });

  it("DTF por metro arredonda para cima em 10 cm", () => {
    const q = quoteDtfMeters(101);
    expect(q.billedCm).toBe(110);
    expect(q.totalCents).toBe(Math.round(1.1 * 6900));
  });
});

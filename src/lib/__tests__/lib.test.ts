import { describe, expect, it } from "vitest";
import { getProduct } from "../catalog";
import { quoteDtfMeters, quotePiece, tierDiscount } from "../pricing";
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

describe("pricing", () => {
  const camiseta = getProduct("camiseta")!;

  it("faixas de desconto", () => {
    expect(tierDiscount(1)).toBe(0);
    expect(tierDiscount(10)).toBe(0.05);
    expect(tierDiscount(100)).toBe(0.2);
  });

  it("peça pronta = peça lisa + estampas", () => {
    const q = quotePiece(camiseta, [{ areaId: "peito", size: "escudo" }, { areaId: "costas", size: "a3" }], 1);
    expect(q.unitCents).toBe(3900 + 900 + 2900);
    expect(q.totalCents).toBe(q.unitCents);
  });

  it("peça do cliente não cobra a peça lisa", () => {
    const q = quotePiece(camiseta, [{ areaId: "costas", size: "a4" }], 20, true);
    expect(q.unitCents).toBe(Math.round(1900 * 0.9));
  });

  it("rejeita tamanho fora da área", () => {
    expect(() => quotePiece(camiseta, [{ areaId: "peito", size: "a3" }], 1)).toThrow();
    expect(() => quotePiece(camiseta, [], 0)).toThrow();
  });

  it("DTF por metro arredonda para cima em 10 cm", () => {
    const q = quoteDtfMeters(101);
    expect(q.billedCm).toBe(110);
    expect(q.totalCents).toBe(Math.round(1.1 * 6900));
  });
});

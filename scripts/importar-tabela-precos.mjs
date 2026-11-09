// Converte data/tabela-precos-v5.csv (exportada da planilha da TuManera) em src/data/tabela-precos.json.
// Uso: node scripts/importar-tabela-precos.mjs [caminho.csv]
import { readFileSync, writeFileSync } from "node:fs";

const src = process.argv[2] ?? "data/tabela-precos-v5.csv";
const ART = { "Sem estampa": "sem", A6: "a6", A5: "a5", A4: "a4", A3: "a3", A2: "a2" };

const slugify = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const lines = readFileSync(src, "utf8").replace(/^﻿/, "").trim().split(/\r?\n/);
const header = lines.shift().split(";");
const col = (name) => {
  const i = header.indexOf(name);
  if (i < 0) throw new Error(`Coluna ${name} não encontrada`);
  return i;
};
const C = Object.fromEntries(
  ["categoria", "linha", "produto", "composicao", "faixa", "qtd_min", "qtd_max", "arte", "preco_por_peca_RS"].map((n) => [n, col(n)]),
);

const models = new Map();
for (const line of lines) {
  const f = line.split(";");
  const name = f[C.produto].trim();
  const art = ART[f[C.arte].trim()];
  if (!art) throw new Error(`Arte desconhecida: ${f[C.arte]}`);
  const price = Math.round(Number(f[C.preco_por_peca_RS].replace(",", ".")) * 100);
  if (!Number.isFinite(price)) throw new Error(`Preço inválido em: ${line}`);
  let m = models.get(name);
  if (!m) {
    m = {
      slug: slugify(name),
      name,
      category: f[C.categoria].trim(),
      line: f[C.linha].trim(),
      composition: f[C.composicao].trim(),
      tiers: [],
      prices: { sem: [], a6: [], a5: [], a4: [], a3: [], a2: [] },
    };
    models.set(name, m);
  }
  const min = Number(f[C.qtd_min]);
  const max = f[C.qtd_max].trim() ? Number(f[C.qtd_max]) : null;
  let t = m.tiers.findIndex((x) => x.min === min);
  if (t < 0) {
    m.tiers.push({ label: f[C.faixa].trim(), min, max });
    t = m.tiers.length - 1;
  }
  m.prices[art][t] = price;
}

for (const m of models.values()) {
  for (const [art, arr] of Object.entries(m.prices)) {
    if (arr.length !== m.tiers.length || arr.some((v) => v == null)) {
      throw new Error(`${m.name}: faltam preços de ${art}`);
    }
  }
}

const out = [...models.values()];
writeFileSync("src/data/tabela-precos.json", JSON.stringify(out, null, 1) + "\n");
console.log(`${out.length} modelos importados de ${src}`);

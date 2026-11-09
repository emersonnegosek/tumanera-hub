"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Mockup } from "@/components/Mockup";
import {
  ART_SIZE_INFO,
  CATEGORIES,
  MOCKUP_PCT_PER_CM,
  findModel,
  fromPriceCents,
  type ArtSize,
  type Category,
  type Model,
} from "@/lib/catalog";
import { QuoteError, formatBRL, minQuantity, quotePiece, tierIndexFor, type Quote } from "@/lib/pricing";
import { whatsappLink } from "@/lib/site";

interface ArtInfo {
  url: string;
  name: string;
  widthPx: number;
  heightPx: number;
  hasTransparency: boolean | null;
}

type Placement = { size: ArtSize; dx: number; dy: number };

export function Studio({ initialModel, initialCategory }: { initialModel?: string; initialCategory?: string }) {
  const initial =
    (initialModel && findModel(initialModel)) ||
    (() => {
      const c = CATEGORIES.find((x) => x.slug === initialCategory) ?? CATEGORIES[0];
      return { category: c, model: c.models[0] };
    })();

  const [category, setCategory] = useState<Category>(initial.category);
  const [model, setModel] = useState<Model>(initial.model);
  const [colorId, setColorId] = useState(initial.category.colors[0].id);
  const [side, setSide] = useState<"frente" | "costas">("frente");
  const [placements, setPlacements] = useState<Record<string, Placement>>(() => defaultPlacement(initial.category));
  const [art, setArt] = useState<ArtInfo | null>(null);
  const [quantity, setQuantity] = useState(minQuantity(initial.model));
  const [customerSupplied, setCustomerSupplied] = useState(false);

  const color = category.colors.find((c) => c.id === colorId) ?? category.colors[0];
  const minQty = minQuantity(model);

  function selectCategory(c: Category) {
    setCategory(c);
    setColorId(c.colors[0].id);
    setSide("frente");
    setPlacements(defaultPlacement(c));
    selectModel(c.models[0]);
  }

  function selectModel(m: Model) {
    setModel(m);
    setQuantity((q) => Math.max(q, minQuantity(m)));
  }

  function toggleArea(areaId: string) {
    const area = category.printAreas.find((a) => a.id === areaId)!;
    setPlacements((prev) => {
      const next = { ...prev };
      if (next[areaId]) delete next[areaId];
      else next[areaId] = { size: area.sizes[0], dx: 0, dy: 0 };
      return next;
    });
    if (area.side !== side) setSide(area.side);
  }

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (art) URL.revokeObjectURL(art.url);
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;
    await img.decode();
    setArt({
      url,
      name: file.name,
      widthPx: img.naturalWidth,
      heightPx: img.naturalHeight,
      hasTransparency: file.type === "image/png" ? detectTransparency(img) : false,
    });
  }

  const prints = Object.entries(placements).map(([areaId, p]) => ({ areaId, size: p.size }));
  let quote: Quote | null = null;
  let quoteError: string | null = null;
  try {
    quote = quotePiece(category, model, prints, Math.max(1, quantity || 1), customerSupplied);
  } catch (e) {
    if (!(e instanceof QuoteError)) throw e;
    quoteError = e.message;
  }
  const tier = Math.max(0, tierIndexFor(model, quantity));
  const sizeExtra = (s: ArtSize) => model.prices[s][tier] - model.prices.sem[tier];

  const warnings = art ? artWarnings(art, prints.map((p) => p.size)) : [];

  const summary = [
    `Olá! Montei uma peça no estúdio da TuManera:`,
    `• ${customerSupplied ? `Personalização de peça minha (${category.name})` : model.name} — ${color.label}`,
    ...Object.entries(placements).map(([areaId, p]) => {
      const a = category.printAreas.find((x) => x.id === areaId)!;
      return `• ${a.label}: ${ART_SIZE_INFO[p.size].label}`;
    }),
    `• Quantidade: ${quantity} (faixa ${quote?.tierLabel ?? "-"})`,
    quote ? `• Estimativa: ${formatBRL(quote.totalCents)}` : "",
    `Tamanhos (grade PP a G3): vou informar aqui.`,
    art ? `Vou enviar a arte "${art.name}" aqui no chat.` : `Ainda preciso de ajuda com a arte.`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      {/* Visualização */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-3xl bg-bg-soft p-6 sm:p-10">
          <Mockup kind={category.kind} color={color.hex} side={side} className="mx-auto max-w-md">
            {category.printAreas
              .filter((a) => a.side === side && placements[a.id])
              .map((a) => (
                <ArtOnPiece
                  key={a.id}
                  x={a.x}
                  y={a.y}
                  placement={placements[a.id]}
                  widthPct={ART_SIZE_INFO[placements[a.id].size].widthCm * MOCKUP_PCT_PER_CM[category.kind]}
                  art={art}
                  label={a.label}
                  onMove={(dx, dy) =>
                    setPlacements((prev) => ({ ...prev, [a.id]: { ...prev[a.id], dx, dy } }))
                  }
                />
              ))}
          </Mockup>
          <div className="mt-6 flex justify-center">
            <Segmented
              value={side}
              options={[
                { value: "frente", label: "Frente" },
                { value: "costas", label: "Costas" },
              ]}
              onChange={(v) => setSide(v as "frente" | "costas")}
            />
          </div>
          <p className="mt-3 text-center text-xs text-fg-soft">Arraste a arte para ajustar a posição.</p>
        </div>
      </div>

      {/* Configuração */}
      <div className="min-w-0 space-y-8">
        <Step n={1} title="Peça">
          <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                onClick={() => selectCategory(c)}
                className={`w-24 shrink-0 snap-start rounded-2xl border p-2 text-xs transition-colors ${
                  c.slug === category.slug ? "border-accent ring-1 ring-accent" : "border-line hover:border-fg-soft"
                }`}
              >
                <Mockup kind={c.kind} color={c.colors[0].hex} />
                <span className="mt-1 block leading-tight">{c.name}</span>
              </button>
            ))}
          </div>
          <ul className="mt-4 space-y-2">
            {category.models.map((m) => (
              <li key={m.slug}>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-colors ${
                    m.slug === model.slug ? "border-accent ring-1 ring-accent" : "border-line hover:border-fg-soft"
                  }`}
                >
                  <input
                    type="radio"
                    name="modelo"
                    checked={m.slug === model.slug}
                    onChange={() => selectModel(m)}
                    className="mt-1 h-4 w-4 accent-[var(--accent)]"
                  />
                  <span className="flex-1">
                    <span className="block font-medium">{m.name}</span>
                    <span className="block text-xs text-fg-soft">{m.composition}</span>
                  </span>
                  <span className="text-right text-xs text-fg-soft">
                    a partir de
                    <span className="block text-sm text-fg">{formatBRL(fromPriceCents(m))}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <label className="mt-4 flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={customerSupplied}
              onChange={(e) => setCustomerSupplied(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Vou enviar minhas próprias peças (cobramos só a estampa)
          </label>
        </Step>

        <Step n={2} title="Cor">
          <div className="flex flex-wrap gap-3">
            {category.colors.map((c) => (
              <button
                key={c.id}
                onClick={() => setColorId(c.id)}
                aria-label={c.label}
                title={c.label}
                className={`h-9 w-9 rounded-full ring-offset-2 ring-offset-bg transition-shadow ${
                  c.id === colorId ? "ring-2 ring-accent" : "ring-1 ring-line"
                }`}
                style={{ background: c.hex }}
              />
            ))}
            <span className="self-center text-sm text-fg-soft">{color.label}</span>
          </div>
        </Step>

        <Step n={3} title="Onde estampar">
          <ul className="space-y-2">
            {category.printAreas.map((a) => {
              const p = placements[a.id];
              return (
                <li key={a.id} className="rounded-2xl border border-line p-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={!!p}
                      onChange={() => toggleArea(a.id)}
                      className="h-4 w-4 accent-[var(--accent)]"
                    />
                    <span className="flex-1">{a.label}</span>
                    <span className="text-xs text-fg-soft">{a.side}</span>
                  </label>
                  {p && a.sizes.length > 1 && (
                    <div className="mt-3 pl-7">
                      <Segmented
                        value={p.size}
                        options={a.sizes.map((s) => ({
                          value: s,
                          label: `${ART_SIZE_INFO[s].label} +${formatBRL(sizeExtra(s))}`,
                        }))}
                        onChange={(v) =>
                          setPlacements((prev) => ({ ...prev, [a.id]: { ...prev[a.id], size: v as ArtSize } }))
                        }
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Step>

        <Step n={4} title="Sua arte">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-line p-6 text-center text-sm transition-colors hover:border-accent">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            {art ? (
              <span>
                <strong>{art.name}</strong> · {art.widthPx} × {art.heightPx} px
                <span className="mt-1 block text-accent">Trocar arquivo</span>
              </span>
            ) : (
              <span>
                <span className="text-accent">Escolher arquivo</span>
                <span className="mt-1 block text-fg-soft">PNG com fundo transparente, 300 dpi no tamanho final</span>
              </span>
            )}
          </label>
          {warnings.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm text-[#bf4800] dark:text-[#ff9f0a]">
              {warnings.map((w) => (
                <li key={w}>⚠︎ {w}</li>
              ))}
            </ul>
          )}
          {!art && <p className="mt-2 text-xs text-fg-soft">Sem arte pronta? Nossa equipe cria com você no WhatsApp.</p>}
        </Step>

        <Step n={5} title="Quantidade">
          <div className="flex items-center gap-3">
            <button
              className="h-9 w-9 rounded-full border border-line text-lg"
              onClick={() => setQuantity((q) => Math.max(minQty, q - 1))}
              aria-label="Diminuir"
            >
              −
            </button>
            <input
              type="number"
              min={minQty}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.floor(Number(e.target.value) || 1)))}
              className="w-20 rounded-xl border border-line bg-transparent px-3 py-2 text-center"
            />
            <button
              className="h-9 w-9 rounded-full border border-line text-lg"
              onClick={() => setQuantity((q) => q + 1)}
              aria-label="Aumentar"
            >
              +
            </button>
            <span className="text-sm text-fg-soft">
              {quote?.next
                ? `A partir de ${quote.next.min} peças: ${formatBRL(quote.next.unitCents)} cada`
                : `Faixa ${quote?.tierLabel ?? ""}`}
            </span>
          </div>
        </Step>

        <div className="rounded-3xl bg-bg-soft p-6">
          {quote ? (
            <div className="flex items-baseline justify-between">
              <span className="text-fg-soft">{formatBRL(quote.unitCents)} por peça</span>
              <span className="text-3xl font-semibold tracking-tight">{formatBRL(quote.totalCents)}</span>
            </div>
          ) : (
            <p className="text-center text-[#bf4800] dark:text-[#ff9f0a]">{quoteError}</p>
          )}
          <a
            href={whatsappLink(summary)}
            target="_blank"
            rel="noreferrer"
            className={`btn btn-primary mt-5 w-full ${!quote ? "pointer-events-none opacity-40" : ""}`}
          >
            Enviar para aprovação no WhatsApp
          </a>
          <p className="mt-3 text-center text-xs text-fg-soft">
            Preços da tabela TuManera. O valor final vem com o mockup aprovado.
          </p>
        </div>
      </div>
    </div>
  );
}

function defaultPlacement(c: Category): Record<string, Placement> {
  const a = c.printAreas.find((x) => x.side === "frente") ?? c.printAreas[0];
  return { [a.id]: { size: a.sizes[0], dx: 0, dy: 0 } };
}

function ArtOnPiece({
  x,
  y,
  placement,
  widthPct,
  art,
  label,
  onMove,
}: {
  x: number;
  y: number;
  placement: Placement;
  widthPct: number;
  art: ArtInfo | null;
  label: string;
  onMove: (dx: number, dy: number) => void;
}) {
  const drag = useRef<{ startX: number; startY: number; dx: number; dy: number; w: number; h: number } | null>(null);

  function down(e: ReactPointerEvent<HTMLDivElement>) {
    const parent = e.currentTarget.parentElement!.getBoundingClientRect();
    drag.current = { startX: e.clientX, startY: e.clientY, dx: placement.dx, dy: placement.dy, w: parent.width, h: parent.height };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e: ReactPointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const clamp = (v: number) => Math.max(-10, Math.min(10, v));
    onMove(
      clamp(d.dx + ((e.clientX - d.startX) / d.w) * 100),
      clamp(d.dy + ((e.clientY - d.startY) / d.h) * 100),
    );
  }
  function up() {
    drag.current = null;
  }

  const aspect = art ? art.heightPx / art.widthPx : 1;

  return (
    <div
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className="absolute -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none select-none active:cursor-grabbing"
      style={{ left: `${x + placement.dx}%`, top: `${y + placement.dy}%`, width: `${widthPct}%` }}
      title={label}
    >
      {art ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={art.url} alt="" draggable={false} className="pointer-events-none w-full" style={{ aspectRatio: `1 / ${aspect}` }} />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-md border-2 border-dashed border-accent/70 bg-accent/10 text-[10px] font-medium text-accent">
          arte
        </div>
      )}
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold">
        <span className="mr-2 text-fg-soft">{n}.</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-full bg-line/40 p-1 text-sm">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-full px-4 py-1.5 transition-all duration-200 ${
            o.value === value ? "bg-card font-medium shadow-sm" : "text-fg-soft hover:text-fg"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function detectTransparency(img: HTMLImageElement): boolean {
  const w = Math.min(img.naturalWidth, 256);
  const h = Math.max(1, Math.round((img.naturalHeight / img.naturalWidth) * w));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  for (let i = 3; i < data.length; i += 4) if (data[i] < 250) return true;
  return false;
}

function artWarnings(art: ArtInfo, sizes: ArtSize[]): string[] {
  const out: string[] = [];
  const widest = sizes.reduce((m, s) => Math.max(m, ART_SIZE_INFO[s].widthCm), 0);
  if (widest > 0) {
    const dpi = Math.round(art.widthPx / (widest / 2.54));
    if (dpi < 300) {
      out.push(
        `Resolução de ~${dpi} dpi para ${widest} cm de largura. O ideal é 300 dpi (${Math.ceil((widest / 2.54) * 300)} px de largura).`,
      );
    }
  }
  if (art.hasTransparency === false) out.push("A arte não tem fundo transparente; o fundo também será impresso.");
  return out;
}

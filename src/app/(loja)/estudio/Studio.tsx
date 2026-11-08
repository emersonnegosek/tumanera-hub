"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Mockup } from "@/components/Mockup";
import {
  PRINT_PRICE_CENTS,
  PRINT_SIZE_LABEL,
  PRODUCTS,
  type PrintSize,
  type Product,
} from "@/lib/catalog";
import { formatBRL, quotePiece } from "@/lib/pricing";
import { whatsappLink } from "@/lib/site";

/** Largura máxima de cada tamanho de estampa, em cm. */
const PRINT_WIDTH_CM: Record<PrintSize, number> = { escudo: 10, a4: 21, a3: 30 };
/** Largura da estampa no mockup, em % da largura da peça. */
const PRINT_WIDTH_PCT: Record<PrintSize, number> = { escudo: 13, a4: 32, a3: 42 };

interface ArtInfo {
  url: string;
  name: string;
  widthPx: number;
  heightPx: number;
  hasTransparency: boolean | null;
}

type Placement = { size: PrintSize; dx: number; dy: number };

export function Studio({ initialSlug }: { initialSlug?: string }) {
  const [product, setProduct] = useState<Product>(
    PRODUCTS.find((p) => p.slug === initialSlug) ?? PRODUCTS[0],
  );
  const [colorId, setColorId] = useState(product.colors[0].id);
  const [side, setSide] = useState<"frente" | "costas">("frente");
  const [placements, setPlacements] = useState<Record<string, Placement>>(() => defaultPlacement(product));
  const [art, setArt] = useState<ArtInfo | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerSupplied, setCustomerSupplied] = useState(false);

  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0];

  function selectProduct(p: Product) {
    setProduct(p);
    setColorId(p.colors[0].id);
    setSide("frente");
    setPlacements(defaultPlacement(p));
  }

  function toggleArea(areaId: string) {
    const area = product.printAreas.find((a) => a.id === areaId)!;
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
  const quote = quotePiece(product, prints, Math.max(1, quantity || 1), customerSupplied);

  const warnings = art ? artWarnings(art, prints.map((p) => p.size)) : [];

  const summary = [
    `Olá! Montei uma peça no estúdio da TuManera:`,
    `• ${customerSupplied ? "Personalização de peça minha" : product.name} — ${color.label}`,
    ...Object.entries(placements).map(([areaId, p]) => {
      const a = product.printAreas.find((x) => x.id === areaId)!;
      return `• ${a.label}: ${PRINT_SIZE_LABEL[p.size]}`;
    }),
    `• Quantidade: ${quantity}`,
    `• Estimativa: ${formatBRL(quote.totalCents)}`,
    art ? `Vou enviar a arte "${art.name}" aqui no chat.` : `Ainda preciso de ajuda com a arte.`,
  ].join("\n");

  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      {/* Visualização */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-3xl bg-bg-soft p-6 sm:p-10">
          <Mockup kind={product.kind} color={color.hex} side={side} className="mx-auto max-w-md">
            {product.printAreas
              .filter((a) => a.side === side && placements[a.id])
              .map((a) => (
                <ArtOnPiece
                  key={a.id}
                  x={a.x}
                  y={a.y}
                  placement={placements[a.id]}
                  widthPct={PRINT_WIDTH_PCT[placements[a.id].size] * (product.kind === "bone" ? 1.6 : 1)}
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
      <div className="space-y-8">
        <Step n={1} title="Peça">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {PRODUCTS.map((p) => (
              <button
                key={p.slug}
                onClick={() => selectProduct(p)}
                className={`rounded-2xl border p-2 text-xs transition-colors ${
                  p.slug === product.slug ? "border-accent ring-1 ring-accent" : "border-line hover:border-fg-soft"
                }`}
              >
                <Mockup kind={p.kind} color={p.colors[0].hex} />
                <span className="mt-1 block">{p.name}</span>
              </button>
            ))}
          </div>
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
            {product.colors.map((c) => (
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
            {product.printAreas.map((a) => {
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
                          label: `${s.toUpperCase()} +${formatBRL(PRINT_PRICE_CENTS[s])}`,
                        }))}
                        onChange={(v) =>
                          setPlacements((prev) => ({ ...prev, [a.id]: { ...prev[a.id], size: v as PrintSize } }))
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
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Diminuir"
            >
              −
            </button>
            <input
              type="number"
              min={1}
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
              {quote.discount > 0 ? `${Math.round(quote.discount * 100)}% de desconto por quantidade` : "Desconto a partir de 10 peças"}
            </span>
          </div>
        </Step>

        <div className="rounded-3xl bg-bg-soft p-6">
          <div className="flex items-baseline justify-between">
            <span className="text-fg-soft">{formatBRL(quote.unitCents)} por peça</span>
            <span className="text-3xl font-semibold tracking-tight">{formatBRL(quote.totalCents)}</span>
          </div>
          <a
            href={whatsappLink(summary)}
            target="_blank"
            rel="noreferrer"
            className={`btn btn-primary mt-5 w-full ${prints.length === 0 ? "pointer-events-none opacity-40" : ""}`}
          >
            Enviar para aprovação no WhatsApp
          </a>
          <p className="mt-3 text-center text-xs text-fg-soft">
            Estimativa com preços de exemplo. O valor final vem com o mockup aprovado.
          </p>
        </div>
      </div>
    </div>
  );
}

function defaultPlacement(p: Product): Record<string, Placement> {
  const a = p.printAreas.find((x) => x.side === "frente") ?? p.printAreas[0];
  return { [a.id]: { size: a.sizes[a.sizes.length - 1], dx: 0, dy: 0 } };
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

function artWarnings(art: ArtInfo, sizes: PrintSize[]): string[] {
  const out: string[] = [];
  const widest = sizes.reduce((m, s) => Math.max(m, PRINT_WIDTH_CM[s]), 0);
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

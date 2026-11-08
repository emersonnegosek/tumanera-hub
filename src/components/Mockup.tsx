import type { ReactNode } from "react";
import type { ProductKind } from "@/lib/catalog";

/**
 * Mockup vetorial simples de cada peça (placeholder até termos fotos reais).
 * viewBox 400 × 440; `children` é renderizado por cima, em coordenadas percentuais.
 */
export function Mockup({
  kind,
  color,
  side = "frente",
  children,
  className = "",
}: {
  kind: ProductKind;
  color: string;
  side?: "frente" | "costas";
  children?: ReactNode;
  className?: string;
}) {
  const dark = isDark(color);
  const stroke = dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.12)";
  const detail = dark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.08)";

  return (
    <div className={`relative aspect-[400/440] w-full ${className}`}>
      <svg viewBox="0 0 400 440" className="absolute inset-0 h-full w-full drop-shadow-xl" aria-hidden>
        {shape(kind, side, color, stroke, detail)}
      </svg>
      {children}
    </div>
  );
}

function shape(kind: ProductKind, side: "frente" | "costas", fill: string, stroke: string, detail: string) {
  const common = { fill, stroke, strokeWidth: 2, strokeLinejoin: "round" as const };
  switch (kind) {
    case "camiseta":
      return (
        <g>
          <path
            {...common}
            d="M135 40 L170 28 Q200 58 230 28 L265 40 L362 96 L330 165 L296 146 L296 412 L104 412 L104 146 L70 165 L38 96 Z"
          />
          {side === "frente" ? (
            <path d="M170 28 Q200 66 230 28" fill="none" stroke={detail} strokeWidth="6" />
          ) : (
            <path d="M170 28 Q200 42 230 28" fill="none" stroke={detail} strokeWidth="6" />
          )}
        </g>
      );
    case "moletom":
    case "corta-vento":
      return (
        <g>
          <path {...common} d="M150 70 Q150 6 200 6 Q250 6 250 70 Z" />
          <path
            {...common}
            d="M118 72 L160 52 Q200 84 240 52 L282 72 L340 132 L372 380 L330 392 L302 186 L302 412 L98 412 L98 186 L70 392 L28 380 L60 132 Z"
          />
          {side === "frente" && kind === "moletom" && (
            <path d="M140 300 L260 300 L280 370 L120 370 Z" fill="none" stroke={detail} strokeWidth="3" />
          )}
          {side === "frente" && kind === "corta-vento" && (
            <line x1="200" y1="84" x2="200" y2="412" stroke={detail} strokeWidth="4" />
          )}
          <rect x="98" y="396" width="204" height="16" fill={detail} />
        </g>
      );
    case "ecobag":
      return (
        <g>
          <path d="M140 170 Q140 40 200 40 Q260 40 260 170" fill="none" stroke={fill} strokeWidth="16" />
          <path d="M140 170 Q140 40 200 40 Q260 40 260 170" fill="none" stroke={stroke} strokeWidth="2" />
          <path {...common} d="M84 160 L316 160 L326 424 L74 424 Z" />
        </g>
      );
    case "bone":
      return (
        <g>
          <path {...common} d="M76 272 Q76 104 200 104 Q324 104 324 272 Z" />
          <path d="M200 104 L200 272" stroke={detail} strokeWidth="3" />
          <path {...common} d="M56 270 Q200 236 364 276 Q336 316 200 304 Q86 298 56 270 Z" />
          <circle cx="200" cy="108" r="7" fill={detail} />
        </g>
      );
  }
}

function isDark(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 128;
}

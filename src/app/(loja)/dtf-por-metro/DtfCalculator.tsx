"use client";

import { useState } from "react";
import { DTF_PRICE_PER_METER_CENTS, DTF_ROLL_WIDTH_CM } from "@/lib/catalog";
import { formatBRL, quoteDtfMeters } from "@/lib/pricing";
import { whatsappLink } from "@/lib/site";

export function DtfCalculator() {
  const [lengthCm, setLengthCm] = useState(100);
  const q = quoteDtfMeters(Math.max(10, lengthCm));
  const meters = (q.billedCm / 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 });

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <div className="rounded-3xl bg-bg-soft p-8">
        {/* Folha em escala: largura fixa, comprimento proporcional */}
        <div className="mx-auto flex max-w-[220px] flex-col items-center">
          <span className="mb-2 text-xs text-fg-soft">{DTF_ROLL_WIDTH_CM} cm</span>
          <div
            className="w-full rounded-md bg-card shadow-inner ring-1 ring-line transition-all duration-500"
            style={{ height: `${Math.min(420, (q.billedCm / DTF_ROLL_WIDTH_CM) * 220)}px` }}
          >
            <div className="grid h-full grid-cols-3 gap-2 p-2 opacity-60">
              {Array.from({ length: Math.min(36, Math.ceil(q.billedCm / 10) * 3) }).map((_, i) => (
                <div key={i} className="rounded bg-accent/25" />
              ))}
            </div>
          </div>
          <span className="mt-2 text-xs text-fg-soft">{meters} m</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="comprimento">
          Comprimento da folha
        </label>
        <input
          id="comprimento"
          type="range"
          min={10}
          max={1000}
          step={10}
          value={lengthCm}
          onChange={(e) => setLengthCm(Number(e.target.value))}
          className="mt-4 w-full accent-[var(--accent)]"
        />
        <p className="mt-2 text-fg-soft">
          {meters} m × {DTF_ROLL_WIDTH_CM} cm · {formatBRL(DTF_PRICE_PER_METER_CENTS)} por metro
        </p>
        <p className="mt-6 text-5xl font-semibold tracking-tight">{formatBRL(q.totalCents)}</p>
        <ul className="mt-6 space-y-2 text-sm text-fg-soft">
          <li>• Envie as artes já montadas na folha ou peça para a gente montar.</li>
          <li>• PNG com fundo transparente, 300 dpi.</li>
          <li>• Cobrança a cada 10 cm. Serviço com NFS-e.</li>
        </ul>
        <a
          href={whatsappLink(`Olá! Quero ${meters} m de DTF (${formatBRL(q.totalCents)}).`)}
          target="_blank"
          rel="noreferrer"
          className="btn btn-primary mt-8"
        >
          Pedir pelo WhatsApp
        </a>
        <p className="mt-3 text-xs text-fg-soft">Preço de exemplo no protótipo.</p>
      </div>
    </div>
  );
}

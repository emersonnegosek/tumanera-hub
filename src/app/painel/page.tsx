import Link from "next/link";
import { MODULES } from "./modules";

const PHASE_NAME: Record<number, string> = {
  1: "Fase 1 · MVP vendas",
  2: "Fase 2 · Operação",
  3: "Fase 3 · Gestão",
  4: "Fase 4 · Collabs",
};

export default function PainelHome() {
  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="headline text-4xl">Visão geral</h1>
      <p className="mt-2 text-fg-soft">
        Esqueleto do hub (Fase 0). Os indicadores aparecem aqui quando os módulos da Fase 1 estiverem ligados ao banco.
      </p>
      {[1, 2, 3, 4].map((phase) => (
        <section key={phase} className="mt-10">
          <h2 className="mb-4 text-sm font-medium text-fg-soft">{PHASE_NAME[phase]}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {MODULES.filter((m) => m.phase === phase).map((m) => (
              <Link
                key={m.slug}
                href={`/painel/${m.slug}`}
                className="card block p-6 transition-transform duration-200 hover:-translate-y-0.5"
              >
                <h3 className="text-lg font-semibold">{m.label}</h3>
                <p className="mt-1 text-sm text-fg-soft">{m.text}</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

import Link from "next/link";
import { MODULES } from "./modules";

export const metadata = { title: { default: "Painel", template: "%s · Painel TuManera" } };

export default function PainelLayout({ children }: LayoutProps<"/painel">) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-soft md:flex-row">
      <aside className="border-b border-line/60 bg-bg md:w-60 md:shrink-0 md:border-r md:border-b-0">
        <div className="flex h-14 items-center px-5">
          <Link href="/painel" className="font-semibold tracking-tight">
            TuManera <span className="font-normal text-fg-soft">Painel</span>
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 text-sm md:flex-col md:pb-6">
          <Link href="/painel" className="shrink-0 rounded-lg px-3 py-2 hover:bg-bg-soft">
            Visão geral
          </Link>
          {MODULES.map((m) => (
            <Link
              key={m.slug}
              href={`/painel/${m.slug}`}
              className="flex shrink-0 items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-bg-soft"
            >
              {m.label}
              <span className="text-[10px] text-fg-soft">F{m.phase}</span>
            </Link>
          ))}
          <Link href="/" className="mt-2 shrink-0 rounded-lg px-3 py-2 text-fg-soft hover:bg-bg-soft md:mt-6">
            ← Ver loja
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-5 md:p-10">{children}</main>
    </div>
  );
}

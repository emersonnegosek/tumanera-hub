import Link from "next/link";
import { whatsappLink } from "@/lib/site";

const NAV = [
  { href: "/produtos", label: "Loja" },
  { href: "/estudio", label: "Personalizar" },
  { href: "/dtf-por-metro", label: "DTF por metro" },
  { href: "/collabs", label: "Collabs" },
  { href: "/blog", label: "Blog" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-[var(--nav)] backdrop-blur-xl backdrop-saturate-150">
      <nav className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-4 px-4 text-sm">
        <Link href="/" className="text-base font-semibold tracking-tight">
          TuManera
        </Link>
        <ul className="hidden items-center gap-7 text-fg/80 md:flex">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="transition-colors hover:text-fg">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
        <a
          href={whatsappLink("Olá! Quero personalizar uma peça.")}
          className="rounded-full bg-fg px-3 py-1 text-xs font-medium text-bg transition-opacity hover:opacity-80"
        >
          WhatsApp
        </a>
      </nav>
      <ul className="flex gap-5 overflow-x-auto px-4 pb-2 text-xs text-fg/80 md:hidden">
        {NAV.map((n) => (
          <li key={n.href} className="shrink-0">
            <Link href={n.href}>{n.label}</Link>
          </li>
        ))}
      </ul>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-bg-soft">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-xs text-fg-soft sm:grid-cols-3">
        <div>
          <p className="mb-2 font-semibold text-fg">TuManera</p>
          <p>Personalização em DTF têxtil: camisetas, moletons, corta-ventos, ecobags e bonés.</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/produtos">Loja</Link>
          <Link href="/estudio">Personalizar</Link>
          <Link href="/dtf-por-metro">DTF por metro</Link>
          <Link href="/collabs">Seja uma collab</Link>
        </div>
        <div className="flex flex-col gap-2">
          <a href={whatsappLink("Olá!")}>Atendimento pelo WhatsApp</a>
          <Link href="/painel">Painel interno</Link>
          <p>© TuManera Co.</p>
        </div>
      </div>
    </footer>
  );
}

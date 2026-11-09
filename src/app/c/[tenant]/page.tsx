import type { Metadata } from "next";
import Link from "next/link";
import { Mockup } from "@/components/Mockup";
import { CATEGORIES } from "@/lib/catalog";
import { formatBRL } from "@/lib/pricing";

/**
 * Vitrine de uma collab (subloja). Chega aqui via proxy: marca.tumanera.com.br -> /c/marca.
 * Fase 0: vitrine demonstrativa. Fase 4: tema, produtos e repasse vindos da tabela `tenants`.
 */

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: PageProps<"/c/[tenant]">): Promise<Metadata> {
  const { tenant } = await params;
  return { title: `${titleFromSlug(tenant)} × TuManera` };
}

export default async function CollabStore({ params }: PageProps<"/c/[tenant]">) {
  const { tenant } = await params;
  const brand = titleFromSlug(tenant);

  return (
    <main className="flex-1">
      <header className="border-b border-line/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <span className="text-lg font-semibold tracking-tight">{brand}</span>
          <span className="text-xs text-fg-soft">produzido por TuManera</span>
        </div>
      </header>
      <section className="px-4 py-16 text-center">
        <h1 className="headline text-5xl sm:text-6xl">{brand}</h1>
        <p className="mt-3 text-lg text-fg-soft">Coleção exclusiva em parceria com a TuManera.</p>
      </section>
      <section className="px-4">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[CATEGORIES[1], CATEGORIES[7], CATEGORIES[8]].filter(Boolean).map((p) => (
            <div key={p.slug} className="rounded-3xl bg-bg-soft p-8">
              <Mockup kind={p.kind} color={p.colors[0].hex} className="mx-auto max-w-[240px]">
                <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 text-[clamp(10px,2.4vw,20px)] font-bold text-white/90">
                  {brand}
                </div>
              </Mockup>
              <h2 className="mt-6 text-xl font-semibold">
                {p.name} {brand}
              </h2>
              <p className="mt-1 text-sm">{formatBRL(p.models[0].prices.a4[0])}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-8 max-w-6xl text-xs text-fg-soft">
          Vitrine demonstrativa da Fase 0. <Link href="/collabs" className="underline">Saiba mais sobre collabs</Link>.
        </p>
      </section>
    </main>
  );
}

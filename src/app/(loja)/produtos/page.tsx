import type { Metadata } from "next";
import Link from "next/link";
import { Mockup } from "@/components/Mockup";
import { Reveal } from "@/components/Reveal";
import { PRODUCTS } from "@/lib/catalog";
import { formatBRL } from "@/lib/pricing";

export const metadata: Metadata = { title: "Loja" };

export default function Produtos() {
  return (
    <section className="px-4 pt-16">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h1 className="headline text-5xl sm:text-6xl">Loja.</h1>
          <p className="mt-3 text-xl text-fg-soft">Escolha a peça e personalize com DTF têxtil.</p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}>
              <Link
                href={`/produtos/${p.slug}`}
                className="group block rounded-3xl bg-bg-soft p-8 transition-transform duration-300 hover:-translate-y-1"
              >
                <Mockup
                  kind={p.kind}
                  color={p.colors[1]?.hex ?? p.colors[0].hex}
                  className="mx-auto max-w-[260px] transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="mt-6 flex gap-1.5">
                  {p.colors.map((c) => (
                    <span
                      key={c.id}
                      title={c.label}
                      className="h-3 w-3 rounded-full ring-1 ring-line"
                      style={{ background: c.hex }}
                    />
                  ))}
                </div>
                <h2 className="mt-3 text-2xl font-semibold">{p.name}</h2>
                <p className="text-fg-soft">{p.tagline}</p>
                <p className="mt-3 text-sm">Peça lisa a partir de {formatBRL(p.basePriceCents)}</p>
              </Link>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-xs text-fg-soft">Preços de exemplo no protótipo.</p>
      </div>
    </section>
  );
}

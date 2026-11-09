import type { Metadata } from "next";
import Link from "next/link";
import { Mockup } from "@/components/Mockup";
import { Reveal } from "@/components/Reveal";
import { CATEGORIES, COLORS, categoryFromPriceCents } from "@/lib/catalog";
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
          {CATEGORIES.map((c, i) => (
            <Reveal key={c.slug} delay={(i % 3) * 80}>
              <Link
                href={`/produtos/${c.slug}`}
                className="group block h-full rounded-3xl bg-bg-soft p-8 transition-transform duration-300 hover:-translate-y-1"
              >
                <Mockup
                  kind={c.kind}
                  color={c.colors[(i * 3) % c.colors.length].hex}
                  className="mx-auto max-w-[240px] transition-transform duration-500 group-hover:scale-[1.04]"
                />
                <div className="mt-6 flex flex-wrap gap-1.5">
                  {c.colors.map((col) => (
                    <span
                      key={col.id}
                      title={col.label}
                      className="h-3 w-3 rounded-full ring-1 ring-line"
                      style={{ background: col.hex }}
                    />
                  ))}
                </div>
                <h2 className="mt-3 text-2xl font-semibold">{c.name}</h2>
                <p className="text-fg-soft">{c.tagline}</p>
                <p className="mt-3 text-sm">
                  {c.models.length} {c.models.length === 1 ? "modelo" : "modelos"} · a partir de{" "}
                  {formatBRL(categoryFromPriceCents(c))}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-xs text-fg-soft">
          Preço por peça sem estampa, na maior faixa de quantidade. {COLORS.length} cores, do PP ao G3.
        </p>
      </div>
    </section>
  );
}

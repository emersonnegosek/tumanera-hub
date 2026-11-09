import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mockup } from "@/components/Mockup";
import { Reveal } from "@/components/Reveal";
import { ART_SIZES, ART_SIZE_INFO, CATEGORIES, getCategory, type PriceKey } from "@/lib/catalog";
import { formatBRL } from "@/lib/pricing";
import { whatsappLink } from "@/lib/site";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/produtos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: getCategory(slug)?.name ?? "Produto" };
}

const COLUMNS: { key: PriceKey; label: string }[] = [
  { key: "sem", label: "Sem estampa" },
  ...ART_SIZES.map((s) => ({ key: s, label: ART_SIZE_INFO[s].label })),
];

export default async function CategoriaPage({ params }: PageProps<"/produtos/[slug]">) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  return (
    <section className="px-4 pt-12">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <Reveal className="rounded-3xl bg-bg-soft p-10">
            <Mockup kind={category.kind} color={category.colors[0].hex} className="mx-auto max-w-sm" />
          </Reveal>
          <Reveal delay={120}>
            <p className="text-sm font-medium text-accent">Personalizável em DTF</p>
            <h1 className="headline mt-2 text-5xl">{category.name}</h1>
            <p className="mt-3 text-xl text-fg-soft">{category.tagline}</p>

            <div className="mt-8 border-t border-line pt-6">
              <h2 className="font-semibold">Onde dá para estampar</h2>
              <ul className="mt-3 space-y-1 text-fg-soft">
                {category.printAreas.map((a) => (
                  <li key={a.id} className="flex justify-between gap-4">
                    <span>{a.label}</span>
                    <span>{a.sizes.map((s) => ART_SIZE_INFO[s].label).join(", ")}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-6 border-t border-line pt-6">
              <h2 className="font-semibold">Cores e tamanhos</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {category.colors.map((c) => (
                  <span
                    key={c.id}
                    title={c.label}
                    className="h-6 w-6 rounded-full ring-1 ring-line"
                    style={{ background: c.hex }}
                  />
                ))}
              </div>
              <p className="mt-3 text-fg-soft">{category.sizes.join(" · ")}</p>
            </div>
          </Reveal>
        </div>

        <h2 className="headline mt-20 text-3xl sm:text-4xl">Modelos e preços.</h2>
        <p className="mt-2 text-fg-soft">Preço por peça, com uma estampa do tamanho indicado.</p>

        <div className="mt-8 min-w-0 space-y-6">
          {category.models.map((m) => (
            <Reveal key={m.slug}>
              <article className="rounded-3xl bg-bg-soft p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold">{m.name}</h3>
                    <p className="mt-1 text-sm text-fg-soft">{m.composition}</p>
                    {m.tiers[0].min > 1 && (
                      <p className="mt-1 text-sm text-fg-soft">Pedido mínimo: {m.tiers[0].min} peças</p>
                    )}
                  </div>
                  <Link href={`/estudio?modelo=${m.slug}`} className="btn btn-primary">
                    Personalizar
                  </Link>
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-right text-sm tabular-nums">
                    <thead>
                      <tr className="text-fg-soft">
                        <th className="py-2 text-left font-medium">Quantidade</th>
                        {COLUMNS.map((c) => (
                          <th key={c.key} className="py-2 font-medium">
                            {c.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {m.tiers.map((t, i) => (
                        <tr key={t.label} className="border-t border-line/70">
                          <td className="py-2 text-left">{t.label} peças</td>
                          {COLUMNS.map((c) => (
                            <td key={c.key} className="py-2">
                              {formatBRL(m.prices[c.key][i])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href={whatsappLink(`Olá! Tenho interesse em ${category.name.toLowerCase()} personalizadas.`)}
            className="btn btn-ghost"
          >
            Tirar dúvidas no WhatsApp ›
          </a>
        </div>
      </div>
    </section>
  );
}

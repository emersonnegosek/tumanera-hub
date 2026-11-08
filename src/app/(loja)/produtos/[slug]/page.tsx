import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mockup } from "@/components/Mockup";
import { Reveal } from "@/components/Reveal";
import { PRINT_PRICE_CENTS, PRINT_SIZE_LABEL, PRODUCTS, getProduct } from "@/lib/catalog";
import { formatBRL } from "@/lib/pricing";
import { whatsappLink } from "@/lib/site";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/produtos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return { title: p?.name ?? "Produto" };
}

export default async function Produto({ params }: PageProps<"/produtos/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <section className="px-4 pt-12">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <Reveal className="rounded-3xl bg-bg-soft p-10">
          <Mockup kind={product.kind} color={product.colors[0].hex} className="mx-auto max-w-md" />
        </Reveal>
        <Reveal delay={120}>
          <p className="text-sm font-medium text-accent">Personalizável em DTF</p>
          <h1 className="headline mt-2 text-5xl">{product.name}</h1>
          <p className="mt-3 text-xl text-fg-soft">{product.description}</p>
          <p className="mt-6 text-lg">Peça lisa a partir de {formatBRL(product.basePriceCents)}</p>

          <div className="mt-8 border-t border-line pt-6">
            <h2 className="font-semibold">Onde dá para estampar</h2>
            <ul className="mt-3 space-y-2 text-fg-soft">
              {product.printAreas.map((a) => (
                <li key={a.id} className="flex justify-between gap-4">
                  <span>{a.label}</span>
                  <span className="text-right text-sm">
                    {a.sizes.map((s) => `${PRINT_SIZE_LABEL[s]} +${formatBRL(PRINT_PRICE_CENTS[s])}`).join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 border-t border-line pt-6">
            <h2 className="font-semibold">Cores e tamanhos</h2>
            <p className="mt-2 text-fg-soft">
              {product.colors.map((c) => c.label).join(", ")} · {product.sizes.join(", ")}
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href={`/estudio?produto=${product.slug}`} className="btn btn-primary">
              Personalizar {product.name.toLowerCase()}
            </Link>
            <a
              href={whatsappLink(`Olá! Tenho interesse em ${product.name.toLowerCase()} personalizado.`)}
              className="btn btn-ghost"
            >
              Tirar dúvidas no WhatsApp ›
            </a>
          </div>
          <p className="mt-6 text-xs text-fg-soft">Preços de exemplo no protótipo.</p>
        </Reveal>
      </div>
    </section>
  );
}

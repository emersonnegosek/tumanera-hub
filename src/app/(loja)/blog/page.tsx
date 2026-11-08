import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = { title: "Blog" };

/** Pautas iniciais sugeridas. Na Fase 2 o blog passa a ter editor (MDX ou CMS). */
const PAUTAS = [
  { tag: "Guia", title: "DTF, silk ou sublimação: qual escolher para sua camiseta?" },
  { tag: "Arte", title: "Como preparar sua arte em PNG transparente a 300 dpi" },
  { tag: "Empresas", title: "Uniformes e brindes personalizados: quanto pedir e com quanto tempo" },
  { tag: "Cuidados", title: "Como lavar peças com DTF para durarem mais" },
];

export default function Blog() {
  return (
    <section className="px-4 pt-16">
      <div className="mx-auto max-w-5xl">
        <h1 className="headline text-5xl">Blog.</h1>
        <p className="mt-2 text-lg text-fg-soft">Dicas de personalização, arte e estilo. Em breve.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {PAUTAS.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <article className="h-full rounded-3xl bg-bg-soft p-8">
                <p className="text-xs font-medium uppercase tracking-wide text-accent">{p.tag}</p>
                <h2 className="mt-2 text-2xl font-semibold">{p.title}</h2>
                <p className="mt-4 text-sm text-fg-soft">Em breve</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

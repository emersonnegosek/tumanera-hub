import Link from "next/link";
import { Mockup } from "@/components/Mockup";
import { Reveal } from "@/components/Reveal";
import { PRODUCTS } from "@/lib/catalog";
import { formatBRL } from "@/lib/pricing";
import { whatsappLink } from "@/lib/site";

const STEPS = [
  {
    n: "1",
    title: "Escolha a peça",
    text: "Camiseta, moletom, corta-vento, ecobag ou boné. Cor e tamanho do seu jeito.",
  },
  {
    n: "2",
    title: "Posicione a arte",
    text: "Envie sua arte, arraste sobre a peça e veja o preço na hora.",
  },
  {
    n: "3",
    title: "Aprove no WhatsApp",
    text: "Nossa equipe revisa, manda o mockup final e você aprova com um toque.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="overflow-hidden px-4 pt-20 pb-10 text-center sm:pt-28">
        <Reveal>
          <p className="mb-3 text-sm font-medium text-accent">Personalização em DTF têxtil</p>
          <h1 className="headline mx-auto max-w-4xl text-5xl sm:text-7xl">Sua ideia. Na sua peça.</h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-fg-soft sm:text-xl">
            Cores vivas, toque macio e durabilidade. Do primeiro rascunho à entrega, com atendimento de
            verdade pelo WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/estudio" className="btn btn-primary">
              Começar a personalizar
            </Link>
            <a href={whatsappLink("Olá! Quero ajuda para escolher minha peça.")} className="btn btn-ghost">
              Falar no WhatsApp ›
            </a>
          </div>
        </Reveal>
        <Reveal delay={150} className="mx-auto mt-14 grid max-w-4xl grid-cols-3 items-end gap-4 sm:gap-10">
          <Mockup kind="moletom" color="#1d1d1f" className="translate-y-6" />
          <Mockup kind="camiseta" color="#f5f5f7">
            <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 text-center text-[clamp(10px,3vw,26px)] font-bold tracking-tight text-fg-soft/80 [color:#1d1d1f]">
              sua arte
              <br />
              aqui
            </div>
          </Mockup>
          <Mockup kind="corta-vento" color="#1f2a44" className="translate-y-6" />
        </Reveal>
      </section>

      {/* Produtos */}
      <section className="bg-bg-soft px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="headline text-4xl sm:text-5xl">Escolha sua base.</h2>
            <p className="mt-3 text-lg text-fg-soft">Cinco peças, infinitas possibilidades.</p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {PRODUCTS.map((p, i) => (
              <Reveal key={p.slug} delay={i * 80}>
                <Link
                  href={`/produtos/${p.slug}`}
                  className="card group flex h-full flex-col p-6 transition-transform duration-300 hover:-translate-y-1"
                >
                  <Mockup
                    kind={p.kind}
                    color={p.colors[0].hex}
                    className="transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                  <h3 className="mt-5 text-xl font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-fg-soft">{p.tagline}</p>
                  <p className="mt-auto pt-4 text-sm">A partir de {formatBRL(p.basePriceCents)}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="headline text-center text-4xl sm:text-5xl">Simples assim.</h2>
          </Reveal>
          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 120} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-lg font-semibold text-accent-fg">
                  {s.n}
                </div>
                <h3 className="mt-5 text-2xl font-semibold">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-fg-soft">{s.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DTF por metro + Collabs */}
      <section className="px-4">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-2">
          <Reveal>
            <div className="card flex h-full flex-col bg-fg p-10 text-bg">
              <p className="text-sm font-medium opacity-70">Para quem estampa</p>
              <h2 className="headline mt-2 text-4xl">DTF por metro.</h2>
              <p className="mt-3 opacity-80">
                Monte sua folha, envie as artes e receba o filme pronto para aplicar.
              </p>
              <Link href="/dtf-por-metro" className="mt-8 self-start text-[#2997ff] hover:underline">
                Calcular minha folha ›
              </Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="card flex h-full flex-col bg-bg-soft p-10">
              <p className="text-sm font-medium text-fg-soft">Para marcas</p>
              <h2 className="headline mt-2 text-4xl">Sua loja, nossa produção.</h2>
              <p className="mt-3 text-fg-soft">
                Collabs ganham uma loja própria com a sua marca. A gente produz, emite nota e entrega.
              </p>
              <Link href="/collabs" className="btn-ghost mt-8 self-start">
                Quero ser collab ›
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

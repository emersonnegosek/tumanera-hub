import type { Metadata } from "next";
import { Reveal } from "@/components/Reveal";
import { whatsappLink } from "@/lib/site";

export const metadata: Metadata = { title: "Collabs" };

const BENEFITS = [
  { title: "Loja com a sua cara", text: "Seu endereço suamarca.tumanera.com.br, com logo, cores e produtos da sua marca." },
  { title: "Zero estoque", text: "Produzimos sob demanda em DTF. Você não compra nada antecipado." },
  { title: "Repasse automático", text: "Cada venda já divide o valor: sua parte cai direto na sua conta." },
  { title: "Nota e entrega por nossa conta", text: "Emitimos a nota, embalamos e enviamos para o seu cliente." },
];

export default function Collabs() {
  return (
    <section className="px-4 pt-16">
      <div className="mx-auto max-w-5xl">
        <Reveal className="text-center">
          <p className="text-sm font-medium text-accent">TuManera Collabs</p>
          <h1 className="headline mt-2 text-5xl sm:text-6xl">Sua marca. Nossa produção.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-xl text-fg-soft">
            Uma loja própria, pronta em minutos, para artistas, criadores e marcas venderem suas estampas.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2">
          {BENEFITS.map((b, i) => (
            <Reveal key={b.title} delay={i * 80}>
              <div className="h-full rounded-3xl bg-bg-soft p-8">
                <h2 className="text-2xl font-semibold">{b.title}</h2>
                <p className="mt-2 text-fg-soft">{b.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-14 text-center">
          <a href={whatsappLink("Olá! Quero ser uma collab da TuManera.")} className="btn btn-primary">
            Quero minha loja
          </a>
        </Reveal>
      </div>
    </section>
  );
}

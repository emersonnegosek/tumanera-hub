import { notFound } from "next/navigation";
import { MODULES } from "../modules";

export function generateStaticParams() {
  return MODULES.map((m) => ({ modulo: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/painel/[modulo]">) {
  const { modulo } = await params;
  return { title: MODULES.find((m) => m.slug === modulo)?.label ?? "Módulo" };
}

export default async function Modulo({ params }: PageProps<"/painel/[modulo]">) {
  const { modulo } = await params;
  const m = MODULES.find((x) => x.slug === modulo);
  if (!m) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm text-fg-soft">Fase {m.phase}</p>
      <h1 className="headline mt-1 text-4xl">{m.label}</h1>
      <p className="mt-2 text-fg-soft">{m.text}</p>
      <div className="card mt-10 flex flex-col items-center justify-center p-16 text-center">
        <p className="text-lg font-medium">Em construção</p>
        <p className="mt-1 max-w-sm text-sm text-fg-soft">Este módulo entra na Fase {m.phase} do roadmap.</p>
      </div>
    </div>
  );
}

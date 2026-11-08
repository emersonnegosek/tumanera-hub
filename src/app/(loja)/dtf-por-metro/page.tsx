import type { Metadata } from "next";
import { DtfCalculator } from "./DtfCalculator";

export const metadata: Metadata = { title: "DTF por metro" };

export default function DtfPage() {
  return (
    <section className="px-4 pt-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="headline text-4xl sm:text-5xl">DTF por metro.</h1>
        <p className="mt-2 mb-10 text-lg text-fg-soft">Filme pronto para aplicar. Você estampa, a gente imprime.</p>
        <DtfCalculator />
      </div>
    </section>
  );
}

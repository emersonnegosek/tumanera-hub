import type { Metadata } from "next";
import { Suspense } from "react";
import { Studio } from "./Studio";

export const metadata: Metadata = { title: "Estúdio de personalização" };

async function StudioFromQuery({ searchParams }: Pick<PageProps<"/estudio">, "searchParams">) {
  const { produto } = await searchParams;
  return <Studio initialSlug={typeof produto === "string" ? produto : undefined} />;
}

export default function EstudioPage({ searchParams }: PageProps<"/estudio">) {
  return (
    <section className="px-4 pt-12">
      <div className="mx-auto max-w-6xl">
        <h1 className="headline text-4xl sm:text-5xl">Estúdio.</h1>
        <p className="mt-2 mb-10 text-lg text-fg-soft">Monte sua peça e veja o preço na hora.</p>
        <Suspense fallback={<div className="h-[600px] rounded-3xl bg-bg-soft" />}>
          <StudioFromQuery searchParams={searchParams} />
        </Suspense>
      </div>
    </section>
  );
}

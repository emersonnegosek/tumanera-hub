import { SiteFooter, SiteHeader } from "@/components/SiteChrome";

export default function LojaLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </>
  );
}

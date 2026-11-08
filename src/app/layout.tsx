import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TuManera — Personalização em DTF têxtil",
    template: "%s · TuManera",
  },
  description:
    "Camisetas, moletons, corta-ventos, ecobags e bonés personalizados em DTF. Monte sua peça, aprove a arte pelo WhatsApp e receba em casa.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

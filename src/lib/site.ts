export const SITE = {
  name: "TuManera",
  domain: "tumanera.com.br",
  whatsappNumber: "5547991404004",
};

export function whatsappLink(text: string): string {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(text)}`;
}

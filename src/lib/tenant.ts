/**
 * Resolução de tenant (marca) a partir do host.
 *
 *   www.tumanera.com.br / tumanera.com.br  -> tenant principal (null)
 *   marca.tumanera.com.br                  -> subloja da collab "marca"
 *   marca.localhost:3000                   -> subloja em desenvolvimento
 */

export const ROOT_DOMAINS = ["tumanera.com.br", "localhost"];

/** Subdomínios que nunca são collabs. */
const RESERVED = new Set(["www", "app", "painel", "api", "novo", "staging", "admin"]);

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,38}[a-z0-9])?$/;

export function tenantSlugFromHost(host: string | null | undefined): string | null {
  if (!host) return null;
  const hostname = host.split(":")[0].toLowerCase();
  for (const root of ROOT_DOMAINS) {
    if (hostname === root) return null;
    if (hostname.endsWith(`.${root}`)) {
      const sub = hostname.slice(0, -(root.length + 1));
      if (sub.includes(".")) return null; // apenas um nível de subdomínio
      if (RESERVED.has(sub) || !SLUG_RE.test(sub)) return null;
      return sub;
    }
  }
  return null;
}

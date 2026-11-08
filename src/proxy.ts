import { NextResponse, type NextRequest } from "next/server";
import { tenantSlugFromHost } from "@/lib/tenant";

/**
 * Sublojas de collabs: marca.tumanera.com.br/* é reescrito para /c/marca/*.
 * O domínio principal segue normalmente.
 */
export function proxy(request: NextRequest) {
  const slug = tenantSlugFromHost(request.headers.get("host"));
  if (!slug) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/c/${slug}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};

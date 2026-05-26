import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all paths except for static assets, image optimization,
     * favicon, PWA files, and Next.js internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|manifest.json|sw.js|workbox-.*|icons/|splash/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

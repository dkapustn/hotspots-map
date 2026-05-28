import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/nav/BottomNav";
import { DesktopSidebar } from "@/components/nav/DesktopSidebar";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Структура: горизонтальный flex (Sidebar | main-column).
  // main-column — вертикальный flex с (main + BottomNav).
  // BottomNav — последний ребёнок flex-колонки → у нижней границы.
  //
  // ВАЖНО: используем `fixed inset-0` вместо `h-[100dvh]`.
  // В iOS Safari standalone PWA dvh/vh могут возвращать «безопасную»
  // высоту (без зоны home-indicator), из-за чего layout оказывается
  // ~34px короче реального экрана и BottomNav «парит» над низом.
  // `fixed inset-0` гарантированно занимает весь viewport (через
  // initial containing block) во всех режимах — браузер, standalone PWA,
  // landscape, любые iOS-edge cases.
  return (
    <>
      <div className="fixed inset-0 flex w-full overflow-hidden">
        <DesktopSidebar />
        <main className="relative flex-1 min-w-0 min-h-0 overflow-hidden isolate">{children}</main>
        <BottomNav />
      </div>

      <InstallPrompt />
    </>
  );
}

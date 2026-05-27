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
      {/*
        iOS PWA standalone quirk: `fixed inset-0` (= bottom: 0) на самом
        деле приземляется на верхнюю границу safe-area, а не на дно
        экрана. Из-за этого карта обрывалась за ~34px до низа и в зоне
        home-indicator проглядывал html bg.
        Фикс: явно тянем bottom за safe-area (отрицательное значение),
        чтобы main/map покрывали ВЕСЬ видимый viewport включая зону
        home-indicator.
      */}
      <div
        className="fixed inset-x-0 top-0 flex w-full overflow-hidden"
        style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) * -1)" }}
      >
        <DesktopSidebar />
        <main className="relative flex-1 min-w-0 min-h-0 overflow-hidden isolate">{children}</main>
        <BottomNav />
      </div>

      <InstallPrompt />
    </>
  );
}

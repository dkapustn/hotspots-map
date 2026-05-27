import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/nav/BottomNav";
import { DesktopSidebar } from "@/components/nav/DesktopSidebar";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Структура: горизонтальный flex (Sidebar | main-column).
  // main-column — вертикальный flex с (main + BottomNav).
  // BottomNav теперь НЕ fixed, а последний ребёнок flex-колонки —
  // гарантировано стоит у нижней границы видимой области viewport
  // (в т.ч. в iOS PWA standalone).
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background">
      <DesktopSidebar />
      <div className="relative flex flex-1 flex-col min-w-0 overflow-hidden">
        <main className="relative flex-1 overflow-hidden isolate">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}

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

  return (
    <>
      <div className="fixed inset-0 flex w-full overflow-hidden">
        <DesktopSidebar />
        <main className="relative flex-1 min-w-0 min-h-0 overflow-hidden isolate">
          {children}
        </main>
      </div>

      {/* BottomNav floating над layout, рендерится поверх main */}
      <BottomNav />
      <InstallPrompt />
    </>
  );
}

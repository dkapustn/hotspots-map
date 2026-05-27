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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <DesktopSidebar />
      <main className="relative flex-1 overflow-hidden isolate">{children}</main>
      <BottomNav />
    </div>
  );
}

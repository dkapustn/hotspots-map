import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Настройки" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) redirect("/");

  return (
    <div className="h-full overflow-y-auto pb-28 md:pb-8">
      <div className="mx-auto max-w-2xl px-4 pt-6 md:px-8">
        <h1 className="text-2xl font-bold md:text-3xl">Настройки</h1>
        <p className="mt-1 text-sm text-muted-foreground">Управляйте профилем и поведением приложения.</p>
        <div className="mt-6">
          <SettingsForm initialProfile={profile} email={user.email ?? ""} />
        </div>
      </div>
    </div>
  );
}

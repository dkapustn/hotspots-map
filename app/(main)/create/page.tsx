import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { CreateSpotFlow } from "@/components/create/CreateSpotFlow";

export const metadata: Metadata = { title: "Создать метку" };
export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const isGuest = user.is_anonymous === true;

  return (
    <div className="h-full scroll-area pb-safe-nav">
      <div className="mx-auto max-w-2xl px-4 md:px-8 pt-safe-content">
        <h1 className="text-2xl font-bold md:text-3xl">Новая метка</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Метку можно поставить только в том месте, где вы сейчас находитесь.
        </p>

        {isGuest ? (
          <div className="mt-6 rounded-3xl border bg-card p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <UserPlus className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Только для зарегистрированных</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
              Гости могут просматривать места, но создавать метки можно только
              после регистрации. Это займёт меньше минуты.
            </p>
            <Button asChild className="mt-5">
              <Link href="/login">
                <LogIn className="h-4 w-4" /> Войти или зарегистрироваться
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-6">
            <CreateSpotFlow />
          </div>
        )}
      </div>
    </div>
  );
}

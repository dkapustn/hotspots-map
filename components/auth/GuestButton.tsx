"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";

export function GuestButton({ next = "/" }: { next?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleGuest() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInAnonymously();
    setLoading(false);
    if (error) {
      const isDisabled =
        /anonymous.*disabled/i.test(error.message) ||
        /anonymous.*not.*enabled/i.test(error.message);
      toast.error(isDisabled ? "Гостевой вход выключен" : "Не получилось войти как гость", {
        description: isDisabled
          ? "Включите Anonymous Sign-Ins в Supabase → Authentication → Sign In / Up."
          : error.message,
      });
      return;
    }
    router.replace(next);
    router.refresh();
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="lg"
      className="w-full text-muted-foreground hover:text-foreground"
      onClick={handleGuest}
      disabled={loading}
    >
      {loading ? <Spinner /> : <UserCircle2 className="h-5 w-5" />}
      Войти как гость
    </Button>
  );
}

import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { MapPin } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-500 shadow-xl shadow-primary/30">
          <MapPin className="h-9 w-9 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          С возвращением. Войдите, чтобы открыть карту.
        </p>
      </div>

      <Suspense fallback={<div className="flex justify-center py-8"><Spinner /></div>}>
        <LoginForm />
      </Suspense>

      <p className="text-center text-sm text-muted-foreground">
        Ещё нет аккаунта?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Создать аккаунт
        </Link>
      </p>
    </div>
  );
}

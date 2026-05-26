import { SignupForm } from "./signup-form";
import { MapPin } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-orange-500 shadow-xl shadow-primary/30">
          <MapPin className="h-9 w-9 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Добро пожаловать</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Создайте аккаунт и начните делиться местами.
        </p>
      </div>

      <SignupForm />

      <p className="text-center text-sm text-muted-foreground">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Войти
        </Link>
      </p>

      <p className="text-center text-xs text-muted-foreground">
        Создавая аккаунт вы соглашаетесь с условиями использования {APP_NAME}.
      </p>
    </div>
  );
}

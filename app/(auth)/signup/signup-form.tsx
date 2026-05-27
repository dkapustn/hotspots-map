"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { GoogleIcon } from "@/components/icons/google";
import { GuestButton } from "@/components/auth/GuestButton";

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setLoading(false);
    if (error) {
      toast.error("Не удалось зарегистрироваться", { description: error.message });
      return;
    }
    if (data.user && !data.session) {
      setSent(true);
      return;
    }
    toast.success("Аккаунт создан!");
    router.replace("/");
    router.refresh();
  }

  async function handleGoogle() {
    setGoogleLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setGoogleLoading(false);
      toast.error("Не удалось войти через Google", { description: error.message });
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border bg-card p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-3 text-xl font-semibold">Проверьте почту</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Мы отправили ссылку для подтверждения на <span className="font-medium text-foreground">{email}</span>. Откройте её, чтобы войти.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={handleGoogle}
        disabled={googleLoading}
      >
        {googleLoading ? <Spinner /> : <GoogleIcon className="h-5 w-5" />}
        Войти через Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">или</span>
        </div>
      </div>

      <form onSubmit={handleSignup} className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="username">Имя пользователя</Label>
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              placeholder="alex"
              required
              minLength={3}
              maxLength={24}
              pattern="^[a-zA-Z0-9_.]+$"
              autoComplete="username"
              className="pl-10"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Пароль</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="минимум 6 символов"
              required
              minLength={6}
              autoComplete="new-password"
              className="pl-10"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : <>Создать аккаунт <ArrowRight className="h-4 w-4" /></>}
        </Button>
      </form>

      <div className="pt-2">
        <GuestButton />
      </div>
    </div>
  );
}

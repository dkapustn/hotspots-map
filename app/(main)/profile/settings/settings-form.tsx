"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Camera,
  LogOut,
  Trash2,
  Loader2,
  Sun,
  Moon,
  Monitor,
  Save,
  Palette,
  Map as MapIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { createClient } from "@/lib/supabase/client";
import { AVATARS_BUCKET, BIO_MAX, USERNAME_MAX, USERNAME_MIN } from "@/lib/constants";
import { compressImage } from "@/lib/photo";
import { initials } from "@/lib/utils";
import type { Profile } from "@/lib/types";
import { AccentPicker } from "@/components/settings/AccentPicker";
import { MapStylePicker } from "@/components/settings/MapStylePicker";
import { AvatarCropper } from "@/components/settings/AvatarCropper";

export function SettingsForm({ initialProfile, email }: { initialProfile: Profile; email: string }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [username, setUsername] = useState(initialProfile.username);
  const [bio, setBio] = useState(initialProfile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.avatar_url);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);

  async function handleAvatarUpload(file: File) {
    setUploadingAvatar(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Сессия истекла");

      const compressed = await compressImage(file);
      const path = `${user.id}/avatar-${Date.now()}.jpg`;
      const { error: uploadErr } = await supabase.storage
        .from(AVATARS_BUCKET)
        .upload(path, compressed, { contentType: "image/jpeg", upsert: false });
      if (uploadErr) throw uploadErr;

      const { data } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      toast.success("Аватар обновлён. Не забудьте сохранить.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Не удалось загрузить аватар");
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg =
        err.error === "username_taken"
          ? "Имя пользователя уже занято"
          : err.error ?? "Не удалось сохранить";
      toast.error(msg);
      return;
    }
    toast.success("Сохранено");
    router.refresh();
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  async function handleDeleteAccount() {
    if (!confirm("Удалить аккаунт навсегда? Все ваши метки и комментарии исчезнут.")) return;
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    // Delete profile cascades spots/likes/visits/comments via FK on delete cascade.
    await supabase.from("profiles").delete().eq("id", user.id);
    await supabase.auth.signOut();
    toast.success("Аккаунт удалён");
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Profile */}
      <Card>
        <CardHeader className="flex-row items-start justify-between space-y-0">
          <div className="min-w-0 space-y-1.5">
            <CardTitle>Профиль</CardTitle>
            <CardDescription className="truncate">{email}</CardDescription>
          </div>
          <Button
            size="icon"
            onClick={handleSave}
            disabled={saving}
            aria-label="Сохранить профиль"
            title="Сохранить профиль"
            className="shrink-0"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
              <AvatarFallback className="text-lg">{initials(username)}</AvatarFallback>
            </Avatar>
            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted">
              {uploadingAvatar ? <Spinner /> : <Camera className="h-4 w-4" />}
              {uploadingAvatar ? "Загружаем..." : "Изменить аватар"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setCropFile(f);
                  // Сброс, чтобы повторный выбор того же файла снова сработал.
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          <AvatarCropper
            file={cropFile}
            open={!!cropFile}
            onCancel={() => setCropFile(null)}
            onCropped={(cropped) => {
              setCropFile(null);
              handleAvatarUpload(cropped);
            }}
          />

          <div className="space-y-2">
            <Label htmlFor="username">Имя пользователя</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={USERNAME_MIN}
              maxLength={USERNAME_MAX}
              pattern="^[a-zA-Z0-9_.]+$"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Био</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={BIO_MAX}
              placeholder="Несколько слов о себе"
            />
            <div className="text-right text-xs text-muted-foreground">{bio.length}/{BIO_MAX}</div>
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" /> Оформление
          </CardTitle>
          <CardDescription>Акцентный цвет и тема приложения.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <AccentPicker />

          <div className="space-y-3">
            <Label className="text-sm">Тема оформления</Label>
            <div className="grid grid-cols-3 gap-2">
              <ThemeChoice icon={Sun} label="Светлая" value="light" active={theme === "light"} onClick={setTheme} />
              <ThemeChoice icon={Moon} label="Тёмная" value="dark" active={theme === "dark"} onClick={setTheme} />
              <ThemeChoice icon={Monitor} label="Система" value="system" active={theme === "system" || !theme} onClick={setTheme} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Карта */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapIcon className="h-5 w-5 text-primary" /> Карта
          </CardTitle>
          <CardDescription>Выберите оформление, которое лучше читается.</CardDescription>
        </CardHeader>
        <CardContent>
          <MapStylePicker />
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card>
        <CardHeader>
          <CardTitle>Аккаунт</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="h-4 w-4" /> Выйти из аккаунта
          </Button>
          <Button variant="destructive" className="w-full justify-start" onClick={handleDeleteAccount}>
            <Trash2 className="h-4 w-4" /> Удалить аккаунт навсегда
          </Button>
        </CardContent>
      </Card>

      {/* Map license attribution (вынесено сюда с самой карты для чистоты) */}
      <p className="text-center text-[11px] text-muted-foreground">
        Карты:{" "}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline"
        >
          OpenStreetMap
        </a>{" "}
        ·{" "}
        <a
          href="https://carto.com/attributions"
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-2 hover:underline"
        >
          CARTO
        </a>
      </p>
    </div>
  );
}

function ThemeChoice({
  icon: Icon,
  label,
  value,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  active: boolean;
  onClick: (v: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-colors ${
        active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}


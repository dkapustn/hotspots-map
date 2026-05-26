"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Camera, ImagePlus, MapPin, Loader2, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { compressImage, vibrate } from "@/lib/photo";
import { getCurrentPosition, type Coords } from "@/lib/geo";
import { SPOT_DESCRIPTION_MAX, SPOT_PHOTOS_BUCKET, SPOT_TITLE_MAX } from "@/lib/constants";

export function CreateSpotFlow() {
  const router = useRouter();
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const requestLocation = useCallback(async () => {
    setLocating(true);
    setLocationError(null);
    try {
      const c = await getCurrentPosition();
      setCoords(c);
    } catch (err) {
      setLocationError(err instanceof Error ? err.message : "Ошибка геолокации");
    } finally {
      setLocating(false);
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const handlePhoto = useCallback(async (file: File) => {
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      setPhotoFile(compressed);
      setPhotoPreview(URL.createObjectURL(compressed));
    } catch {
      toast.error("Не удалось обработать фото");
    } finally {
      setCompressing(false);
    }
  }, []);

  async function handleSubmit() {
    if (!coords) {
      toast.error("Сначала разрешите доступ к геолокации");
      return;
    }
    if (!photoFile) {
      toast.error("Добавьте фото места");
      return;
    }
    if (!title.trim()) {
      toast.error("Придумайте короткое название");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Сначала войдите в аккаунт");

      // Upload photo
      const path = `${user.id}/${crypto.randomUUID()}.jpg`;
      const { error: uploadErr } = await supabase.storage
        .from(SPOT_PHOTOS_BUCKET)
        .upload(path, photoFile, { contentType: "image/jpeg", upsert: false });
      if (uploadErr) throw uploadErr;

      // Create spot
      const res = await fetch("/api/spots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          latitude: coords.lat,
          longitude: coords.lng,
          accuracy: coords.accuracy,
          photo_path: path,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Не удалось создать метку");
      }

      const { spot } = await res.json();
      vibrate([10, 40, 30]);
      toast.success("Метка создана!", { description: "Теперь её увидят другие." });
      router.replace(`/spot/${spot.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Что-то пошло не так");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Step 1: geolocation gate */}
      <Card className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="font-medium">Ваше местоположение</div>
            {locating ? (
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Определяем...
              </div>
            ) : coords ? (
              <div className="mt-1 text-sm text-muted-foreground">
                {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                {coords.accuracy ? (
                  <span className="ml-2 text-xs">±{Math.round(coords.accuracy)} м</span>
                ) : null}
              </div>
            ) : (
              <div className="mt-1 text-sm text-destructive">
                {locationError ?? "Геолокация не определена"}
              </div>
            )}
          </div>
          {!coords && !locating && (
            <Button type="button" size="sm" variant="outline" onClick={requestLocation}>
              Повторить
            </Button>
          )}
        </div>
      </Card>

      {/* Step 2: photo */}
      <Card className="p-5">
        <Label className="text-sm font-medium">Фото места</Label>
        <AnimatePresence mode="wait">
          {photoPreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-xl"
            >
              <img src={photoPreview} alt="preview" className="h-full w-full object-cover" />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                onClick={() => {
                  setPhotoFile(null);
                  setPhotoPreview(null);
                }}
                className="absolute right-2 top-2 h-9 w-9 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 grid grid-cols-2 gap-2"
            >
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                <Camera className="h-7 w-7" />
                <span className="text-xs font-medium">Камера</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])}
                />
              </label>
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                <ImagePlus className="h-7 w-7" />
                <span className="text-xs font-medium">Галерея</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])}
                />
              </label>
            </motion.div>
          )}
        </AnimatePresence>
        {compressing && (
          <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Оптимизируем изображение...
          </p>
        )}
      </Card>

      {/* Step 3: title + description */}
      <Card className="p-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Название</Label>
          <Input
            id="title"
            placeholder="Например: Лавочка с видом на закат"
            maxLength={SPOT_TITLE_MAX}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="text-right text-xs text-muted-foreground">
            {title.length}/{SPOT_TITLE_MAX}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Описание (необязательно)</Label>
          <Textarea
            id="description"
            placeholder="Чем место крутое? Как лучше всего туда добраться?"
            maxLength={SPOT_DESCRIPTION_MAX}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="text-right text-xs text-muted-foreground">
            {description.length}/{SPOT_DESCRIPTION_MAX}
          </div>
        </div>
      </Card>

      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={submitting || !coords || !photoFile || !title.trim()}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {submitting ? "Создаём..." : "Поделиться местом"}
      </Button>
    </div>
  );
}

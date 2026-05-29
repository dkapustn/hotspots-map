"use client";
import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cropImageToFile, type PixelCrop } from "@/lib/photo";

/**
 * Модалка кадрирования аватара под круг (drag + pinch/zoom).
 * Получает выбранный File, по подтверждению отдаёт обрезанный квадратный File.
 */
export function AvatarCropper({
  file,
  open,
  onCancel,
  onCropped,
}: {
  file: File | null;
  open: boolean;
  onCancel: () => void;
  onCropped: (cropped: File) => void;
}) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<PixelCrop | null>(null);
  const [processing, setProcessing] = useState(false);

  // Создаём object-URL под выбранный файл и чистим за собой.
  useEffect(() => {
    if (!file) {
      setImageSrc(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_area: Area, areaPx: Area) => {
    setAreaPixels(areaPx);
  }, []);

  async function handleConfirm() {
    if (!imageSrc || !areaPixels) return;
    setProcessing(true);
    try {
      const cropped = await cropImageToFile(imageSrc, areaPixels, 512);
      onCropped(cropped);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-md gap-5">
        <DialogHeader>
          <DialogTitle>Кадрирование аватара</DialogTitle>
          <DialogDescription>
            Перетащите и приблизьте фото, чтобы выбрать область.
          </DialogDescription>
        </DialogHeader>

        {/* Область кропа */}
        <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-black">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              zoomSpeed={0.2}
              minZoom={1}
              maxZoom={4}
              restrictPosition
            />
          )}
        </div>

        {/* Зум */}
        <div className="flex items-center gap-3">
          <ZoomOut className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Slider
            value={[zoom]}
            min={1}
            max={4}
            step={0.01}
            onValueChange={([v]) => setZoom(v ?? 1)}
            aria-label="Масштаб"
          />
          <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={processing}>
            Отмена
          </Button>
          <Button className="flex-1" onClick={handleConfirm} disabled={processing || !areaPixels}>
            {processing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Применить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

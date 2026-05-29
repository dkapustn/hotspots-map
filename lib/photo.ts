import imageCompression from "browser-image-compression";

export async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1.2,
    maxWidthOrHeight: 2000,
    useWebWorker: true,
    fileType: "image/jpeg" as const,
    initialQuality: 0.85,
  };
  try {
    const compressed = await imageCompression(file, options);
    return new File([compressed], `${cryptoRandomId()}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (err) {
    console.error("Compression failed, using original", err);
    return file;
  }
}

export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Обрезает картинку по заданной области (в пикселях исходника) в квадрат
 * `outputSize`×`outputSize` и возвращает JPEG-файл, готовый к загрузке.
 * Используется кроппером аватара (react-easy-crop).
 */
export async function cropImageToFile(
  imageSrc: string,
  crop: PixelCrop,
  outputSize = 512,
): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Не удалось обработать изображение");

  ctx.imageSmoothingQuality = "high";
  // Заливаем фон на случай прозрачных PNG (иначе углы квадрата будут чёрными).
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outputSize, outputSize);
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.9),
  );
  if (!blob) throw new Error("Не удалось обработать изображение");
  return new File([blob], `${cryptoRandomId()}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Не удалось загрузить изображение"));
    img.src = src;
  });
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getPublicPhotoUrl(
  supabaseUrl: string,
  bucket: string,
  path: string,
): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export function vibrate(pattern: number | number[] = 10) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* ignore */
    }
  }
}

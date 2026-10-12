import type { Lang, Text } from "./demo";
import type { AppRouterClient } from "./router-types";
export type Listing = Awaited<ReturnType<AppRouterClient["market"]["catalog"]>>[number];
export type Translate = (ru: string, kz: string, en: string) => string;
export function translator(lang: Lang): Translate {
  return (ru, kz, en) => [ru, kz, en][lang === "ru" ? 0 : lang === "kz" ? 1 : 2];
}
export function localized(text: Text, t: Translate) {
  return t(...text);
}
export async function imageData(file: File) {
  if (file.size > 5 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("JPG / PNG / WEBP · max 5 MB");
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File error"));
    reader.onload = () => {
      const im = new Image();
      im.onerror = () => reject(new Error("Image error"));
      im.onload = () => {
        const canvas = document.createElement("canvas");
        const ratio = Math.min(1, 900 / Math.max(im.width, im.height));
        canvas.width = im.width * ratio;
        canvas.height = im.height * ratio;
        canvas.getContext("2d")?.drawImage(im, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      im.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

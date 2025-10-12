import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatId(id: string | null | undefined, prefix: string) {
  if (!id) return '';
  const clean = String(id).replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const core = clean.slice(0, 8) || clean;
  return `${prefix}-${core}`;
}

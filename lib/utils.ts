import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility to sanitize AI-generated JSON before parsing
export function sanitizeAIJson(raw: string): string {
  // Remove commas in numbers (e.g., 694,000 -> 694000)
  let sanitized = raw.replace(/(\d),(?=\d{3})/g, '$1');
  // Remove trailing commas before } or ]
  sanitized = sanitized.replace(/,\s*([}\]])/g, '$1');
  // Optionally, fix unquoted keys (advanced, not always needed)
  return sanitized;
}

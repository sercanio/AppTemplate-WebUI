import axios from "axios";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.response?.data?.title ||
      error.message
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error) || "An unknown error occurred";
}
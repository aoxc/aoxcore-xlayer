/**
 * @title AOXC Architecture Utility: Tailwind Class Merger
 * @notice Combines clsx and tailwind-merge for conflict-free dynamic styling.
 * @author AOXCAN Security Architecture
 * @dev In an Audit-level UI, this prevents "CSS Bloat" and "Specificity Wars."
 * It ensures that conditionally applied Tailwind classes do not conflict with 
 * base styles, preserving the integrity of the Neural OS design system.
 * * @param inputs - Array of class names, objects, or conditional expressions.
 * @returns Optimized tailwind class string.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @dev Standard utility for merging Tailwind CSS classes with full support
 * for conditional logic and override resolution.
 * * Example usage:
 * cn("p-4 bg-black", isOnline ? "bg-emerald-500" : "bg-rose-500")
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @title Forensic Formatter: Token Units
 * @notice Standardizes display of AOXC and Ether values across the OS.
 */
export const formatCryptoValue = (value: string | number, decimals: number = 2) => {
  if (typeof value === 'string') value = parseFloat(value);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * @title Neural Pulse Generator
 * @notice Generates a timestamp-based ID for transient system logs.
 */
export const generateTraceId = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

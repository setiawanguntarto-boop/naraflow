/**
 * Rule-based Intent Detector
 * Fast keyword matching for intent detection without API calls
 */

import { Intent } from "./types";

/**
 * Detect intent from natural language prompt using keyword matching
 */
export function detectIntent(prompt: string): Intent {
  const lower = prompt.toLowerCase();

  // WhatsApp data entry pattern
  const whatsappKeywords = ["whatsapp", "wa", "chat"];
  const entryKeywords = ["input", "data", "form", "simpan", "save", "masukkan"];
  const whatsappEntryScore =
    (whatsappKeywords.some(kw => lower.includes(kw)) ? 1 : 0) +
    (entryKeywords.some(kw => lower.includes(kw)) ? 1 : 0);

  if (whatsappEntryScore >= 2) {
    return {
      type: "whatsapp_data_entry",
      confidence: Math.min(0.95, 0.5 + whatsappEntryScore * 0.15),
      rawPrompt: prompt,
    };
  }

  // Notification pattern
  const notificationKeywords = [
    "notif",
    "notification",
    "alert",
    "reminder",
    "kabar",
    "pemberitahuan",
  ];
  if (notificationKeywords.some(kw => lower.includes(kw))) {
    return {
      type: "data_processing",
      confidence: 0.85,
      rawPrompt: prompt,
    };
  }

  // Data processing pattern
  const processingKeywords = ["proses", "olah", "process", "transform", "konversi"];
  if (processingKeywords.some(kw => lower.includes(kw))) {
    return {
      type: "data_processing",
      confidence: 0.75,
      rawPrompt: prompt,
    };
  }

  // Default: general workflow automation
  return {
    type: "workflow_automation",
    confidence: 0.6,
    rawPrompt: prompt,
  };
}

/**
 * LLM Entity Extractor
 * Extracts structured entities from natural language with LLM fallback to regex
 */

import { ExtractedEntity } from "./types";
import { Intent } from "./types";
import { getCachedEntityExtraction, cacheEntityExtraction, promptCache } from "./cacheService";

// Get OpenAI API key from environment (if available)
const getOpenAIKey = () => {
  if (typeof window !== 'undefined') {
    return (window as any).OPENAI_API_KEY || localStorage.getItem('openai_api_key');
  }
  return null;
};

/**
 * Extract entities from prompt using LLM with regex fallback
 */
export async function extractEntities(
  prompt: string,
  intent: Intent,
  llmProvider?: "openai" | "llama" | "none"
): Promise<ExtractedEntity[]> {
  console.log("🔍 [Entity Extractor] Starting...", {
    intentType: intent.type,
    llmProvider,
    promptLength: prompt.length
  });

  // Check cache first
  const cached = getCachedEntityExtraction(prompt, intent.type);
  if (cached) {
    console.log("✅ [Entity Extractor] Cache hit");
    return cached;
  }

  let entities: ExtractedEntity[] = [];

  // Try LLM extraction if provider is available
  if (llmProvider && llmProvider !== "none") {
    try {
      console.log("🤖 [Entity Extractor] Using LLM extraction");
      entities = await extractWithLLM(prompt, intent, llmProvider);

      // Validate and fallback to regex if LLM returns invalid results
      if (entities.length === 0 || !isValidEntityArray(entities)) {
        console.log("⚠️ [Entity Extractor] LLM returned invalid results, using regex fallback");
        entities = extractWithRegex(prompt, intent);
      }
    } catch (error) {
      console.warn("❌ [Entity Extractor] LLM failed, using regex fallback:", error);
      entities = extractWithRegex(prompt, intent);
    }
  } else {
    console.log("📝 [Entity Extractor] Using regex extraction (no LLM provider)");
    entities = extractWithRegex(prompt, intent);
  }

  console.log(`✅ [Entity Extractor] Extracted ${entities.length} entities`);

  // Cache results
  cacheEntityExtraction(prompt, intent.type, entities);

  return entities;
}

/**
 * Extract entities using LLM (OpenAI or LLaMA)
 */
async function extractWithLLM(
  prompt: string,
  intent: Intent,
  provider: "openai" | "llama"
): Promise<ExtractedEntity[]> {
  const systemPrompt = `Extract data fields from the following Indonesian/English natural language prompt.

Return a JSON array of objects with this structure:
[
  {
    "field": "field_name",
    "type": "text|number|phone|email|date",
    "required": true,
    "validation": ["required"]
  }
]

Only extract relevant fields that need to be collected from users.`;

  const userPrompt = `Extract fields from: "${prompt}"

Intent type: ${intent.type}
Return only valid JSON array, no additional text.`;

  if (provider === "openai") {
    return await extractWithOpenAI(systemPrompt, userPrompt);
  } else {
    // LLama or other providers - fallback to regex for now
    console.warn("LLama provider not fully implemented, using regex");
    return [];
  }
}

/**
 * Extract entities using OpenAI API
 */
async function extractWithOpenAI(
  systemPrompt: string,
  userPrompt: string
): Promise<ExtractedEntity[]> {
  const apiKey = getOpenAIKey();
  
  if (!apiKey) {
    console.warn("OpenAI API key not found, cannot use LLM extraction");
    throw new Error("OpenAI API key not configured");
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.1,
        max_tokens: 500,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse JSON response
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code block
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Failed to parse JSON from LLM response");
      }
    }

    // Handle both array and object with array property
    const entities = Array.isArray(parsed) ? parsed : parsed.fields || parsed.entities || [];

    // Validate structure
    if (!isValidEntityArray(entities)) {
      console.warn("Invalid entity structure from LLM");
      return [];
    }

    console.log(`✅ LLM extracted ${entities.length} entities`);
    return entities;

  } catch (error: any) {
    console.error("OpenAI extraction failed:", error.message);
    throw error;
  }
}

/**
 * Extract entities using regex patterns (fallback method)
 */
function extractWithRegex(prompt: string, intent: Intent): ExtractedEntity[] {
  const entities: ExtractedEntity[] = [];
  const lower = prompt.toLowerCase();

  // Field name patterns (Indonesian and English)
  const fieldPatterns = [
    /(nama|name)[\s:]+([a-z\s]+?)(?:\s|dan|,|$)/i,
    /(nomor|number|no)[\s]+([a-z\s]+?)(?:\s|dan|,|$)/i,
    /(hp|phone|telepon)[\s:]+([a-z\s]+?)(?:\s|dan|,|$)/i,
    /(email)[\s:]+([a-z\s]+?)(?:\s|dan|,|$)/i,
    /(tanggal|date)[\s:]+([a-z\s]+?)(?:\s|dan|,|$)/i,
    /(luas|area|size)[\s:]+([a-z\s]+?)(?:\s|dan|,|$)/i,
  ];

  // Extract field names
  const lines = prompt.split(/\s*(dan|lalu|kemudian|then|and)\s*/i);

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.length < 2) continue;

    // Skip common verbs and connectors
    if (/^(buat|create|input|save|simpan|kirim|send)$/i.test(trimmed)) continue;

    // Extract field name (simplified: take first word as field name)
    const words = trimmed.split(/\s+/);
    const fieldName = words[0];

    if (fieldName && fieldName.length > 1) {
      const fieldType = guessFieldType(fieldName);
      entities.push({
        field: fieldName.toLowerCase(),
        type: fieldType,
        required: true,
        validation: inferValidation(fieldName),
      });
    }
  }

  // Alternative: try to extract from explicit mentions like "nama, HP, email"
  const explicitMentionPattern = /(?:dan\s+)?([a-z]+)(?:\s*,\s*)?/gi;
  const explicitMatches = prompt.match(explicitMentionPattern);

  if (explicitMatches && explicitMatches.length > 0) {
    for (const match of explicitMatches) {
      const fieldName = match.trim().replace(/,/g, "");
      if (fieldName && fieldName.length > 1 && !entities.find(e => e.field === fieldName)) {
        entities.push({
          field: fieldName.toLowerCase(),
          type: guessFieldType(fieldName),
          required: true,
          validation: inferValidation(fieldName),
        });
      }
    }
  }

  // Remove duplicates
  const uniqueEntities = Array.from(new Map(entities.map(e => [e.field, e])).values());

  return uniqueEntities;
}

/**
 * Guess field type from field name
 */
function guessFieldType(fieldName: string): ExtractedEntity["type"] {
  const lower = fieldName.toLowerCase();

  if (
    lower.includes("hp") ||
    lower.includes("phone") ||
    lower.includes("telepon") ||
    lower.includes("nomor")
  ) {
    return "phone";
  }

  if (lower.includes("email") || lower.includes("mail")) {
    return "email";
  }

  if (lower.includes("tanggal") || lower.includes("date") || lower.includes("tgl")) {
    return "date";
  }

  if (
    lower.includes("luas") ||
    lower.includes("jumlah") ||
    lower.includes("jumlah") ||
    /\d/.test(fieldName)
  ) {
    return "number";
  }

  return "text";
}

/**
 * Infer validation rules from field name
 */
function inferValidation(fieldName: string): string[] {
  const validations: string[] = ["required"];
  const lower = fieldName.toLowerCase();

  if (lower.includes("hp") || lower.includes("phone")) {
    validations.push("phone");
  }

  if (lower.includes("email")) {
    validations.push("email");
  }

  if (lower.includes("luas") || lower.includes("jumlah")) {
    validations.push("number");
    validations.push("min:1");
  }

  return validations;
}

/**
 * Validate that entity array is properly structured
 */
function isValidEntityArray(entities: any[]): boolean {
  if (!Array.isArray(entities)) return false;

  return entities.every(
    entity =>
      typeof entity === "object" &&
      entity.field &&
      entity.type &&
      typeof entity.required === "boolean"
  );
}

/**
 * Clear extraction cache (useful for testing)
 */
export function clearExtractionCache(): void {
  promptCache.clear();
}

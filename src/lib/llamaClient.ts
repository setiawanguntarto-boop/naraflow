export async function generateWorkflowFromPrompt(
  endpoint: string,
  prompt: string,
  apiKey?: string,
  mode: "local" | "cloud" = "local"
) {
  // Example minimal body — adapt to your LLaMA endpoint contract.
  const url =
    mode === "local" ? `${endpoint.replace(/\/$/, "")}/api/generate` : `${endpoint}/v1/completions`;

  const body =
    mode === "local"
      ? JSON.stringify({
          prompt: `Generate workflow JSON for this: ${prompt}`,
          max_tokens: 800,
          stream: false,
        })
      : JSON.stringify({
          model: "llama3-70b",
          prompt: `Generate workflow JSON for this: ${prompt}`,
          max_tokens: 800,
        });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  const res = await fetch(url, {
    method: "POST",
    body,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`LLaMA API Error: ${res.status} ${errorText}`);
  }

  const text = await res.text(); // we want raw text as proof

  // Attempt parse:
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    parsed = null;
  }

  return { raw: text, parsed };
}

export async function detectLocalLlama(
  endpoint: string = "http://localhost:11434"
): Promise<boolean> {
  try {
    const res = await fetch(`${endpoint}/api/models`, {
      method: "GET",
      signal: AbortSignal.timeout(3000), // 3 second timeout
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function pingLlama(
  endpoint: string,
  apiKey?: string,
  mode: "local" | "cloud" = "local"
) {
  // Try a minimal health/model info request.
  try {
    const url =
      mode === "local"
        ? `${endpoint.replace(/\/$/, "")}/api/models` // Ollama example
        : `${endpoint.replace(/\/$/, "")}/v1/models`; // Cloud pseudo

    const headers: Record<string, string> = {};
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const res = await fetch(url, {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status} ${text}`);
    }

    const json = await res.json();

    // For Ollama/local: json might be array; extract first name
    const modelName = Array.isArray(json)
      ? json[0]?.model || json[0]?.name || JSON.stringify(json)
      : json.model || json.name || JSON.stringify(json);

    return { ok: true, model: modelName };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

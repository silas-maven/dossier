import type { AiProviderConfig } from "@/lib/ai/types";

const JSON_INSTRUCTION = "Return only valid JSON matching the requested schema.";

export const callOpenAiCompatible = async ({
  provider,
  apiKey,
  model,
  system,
  user,
  jsonMode = true
}: {
  provider: AiProviderConfig;
  apiKey: string;
  model: string;
  system: string;
  user: string;
  jsonMode?: boolean;
}) => {
  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
      ...(provider.id === "openrouter"
        ? {
            "HTTP-Referer": "https://www.your-dossier.xyz",
            "X-Title": "Dossier CV Builder"
          }
        : {})
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
      messages: [
        { role: "system", content: system },
        { role: "user", content: jsonMode ? `${JSON_INSTRUCTION}\n\n${user}` : user }
      ]
    })
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Provider request failed: ${errorText}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return json.choices?.[0]?.message?.content ?? "";
};

export const callAnthropic = async ({
  provider,
  apiKey,
  model,
  system,
  user,
  jsonMode = true
}: {
  provider: AiProviderConfig;
  apiKey: string;
  model: string;
  system: string;
  user: string;
  jsonMode?: boolean;
}) => {
  const res = await fetch(`${provider.baseUrl}/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model,
      max_tokens: 1800,
      temperature: 0.2,
      system,
      messages: [{ role: "user", content: jsonMode ? `${JSON_INSTRUCTION}\n\n${user}` : user }]
    })
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Provider request failed: ${errorText}`);
  }
  const json = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  return json.content?.find((part) => part.type === "text")?.text ?? "";
};

export const callGemini = async ({
  provider,
  apiKey,
  model,
  system,
  user,
  jsonMode = true
}: {
  provider: AiProviderConfig;
  apiKey: string;
  model: string;
  system: string;
  user: string;
  jsonMode?: boolean;
}) => {
  const url = `${provider.baseUrl}/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      generationConfig: {
        temperature: 0.2,
        ...(jsonMode ? { responseMimeType: "application/json" } : {})
      },
      contents: [
        {
          role: "user",
          parts: [{ text: jsonMode ? `${system}\n\n${JSON_INSTRUCTION}\n\n${user}` : `${system}\n\n${user}` }]
        }
      ]
    })
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Provider request failed: ${errorText}`);
  }
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  return json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
};

export const callCohere = async ({
  provider,
  apiKey,
  model,
  system,
  user,
  jsonMode = true
}: {
  provider: AiProviderConfig;
  apiKey: string;
  model: string;
  system: string;
  user: string;
  jsonMode?: boolean;
}) => {
  const res = await fetch(`${provider.baseUrl}/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: jsonMode ? `${JSON_INSTRUCTION}\n\n${user}` : user }
      ]
    })
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Provider request failed: ${errorText}`);
  }
  const json = (await res.json()) as {
    message?: { content?: Array<{ text?: string }> };
  };
  return json.message?.content?.[0]?.text ?? "";
};

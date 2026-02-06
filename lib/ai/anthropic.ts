import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
// API key should be in ANTHROPIC_API_KEY environment variable
const anthropic = new Anthropic();

// Model configuration for cost optimization
export const MODELS = {
  fast: "claude-3-5-haiku-20241022", // Cheapest, fastest - quick tasks
  balanced: "claude-sonnet-4-5-20250514", // Good balance - most tasks
  powerful: "claude-opus-4-5-20250514", // Most capable - complex reasoning
} as const;

export type ModelTier = keyof typeof MODELS;

/**
 * Generate a response using Claude
 */
export async function generateResponse(
  prompt: string,
  options: {
    model?: ModelTier;
    maxTokens?: number;
    systemPrompt?: string;
  } = {}
): Promise<string> {
  const { model = "fast", maxTokens = 1024, systemPrompt } = options;

  const response = await anthropic.messages.create({
    model: MODELS[model],
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text || "";
}

/**
 * Generate creator bio/description
 */
export async function generateCreatorBio(
  creatorName: string,
  topics: string[],
  existingInfo?: string
): Promise<string> {
  const prompt = `Write a concise, respectful 2-3 sentence bio for Islamic scholar "${creatorName}".
Topics they cover: ${topics.join(", ")}
${existingInfo ? `Existing info: ${existingInfo}` : ""}

Keep it factual and professional. Do not make up credentials or affiliations.`;

  return generateResponse(prompt, {
    model: "balanced",
    maxTokens: 200,
    systemPrompt:
      "You write respectful, accurate bios for Islamic scholars. Be concise and factual.",
  });
}

/**
 * Generate content recommendations
 */
export async function getContentRecommendations(
  userInterests: string[],
  followedCreators: string[],
  availableCreators: { name: string; topics: string[] }[]
): Promise<string[]> {
  const prompt = `Based on user interests: ${userInterests.join(", ")}
They follow: ${followedCreators.join(", ")}

Available creators:
${availableCreators.map((c) => `- ${c.name}: ${c.topics.join(", ")}`).join("\n")}

Recommend 3-5 creators they might like. Return only the names, one per line.`;

  const response = await generateResponse(prompt, {
    model: "fast",
    maxTokens: 100,
    systemPrompt: "You recommend Islamic scholars based on user interests. Be brief.",
  });

  return response.split("\n").filter((line) => line.trim());
}

/**
 * Summarize content (videos, podcasts, articles)
 */
export async function summarizeContent(
  title: string,
  description: string,
  contentType: "video" | "podcast" | "article"
): Promise<string> {
  const prompt = `Summarize this ${contentType} in 1-2 sentences:
Title: ${title}
Description: ${description}

Keep it informative and concise.`;

  return generateResponse(prompt, {
    model: "fast",
    maxTokens: 100,
  });
}

/**
 * Chat completion for interactive features
 */
export async function chat(
  messages: { role: "user" | "assistant"; content: string }[],
  options: {
    model?: ModelTier;
    maxTokens?: number;
    systemPrompt?: string;
  } = {}
): Promise<string> {
  const { model = "balanced", maxTokens = 1024, systemPrompt } = options;

  const response = await anthropic.messages.create({
    model: MODELS[model],
    max_tokens: maxTokens,
    system: systemPrompt,
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  return textBlock?.text || "";
}

/**
 * Stream a response (for real-time UI)
 */
export async function* streamResponse(
  prompt: string,
  options: {
    model?: ModelTier;
    maxTokens?: number;
    systemPrompt?: string;
  } = {}
): AsyncGenerator<string> {
  const { model = "balanced", maxTokens = 1024, systemPrompt } = options;

  const stream = anthropic.messages.stream({
    model: MODELS[model],
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: prompt }],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

export default anthropic;

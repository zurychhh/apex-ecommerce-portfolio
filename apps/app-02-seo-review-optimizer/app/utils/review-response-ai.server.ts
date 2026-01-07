import Anthropic from "@anthropic-ai/sdk";

/**
 * ReviewBoost AI Response Generator
 *
 * Uses Claude (Haiku model) to generate professional review responses
 * tailored to the review sentiment and brand voice.
 */

let anthropic: Anthropic | null = null;

function getAnthropicClient(): Anthropic {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropic;
}

export type ResponseTone = "professional" | "friendly" | "apologetic";

export interface GenerateResponseOptions {
  review: {
    author: string;
    rating: number;
    title?: string | null;
    body: string;
    productTitle: string;
  };
  tone: ResponseTone;
  brandVoice?: string | null;
  storeName?: string;
}

export interface GenerateResponseResult {
  responseBody: string;
  tokensUsed: number;
}

/**
 * Generate an AI-powered response to a product review
 */
export async function generateReviewResponse(
  options: GenerateResponseOptions
): Promise<GenerateResponseResult> {
  const { review, tone, brandVoice, storeName } = options;

  const client = getAnthropicClient();

  // Build the prompt
  const prompt = buildPrompt(review, tone, brandVoice, storeName);

  try {
    const response = await client.messages.create({
      model: "claude-3-haiku-20240307", // Cost-efficient model
      max_tokens: 512, // Responses should be concise
      temperature: 0.7, // Some creativity but consistent
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const responseBody = extractTextFromResponse(response);
    const tokensUsed = response.usage.input_tokens + response.usage.output_tokens;

    return { responseBody, tokensUsed };

  } catch (error: any) {
    // CRITICAL: Log full error body (lesson from ConversionAI)
    console.error("[ReviewBoost] Claude API error:", {
      message: error.message,
      status: error.status,
      type: error.type,
      body: JSON.stringify(error.error || error.body || {}),
    });
    throw error;
  }
}

/**
 * Build the prompt for Claude
 */
function buildPrompt(
  review: GenerateResponseOptions["review"],
  tone: ResponseTone,
  brandVoice?: string | null,
  storeName?: string
): string {
  const toneDescription = getToneDescription(tone);
  const sentimentType = getSentimentFromRating(review.rating);

  return `You are a customer service specialist for an ecommerce store.
Generate a response to this product review.

STORE CONTEXT:
- Store name: ${storeName || "our store"}
- Brand voice: ${brandVoice || toneDescription}

REVIEW:
- Product: ${review.productTitle}
- Rating: ${review.rating}/5 stars
- Reviewer: ${review.author}
${review.title ? `- Title: "${review.title}"` : ""}
- Review: "${review.body}"

TONE TO USE: ${tone}

IMPORTANT RULES:
- Keep response 2-4 sentences maximum
- ${getResponseGuidelines(sentimentType)}
- Never be defensive or dismissive
- Never offer specific discounts or refunds (legal reasons)
- Sound human and genuine, not robotic
- Match the review language style (if casual, be casual; if formal, be formal)
- Address the reviewer by name if appropriate

OUTPUT ONLY the review response text. No explanations, no meta-commentary, no quotation marks around the response.`;
}

/**
 * Get tone description for the prompt
 */
function getToneDescription(tone: ResponseTone): string {
  switch (tone) {
    case "professional":
      return "Professional and courteous, maintaining a polished business tone";
    case "friendly":
      return "Warm and conversational, like talking to a friend who genuinely cares";
    case "apologetic":
      return "Empathetic and solution-focused, expressing genuine concern and offering help";
    default:
      return "Professional and friendly";
  }
}

/**
 * Get sentiment category from rating
 */
function getSentimentFromRating(rating: number): "positive" | "neutral" | "negative" {
  if (rating >= 4) return "positive";
  if (rating === 3) return "neutral";
  return "negative";
}

/**
 * Get specific guidelines based on sentiment
 */
function getResponseGuidelines(sentiment: "positive" | "neutral" | "negative"): string {
  switch (sentiment) {
    case "positive":
      return "Thank them warmly, acknowledge specific praise they gave, invite them to shop again or try other products";
    case "neutral":
      return "Thank them for honest feedback, acknowledge both positives and concerns, offer to help improve their experience";
    case "negative":
      return "Apologize sincerely for their experience, acknowledge their specific issues without excuses, offer to resolve via email/support";
  }
}

/**
 * Extract text from Claude response
 */
function extractTextFromResponse(response: Anthropic.Messages.Message): string {
  const textContent = response.content
    .filter((block): block is Anthropic.Messages.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n\n")
    .trim();

  return textContent;
}

/**
 * Estimate cost of generating a response
 * Claude 3 Haiku pricing: $0.25 / 1M input tokens, $1.25 / 1M output tokens
 */
export function estimateResponseCost(tokensUsed: number): number {
  // Approximate: ~300 input + ~100 output tokens per response
  const inputCost = (300 / 1_000_000) * 0.25;
  const outputCost = (100 / 1_000_000) * 1.25;
  return inputCost + outputCost; // ~$0.0002 per response
}

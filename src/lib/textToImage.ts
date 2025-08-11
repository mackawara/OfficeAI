import OpenAI from "openai";
import { logger } from "./logger";
import fs from "fs";

// Simplified single OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Enhance an image prompt using OpenAI in a minimal way
export const enhancePrompt = async (original: string): Promise<string> => {
  const trimmed = (original || "").trim();
  if (!trimmed) return "";

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      instructions:
        "Rewrite the user's prompt into an optimized 1–3 sentence prompt for image generation. Preserve intent but add concrete visual details (subject, scene, composition, style, lighting, mood, color palette, medium, camera/lens when helpful). Avoid brands, copyrighted characters, logos, text overlays, and watermarks. Only return the improved prompt.",
      input: trimmed,
    });

    const enhanced = (response as any)?.output_text;
    return typeof enhanced === "string" && enhanced.trim() ? enhanced.trim() : trimmed;
  } catch (err) {
    logger.warn("Prompt enhancement failed, using original prompt", err);
    return trimmed;
  }
};

// Shared image save helper
const saveImage = (imageBase64: string) => {
  const imagesDir = "images";
  if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);
  const fileName = `image_${imageBase64.slice(-4)}.png`;
  const imagePath = `${imagesDir}/${fileName}`;
  fs.writeFileSync(imagePath, Buffer.from(imageBase64, "base64"));
  return imagePath;
};

type ImageGenOutput = {
  type: string;
  result?: string;
  [key: string]: unknown;
};

type HasId = { id?: string };

export const openAiImageGeneration = async (
  prompt: string
): Promise<{ imageUrl: string | null; responseId: string | null }> => {
  try {
    logger.info(`Generating image with prompt: ${prompt}`);
    if (!prompt) {
      throw new Error("Prompt is required for image generation");
    }

    // Enhance the prompt first
    const enhanced = await enhancePrompt(prompt);
    logger.info(`Enhanced prompt: ${enhanced}`);

    const response = await openai.responses.create({
      model: "gpt-5",
      input: enhanced,
      
      tools: [{ type: "image_generation" }],
    });

    const outputs = (
      (response as unknown as { output?: ImageGenOutput[] })?.output ?? []
    );

    const imageData = outputs
      .filter(
        (output) =>
          output?.type === "image_generation_call" &&
          typeof output?.result === "string"
      )
      .map((output) => output.result as string);

    if (imageData.length > 0) {
      const imageBase64 = imageData[0];
      saveImage(imageBase64);
    }

    const responseId = (response as { id?: string } | undefined)?.id ?? null;
    logger.info(
      `Image generation completed: success=${Boolean(imageData[0])}, responseId=${responseId}`
    );

    return { imageUrl: imageData[0] ?? null, responseId };
  } catch (error) {
    logger.error("Error generating image:", error);
    throw error;
  }
};

export const openAiImageGenerationFollowUp = async (
  prompt: string,
  responseId: string
): Promise<{ imageUrl: string | null; responseId: string | null }> => {
  logger.info(`Generating image enhancement with prompt: ${prompt} on response ID: ${responseId}`);
  try {
    if (!responseId || !prompt) {
      throw new Error(
        "Response ID and prompt are required for follow-up image generation"
      );
    }

    // Enhance the prompt for follow-up as well
    const enhanced = await enhancePrompt(prompt);
    logger.info(`Enhanced follow-up prompt: ${enhanced}`);

    const responseFwup = await openai.responses.create({
      model: "gpt-5",
      previous_response_id: responseId,
      input: enhanced,
      tools: [{ type: "image_generation" }],
    });

    const outputs = (
      (responseFwup as unknown as { output?: ImageGenOutput[] })?.output ?? []
    );

    const imageData = outputs
      .filter(
        (output) =>
          output?.type === "image_generation_call" &&
          typeof output?.result === "string"
      )
      .map((output) => output.result as string);

    if (imageData.length > 0) {
      const imageBase64 = imageData[0];
      saveImage(imageBase64);
    }

    const followUpResponseId = (responseFwup as { id?: string } | undefined)?.id ?? null;
    logger.info(
      `Follow-up image generation completed: success=${Boolean(imageData[0])}, responseId=${followUpResponseId}`
    );

    return { imageUrl: imageData[0] ?? null, responseId: followUpResponseId };
  } catch (error) {
    logger.error("Error generating follow-up image:", error);
    throw error;
  }
};

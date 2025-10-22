
import { GoogleGenAI, Modality, Part } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts a File object to a GoogleGenAI.Part object.
 * @param file The image file to convert.
 * @returns A promise that resolves to a Part object.
 */
export function fileToGenerativePart(file: File): Promise<Part> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("File could not be read as a data URL."));
      }
      // Split the data URL to get the base64 part
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}


/**
 * Calls the Gemini API to edit an image based on a prompt.
 * @param imageParts The image data as an array of Part objects. The first part is the main image.
 * @param prompt The text prompt describing the desired edit.
 * @returns A promise that resolves to the base64 string of the edited image.
 */
export async function editImage(imageParts: Part[], prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          ...imageParts,
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const candidate = response.candidates?.[0];

    // Check if the response was blocked due to safety or other reasons
    if (!candidate || !candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      let reason = "The AI model did not return an image.";
      const finishReason = candidate?.finishReason;
      const blockReason = response.promptFeedback?.blockReason;

      if (finishReason === 'IMAGE_RECITATION' || finishReason === 'RECITATION') {
        reason = "The AI couldn't generate a unique image. This can happen if the result is too similar to a copyrighted image. Please try a more descriptive or different prompt.";
      } else if (finishReason === 'SAFETY') {
        reason = `Your request was blocked for safety reasons. Please try a different image or prompt. (Details: ${blockReason || 'Not provided'})`;
      } else if (finishReason) {
        reason += ` (Reason: ${finishReason})`;
      } else if (blockReason) {
         reason += ` The model blocked the request due to: ${blockReason}.`;
      }

      throw new Error(reason);
    }
    
    // Find the image part in the response
    const imageResultPart = candidate.content.parts.find(
      (part) => part.inlineData
    );

    if (imageResultPart?.inlineData?.data) {
      return imageResultPart.inlineData.data;
    } else {
      // This is a fallback for the case where we get content, but it's not an image.
      throw new Error("The AI model's response did not contain a valid image.");
    }
  } catch (error) {
    console.error("Error editing image with Gemini API:", error);
    if (error instanceof Error) {
      throw error;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
        throw new Error(String((error as {message: unknown}).message));
    }
    throw new Error("An unexpected error occurred while editing the image.");
  }
}

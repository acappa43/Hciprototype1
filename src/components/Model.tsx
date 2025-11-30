import { createPartFromUri, GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

// In-memory map for uploaded files (do not persist URIs to app state)
const uploadedFilesMap = new Map<string, { name: string; uri?: string; mimeType?: string }>();

export async function uploadLocalFile(file: File) {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    throw new Error("Missing VITE_GEMINI_API_KEY in environment.");
  }

  // Upload file blob to GenAI
  const uploaded = await genAI.files.upload({
    file,
    config: {
      displayName: file.name,
    },
  });

  // Poll until processed
  let fetched = await genAI.files.get({ name: uploaded.name });
  while (fetched.state === "PROCESSING") {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    fetched = await genAI.files.get({ name: uploaded.name });
  }

  if (fetched.state === "FAILED") {
    throw new Error("File processing failed.");
  }

  // Save metadata to internal map (used when building generateContent parts)
  uploadedFilesMap.set(file.name, {
    name: fetched.name,
    uri: fetched.uri,
    mimeType: fetched.mimeType,
  });

  return { name: fetched.name, mimeType: fetched.mimeType };
}

export async function generateWithSources(prompt: string, sources: { name: string; content: string }[]) {
  const contents: any[] = [prompt];

  for (const s of sources) {
    const meta = uploadedFilesMap.get(s.name);
    if (meta?.uri && meta?.mimeType) {
      contents.push(createPartFromUri(meta.uri, meta.mimeType));
    } else {
      contents.push(s.content);
    }
  }

  const response = await genAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents,
  });

  return response.text;
}

export const response = async (prompt: string) => {
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text;
}

export const Model = {
  response,
  uploadLocalFile,
  generateWithSources
};

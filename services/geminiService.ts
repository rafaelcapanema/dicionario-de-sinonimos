
import { GoogleGenAI, Type } from "@google/genai";
import { SynonymResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const synonymSchema = {
  type: Type.OBJECT,
  properties: {
    primary: {
      type: Type.STRING,
      description: 'O melhor e mais exato sinônimo para a palavra fornecida.',
    },
    topFive: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Uma lista de até 5 sinônimos muito bons e comuns.',
    },
    others: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Todos os outros sinônimos possíveis, dos menos comuns aos literários.',
    },
  },
  required: ['primary', 'topFive', 'others'],
  propertyOrdering: ["primary", "topFive", "others"],
};

export const fetchSynonyms = async (word: string): Promise<SynonymResponse> => {
  if (!word.trim()) throw new Error("Palavra vazia");

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Forneça sinônimos em português do Brasil para a palavra: "${word}".`,
    config: {
      systemInstruction: "Você é um dicionário de sinônimos especializado em português do Brasil. Sua tarefa é fornecer sinônimos precisos, organizados por relevância. Identifique o sinônimo mais exato (primary), os top 5 mais comuns (topFive) e todos os outros sinônimos menos comuns (others). IMPORTANTE: Retorne todos os sinônimos estritamente em letras minúsculas.",
      responseMimeType: "application/json",
      responseSchema: synonymSchema,
    },
  });

  try {
    const data = JSON.parse(response.text);
    return data as SynonymResponse;
  } catch (err) {
    console.error("Erro ao processar JSON:", err);
    throw new Error("Falha ao processar os dados do dicionário.");
  }
};

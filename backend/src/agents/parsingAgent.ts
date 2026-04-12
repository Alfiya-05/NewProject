import { openrouterClient, AI_MODEL } from '../config/openrouter';

export interface ParsedFIR {
  parties: string[];
  date: string;
  location: string;
  offenceDescription: string;
  firNumber: string | null;
  policeStation: string | null;
  ipcSectionsRaw: string[];
}

export async function parseFIR(firText: string): Promise<ParsedFIR> {
  const response = await openrouterClient.chat.completions.create({
    model: AI_MODEL,
    max_tokens: 100,
    messages: [
      {
        role: 'user',
        content: `You are a legal document parser for Indian courts. Extract structured data from this FIR document.

FIR CONTENT:
${firText}

Return ONLY a valid JSON object with these exact fields:
{
  "parties": ["complainant name", "accused name"],
  "date": "DD/MM/YYYY",
  "location": "full location string",
  "offenceDescription": "plain text description of the offence",
  "firNumber": "FIR number if present or null",
  "policeStation": "police station name if present or null",
  "ipcSectionsRaw": ["any IPC/BNS sections mentioned in the document"]
}

Return nothing else — only the JSON object.`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? '{}';
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim()) as ParsedFIR;
  } catch {
    console.error('Failed to parse FIR AI response:', text);
    return {
      parties: [],
      date: '',
      location: '',
      offenceDescription: firText,
      firNumber: null,
      policeStation: null,
      ipcSectionsRaw: [],
    };
  }
}

import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/lsc-search', async (req: Request, res: Response) => {
    const query = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
    if (!query) {
      res.status(400).json({ error: 'Escribe una consulta sobre Lengua de Señas Colombiana.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: 'El servicio de consulta web no está disponible porque falta configurar la clave en Settings > Secrets.',
      });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Consulta sobre Lengua de Señas Colombiana (LSC): ${query}`,
        config: {
          systemInstruction:
            'Eres un investigador y pedagogo experto en Lengua de Señas Colombiana (LSC), diccionario del INSOR (Instituto Nacional para Sordos de Colombia), variaciones regionales (Bogotá, Medellín, Cali, Caribe) y cultura sorda en Colombia. Responde siempre en español claro, preciso y estructurado, diferenciando entre variaciones regionales o parámetros (forma de la mano, ubicación, movimiento, expresión facial) cuando aplique. Usa los resultados de búsqueda web para fundamentar la respuesta.',
          tools: [{ googleSearch: {} }],
        },
      });

      const answer = response.text ?? 'No se obtuvo una respuesta textual para esta consulta.';
      const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const seenUris = new Set<string>();
      const sources: Array<{ title: string; uri: string }> = [];

      for (const chunk of rawChunks) {
        const web = (chunk as { web?: { uri?: string; title?: string } }).web;
        if (web?.uri && !seenUris.has(web.uri)) {
          seenUris.add(web.uri);
          sources.push({
            title: web.title?.trim() || web.uri,
            uri: web.uri,
          });
        }
      }

      res.json({ answer, sources });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido al consultar Gemini.';
      const status =
        message.includes('403') || message.includes('PERMISSION_DENIED')
          ? 403
          : message.includes('429') || message.includes('RESOURCE_EXHAUSTED')
            ? 429
            : message.includes('404')
              ? 404
              : 500;
      res.status(status).json({ error: message });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Manos LSC server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

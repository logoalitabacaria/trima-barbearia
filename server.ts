/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables (.env)
dotenv.config();

const PORT = 3000;

// Initialize Gemini SDK securely on the server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  app.use(express.json());

  // API Route - Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route - 1. Parse Supplier Pods catalog text
  app.post("/api/gemini/parse-purchase", async (req, res) => {
    try {
      const { supplierText } = req.body;
      if (!supplierText) {
        return res.status(400).json({ error: "supplierText is required" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analise a seguinte mensagem do fornecedor/distribuidor de essências, pods e vapes, e extraia detalhadamente todos os modelos disponíveis (ex: Blacksheep 15k, Ignite V50, Ignite V80, Elfbar BC5000, Oxbar G8000, etc.) e os sabores disponíveis de cada um deles.
Preste muita atenção ao texto, pois ele pode conter emojis, preços, quantidades de puffs e formatações bagunçadas. Separe cada modelo e seus respectivos sabores em itens do JSON de forma clara, omitindo preços e quantidades se existirem.

Texto do fornecedor:
${supplierText}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                model: {
                  type: Type.STRING,
                  description: "Nome do modelo de pod ou vape (ex: Blacksheep 15k, Ignite V50, Oxbar G8000, Tornado 9000). Não inclua o preço."
                },
                flavors: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.STRING
                  },
                  description: "Lista limpa de sabores de pod disponíveis para este modelo específico. Não coloque preços ou puffs no nome do sabor."
                }
              },
              required: ["model", "flavors"]
            }
          }
        }
      });

      let jsonText = response.text || "[]";
      jsonText = jsonText.trim();

      try {
        const parsed = JSON.parse(jsonText);
        res.json({ result: parsed });
      } catch (parseError) {
        console.error("JSON parsing failed on structured output, returning raw text.", parseError, jsonText);
        res.json({ result: null, rawText: jsonText });
      }
    } catch (err: any) {
      console.error("API error parsing purchase:", err);
      res.status(550).json({ error: err.message || "Erro desconhecido na geração" });
    }
  });

  // API Route - 2. Generate Instagram Post Texts
  app.post("/api/gemini/generate-post", async (req, res) => {
    try {
      const { postType, additionalInfo } = req.body;
      if (!postType) {
        return res.status(400).json({ error: "postType is required" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Você é um copywriter de alto nível para mídias sociais. Crie o conteúdo para um post (no Reels/Stories ou Feed) do Instagram do "Trima Studio", um estúdio de estética de visual sofisticado e com fluxo de comanda digital integrado.
Tipo de post: ${postType}
Informações complementares: ${additionalInfo || "Nenhuma informação extra fornecida"}

Gere um JSON com os seguintes campos:
"title": Um título curto, chamativo e em caixa alta para colocar dentro da imagem (máximo 40 caracteres, ex: "ESTILO REINVENTADO", "ESTILO EM DIA")
"subtitle": Um subtexto ou badge superior chamativo para colocar na imagem (ex: "NOVIDADE", "TABELA DE PREÇOS", "DICA DE PARCEIRO")
"bodyText": O texto descritivo curto secundário para figurar dentro da imagem (máximo 120 caracteres, bem visual)
"caption": Legenda completa do post otimizada para o Instagram, motivadora, com emojis adequados e hashtags estratégicas relevantes de estética, beleza e barbearia.

Retorne APENAS o JSON puro e válido, sem envolver em markdown do tipo \`\`\`json ou texto introdutório.`
      });

      let jsonText = response.text || "{}";
      jsonText = jsonText.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json/, "").replace(/```$/, "").trim();
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```/, "").replace(/```$/, "").trim();
      }

      try {
        const parsed = JSON.parse(jsonText);
        res.json({ result: parsed });
      } catch (parseError) {
        console.error("JSON parsing failed for post generator:", parseError);
        res.json({
          result: {
            title: "ESTILO REINVENTADO",
            subtitle: "NOVIDADES",
            bodyText: additionalInfo || "Confira os novos produtos e serviços na barbearia mais premium da cidade.",
            caption: jsonText
          }
        });
      }
    } catch (err: any) {
      console.error("API error generating post:", err);
      res.status(500).json({ error: err.message || "Erro ao gerar post de Instagram" });
    }
  });

  // API Route - 3. Generate client text message (WhatsApp style)
  app.post("/api/gemini/generate-message", async (req, res) => {
    try {
      const { tone, situation, instructions } = req.body;
      if (!situation) {
        return res.status(400).json({ error: "situation is required" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Você é o mestre de comunicação com clientes do Trima Studio.
Escreva uma mensagem de WhatsApp personalizada e engajadora com as seguintes características:
Tom da mensagem: ${tone || "Amigável e profissional"}
Situação/Objetivo: ${situation}
Informações/Instruções especiais: ${instructions || "Nenhuma"}

A mensagem deve ser amigável mas profissional, polida, sem placeholders genéricos vazios (use dados fictícios coerentes se precisar de data/hora ou preços a menos que já estejam informados no texto). O texto deve ser formatado com negritos do WhatsApp (*palavra*) onde for relevante para destaque. Não retorne markdown como bloco de código ou aspas na mensagem. Retorne apenas o texto límpido da mensagem.`
      });

      res.json({ text: response.text?.trim() || "" });
    } catch (err: any) {
      console.error("API error generating message:", err);
      res.status(500).json({ error: err.message || "Erro ao gerar mensagem de WhatsApp" });
    }
  });

  // API Route - 4. Generate Local Google Review Replies
  app.post("/api/gemini/google-reply", async (req, res) => {
    try {
      const { reviewerName, starRating, reviewText, ownerDirectives } = req.body;
      if (!reviewerName) {
        return res.status(400).json({ error: "reviewerName is required" });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Escreva uma resposta de alta conversão, empatia e otimizada para SEO local no Google Business de um estúdio de estética de visual sofisticado ("Trima Studio").
Cliente que avaliou: ${reviewerName}
Classificação em estrelas: ${starRating || 5} estrelas
Comentário do cliente: "${reviewText || "Nenhuma avaliação por escrito, apenas as estrelas."}"
Diretivas adicionais do proprietário: ${ownerDirectives || "Nenhuma"}

Aplique gatilhos de SEO local de forma espontânea (ex: mencionar "cortes", "atendimento premium", "unhas", "estética facial", "espaço agradável", "beleza masculina e feminina").
Se a avaliação for ruim (1-3 estrelas), responda com extrema cautela, cordialidade impecável, pedindo desculpas pela experiência inadequada, facultando canal de contato direto e convidando para uma nova visita por nossa conta para reverter o impacto.
Se for boa (4-5 estrelas), agradeça entusiasmado, comente os elogios e chame sutilmente para o próximo atendimento.
Retorne APENAS o texto livre de resposta final na primeira pessoa do plural (nós/proprietários do estúdio), pronto para copiar e colar. Não utilize formatação markdown, aspas envolventes, títulos ou explicações.`
      });

      res.json({ text: response.text?.trim() || "" });
    } catch (err: any) {
      console.error("API error generating google reply:", err);
      res.status(500).json({ error: err.message || "Erro ao responder avaliação do Google" });
    }
  });

  // Explicit SEO static routes
  app.get("/robots.txt", (req, res) => {
    res.type("text/plain");
    res.sendFile(path.join(process.cwd(), "public", "robots.txt"));
  });

  app.get("/sitemap.xml", (req, res) => {
    res.type("application/xml");
    res.sendFile(path.join(process.cwd(), "public", "sitemap.xml"));
  });

  // Vite integration middleware: Development vs Production mode
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite server middleware in Development Mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving statically from /dist in Production Mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FULL-STACK] Express server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

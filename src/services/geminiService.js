// src/services/geminiService.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config(); // Carrega as variáveis de ambiente do .env

const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
if (!apiKey) {
    console.error(
        "Erro: Chave da API do Gemini não encontrada. Verifique o arquivo .env e a variável GOOGLE_GEMINI_API_KEY."
    );
    process.exit(1); // Encerra se a chave não for encontrada
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Ou outro modelo compatível

/**
 * Analisa e resume uma mensagem usando a API do Gemini.
 * @param {string} userMessage A mensagem original do usuário.
 * @returns {Promise<string>} A resposta processada pelo Gemini.
 */
async function analyzeAndSummarizeWithGemini(userMessage) {
    if (!userMessage || userMessage.trim() === "") {
        return "Por favor, forneça uma mensagem para análise.";
    }

    // Instrução clara para o Gemini
    const prompt = `
    Analise a seguinte mensagem de um usuário buscando suporte ou informação.
    Seu objetivo é retornar uma resposta direta, clara e resumida para a pessoa que está prestando o suporte.
    Utilize tópicos (bullet points) ou uma estrutura similar para facilitar a compreensão rápida.
    Identifique o ponto principal ou a dúvida do usuário.
    Se houver ações sugeridas, liste-as de forma concisa.

    Mensagem do usuário:
    "${userMessage}"

    Sua análise resumida:
  `;

    console.log(`[Gemini Service] Enviando prompt para análise...`);

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        console.log(`[Gemini Service] Resposta recebida.`);
        // Simplesmente retorna o texto gerado, que já deve estar formatado pelos tópicos
        return text;
    } catch (error) {
        console.error("[Gemini Service] Erro ao chamar a API do Gemini:", error);
        // Retorna uma mensagem de erro genérica para o bot
        return "Desculpe, não consegui processar sua solicitação com a IA no momento.";
    }
}

export { analyzeAndSummarizeWithGemini }; // Exporta a função

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

    const prompt = `
Instruções para a IA:
"Você é um profissional de educação física especializado em prescrição de treinos personalizados. Com base nas informações fornecidas pelo usuário, crie uma ficha de treino detalhada seguindo estas diretrizes:

Objetivo do aluno: (Ex: Hipertrofia/emagrecimento) → Ajuste séries, repetições e descanso.

Dias de treino/semana: → Defina a divisão (AB, ABC, ABCD) conforme solicitado.

Recursos disponíveis: (Ex: Academia/casa) → Priorize exercícios viáveis.

Nível de experiência: (Iniciante/intermediário/avançado) → Regule intensidade e complexidade.

Formato da Ficha:

Dia X (Grupo muscular):

Exercício (séries x repetições + descanso)

Observações (técnica, progressão, etc.)

Dicas adicionais: (Alongamento, nutrição, ajustes)

Exemplo de Resposta:
"Ficha ABC - Hipertrofia (Academia):
Dia A (Peito/Tríceps):

Supino reto (4x8-10 | 90s descanso)

Crucifixo (3x12 | 60s descanso)..."

Aja como um especialista, oferecendo explicações claras e segurança nas recomendações.
`;

    console.log(`[Gemini Service] Enviando prompt para análise...`);

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        console.log(`[Gemini Service] Resposta recebida.`);
        // Retorna o texto gerado, que já deve estar formatado pelos tópicos
        return text;
    } catch (error) {
        console.error("[Gemini Service] Erro ao chamar a API do Gemini:", error);

        return "Desculpe, não consegui processar sua solicitação com a IA no momento.";
    }
}

export { analyzeAndSummarizeWithGemini }; 

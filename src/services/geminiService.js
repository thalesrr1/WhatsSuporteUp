import { GoogleGenerativeAI } from "@google/generative-ai";
import config from '../config/index.js'; // 1. Importa a configuração centralizada

const apiKey = config.geminiApiKey;

// Inicializa o cliente e modelo de forma mais segura
// Só inicializa se a chave existir.
let genAI = null;
let model = null;

if (apiKey) {
    try {
        genAI = new GoogleGenerativeAI(apiKey);
        model = genAI.getGenerativeModel({ model: modelGemini }); // 2. Usa a config do modelo
        console.log("[Gemini Service] Cliente Gemini inicializado com sucesso.");
    } catch (initError) {
        console.error("[Gemini Service] Falha ao inicializar o cliente Gemini:", initError.message || initError);
        // genAI e model continuam/ficam null
    }
} else {
    // Não é mais um erro fatal que encerra a aplicação.
    console.warn(
        "[Gemini Service] Atenção: Chave da API do Gemini (GOOGLE_GEMINI_API_KEY) não encontrada ou inválida na configuração. O serviço Gemini não funcionará."
    );
}

/**
 * Gera um resumo conciso de uma mensagem de usuário para auxiliar a equipe de suporte.
 * Foca em identificar o ponto principal, dúvidas e possíveis ações sugeridas.
 * @param {string} userMessage A mensagem original do usuário.
 * @returns {Promise<string|null>} A análise resumida em formato de texto ou null em caso de erro/falha na inicialização.
 */
async function analyzeAndSummarizeWithGemini(userMessage) {
    // 4. Verifica se o modelo foi inicializado corretamente
    if (!model) {
        console.error("[Gemini Service] Tentativa de uso sem cliente Gemini inicializado (Verifique a API Key).");
        // Retorna null para indicar falha, quem chama decide a mensagem de erro final.
        return null;
    }

    if (!userMessage || userMessage.trim() === "") {
        console.warn("[Gemini Service] Mensagem de usuário vazia recebida.");
        return "Não foi possível analisar: mensagem vazia.";
    }

    // 5. Prompt focado APENAS no resumo para suporte
    const prompt = `
        Analise a seguinte mensagem de um usuário buscando suporte ou informação.
        Seu objetivo EXCLUSIVO é retornar um resumo claro e direto para a pessoa que está prestando o suporte.
        Estruture a resposta utilizando tópicos (bullet points) para facilitar a leitura rápida:
        - Identifique o Ponto Principal ou a Dúvida central do usuário.
        - Liste quaisquer Ações Sugeridas pelo usuário ou implícitas na mensagem.
        - Mencione outros detalhes relevantes de forma concisa, se houver.

        NÃO inclua saudações ou texto direcionado ao usuário final nesta resposta.

        Mensagem do Usuário:
        "${userMessage}"

        Resumo para Suporte:
    `;

    console.log(`[Gemini Service] Enviando prompt para resumo de suporte...`);

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;

        // Verifica se a resposta tem texto (pode haver casos de bloqueio de conteúdo, etc.)
        if (response && response.text) {
            const text = response.text();
            console.log(`[Gemini Service] Resumo recebido.`);
            return text;
        } else {
            console.warn("[Gemini Service] Resposta da API Gemini vazia ou inválida.", response);
            return null; // Indica falha ao obter um texto válido
        }

    } catch (error) {
        // 6. Log de erro mais detalhado
        console.error("[Gemini Service] Erro ao chamar a API do Gemini:", error.message || error);
        // Considerar logar 'error' completo em ambiente de debug se necessário
        return null; // Retorna null para indicar falha na chamada da API
    }
}

// 7. Exporta a função com nome mais descritivo
export { getSupportSummaryFromGemini };
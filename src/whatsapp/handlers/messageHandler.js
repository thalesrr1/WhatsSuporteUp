import { analyzeAndSummarizeWithGemini } from '../../services/geminiService.js'; // Importa o serviço

// A função recebe a instância do cliente como parâmetro
export async function handleMessage(client, message) {
    console.log(`[MessageHandler DEBUG] Received:`, { /* ... log detalhado ... */ });

    // --- FILTRO REFORÇADO ---
    if (!message.body || message.isStatusMsg || message.from === 'status@broadcast' || message.isGroupMsg) {
        console.log(`[MessageHandler FILTER] Ignored. From: ${message.from}, isStatus: ${message.isStatusMsg}, ...`);
        return;
    }

    const senderNumber = message.from;
    const messageBody = message.body; //corpo original para Gemini
    const messageBodyLower = messageBody.toLowerCase();

    console.log(`[MessageHandler] [${senderNumber}] Valid chat message: "${messageBody}"`);

    if (messageBodyLower === 'ping') {
        console.log(`[MessageHandler] [${senderNumber}] Ping command.`);
        try {
            await client.sendText(senderNumber, `
                Olá! Sou seu assistente de treinos. Para montar sua ficha personalizada, preciso de algumas informações:
                🚀Qual seu principal objetivo? (Ex: Hipertrofia, emagrecimento, resistência, força)
                😎Quantos dias na semana pode treinar?
                🤸Prefere divisão de treino: AB, ABC ou ABCD? (Ou outra, se tiver preferência)
                🕺Tem restrições físicas ou equipamentos disponíveis? (Ex: Academia, casa, pesos livres)

                Responda no formato que achar melhor, e já te envio um plano adaptado! 💪`);
            console.log(`[MessageHandler] [${senderNumber}] Pong sent.`);
        } catch (err) {
            console.error(`[MessageHandler] [${senderNumber}] Error sending pong:`, err);
        }
    } else {
        console.log(`[MessageHandler] [${senderNumber}] Sending to Gemini...`);
        try {
            const geminiResponse = await analyzeAndSummarizeWithGemini(messageBody);

            if (geminiResponse && geminiResponse.trim() !== '') {
                await client.sendText(senderNumber, geminiResponse);
                console.log(`[MessageHandler] [${senderNumber}] Gemini response sent.`);
            } else {
                console.warn(`[MessageHandler] [${senderNumber}] Empty/invalid Gemini response.`);
                // await client.sendText(senderNumber, 'Vou adicionar uma mensagem aqui'); 
                // Adicionar uma mensagem padrão posteriormente
            }
        } catch (error) {
            console.error(`[MessageHandler] [${senderNumber}] Error in Gemini flow:`, error);
            try {
                await client.sendText(senderNumber, '🤖 Error processing request.');
            } catch (sendError) {
                console.error(`[MessageHandler] [${senderNumber}] CRITICAL error sending fallback:`, sendError);
            }
        }
    }
}
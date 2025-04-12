import http from 'http'; //para ter controle sobre o servidor
import config from './config/index.js';
import app from './server/app.js'; // immporta o app Express configurado
import { setClientStatusGetter } from './server/routes/index.js'; // Importa a função de setter e o getter de status
import { startWhatsAppBot, closeWhatsAppBot, getStatus } from './whatsapp/client.js'; // Importa funções do cliente WPP

let httpServer = null;

// --- Configuração do Servidor Express ---
setClientStatusGetter(getStatus);

// --- Função Principal de Inicialização ---
async function start() {
  console.log('[Main] Iniciando aplicação...');

  // 1. Iniciar Servidor HTTP com o app Express
  httpServer = http.createServer(app);
  httpServer.listen(config.port, () => {
    console.log(`[Main] Servidor Express rodando em http://localhost:${config.port}`);

    // 2. Iniciar o Bot WhatsApp SOMENTE APÓS o Express estar pronto
    startWhatsAppBot().catch(err => {
      console.error("[Main] Falha ao iniciar o bot WhatsApp após iniciar o servidor. Encerrando...", err);
      gracefulShutdown('STARTUP_FAILURE'); // Tenta fechar o servidor se o bot falhar
    });
  });

  httpServer.on('error', (error) => {
    console.error('[Main] Erro no servidor HTTP:', error);
    process.exit(1); // Erro crítico no servidor, encerra
  });
}

// --- Tratamento de Encerramento Gracioso ---
async function gracefulShutdown(signal) {
  console.log(`[Main] Recebido ${signal}. Iniciando encerramento gracioso...`);

  // 1. Parar de aceitar novas conexões HTTP
  if (httpServer) {
    console.log('[Main] Fechando servidor HTTP...');
    httpServer.close(async (err) => {
      if (err) {
        console.error('[Main] Erro ao fechar servidor HTTP:', err);
      } else {
        console.log('[Main] Servidor HTTP fechado.');
      }

      // 2. Fechar conexão do WhatsApp APÓS fechar o servidor HTTP
      await closeWhatsAppBot();

      console.log('[Main] Encerramento concluído.');
      process.exit(err ? 1 : 0); // Sai com código 1 se houve erro no fechamento do http
    });
  } else {
    // Se o servidor não iniciou, apenas tenta fechar o bot (se existir)
    await closeWhatsAppBot();
    console.log('[Main] Encerramento concluído (servidor não estava rodando).');
    process.exit(0);
  }

  // Força o encerramento após um tempo limite se algo travar
  setTimeout(() => {
    console.error('[Main] Encerramento forçado após timeout.');
    process.exit(1);
  }, 10000); // Timeout de 10 segundos
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('uncaughtException', (error, origin) => {
  console.error(`[Main] Exceção não capturada! Origin: ${origin}`, error);
  // Considerar encerrar graciosamente ou apenas logar dependendo da severidade
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Main] Rejeição de Promise não tratada!', reason);
  // Considerar encerrar graciosamente
  gracefulShutdown('UNHANDLED_REJECTION');
});

// --- Iniciar a Aplicação ---
start();
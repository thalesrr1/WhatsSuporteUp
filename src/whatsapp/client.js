import wppconnect from '@wppconnect-team/wppconnect';
import config from '../config/index.js';
import { handleMessage } from './handlers/messageHandler.js'; // Importa o handler

let wppClientInstance = null;
let currentStatus = 'disconnected'; // rastrear o status globalmente

export async function startWhatsAppBot() {
    if (wppClientInstance) {
        console.warn("Tentativa de iniciar o bot WhatsApp que já está inicializado.");
        return wppClientInstance;
    }

    console.log('Iniciando conexão com o WhatsApp...');
    currentStatus = 'initializing';
    try {
        wppClientInstance = await wppconnect.create({
            session: config.sessionName,
            puppeteerOptions: { headless: false, args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
            ]
            },
            folderNameToken: config.paths.session, //caminho da config
            catchQR: (base64Qr, asciiQR) => {
                console.log('Escaneie o QR Code abaixo para conectar:');
                console.log(asciiQR);
                currentStatus = 'qrCode';
            },
            statusFind: (statusSession, sessionName) => {
                console.log('[WPP Client] Status:', statusSession, '| Session:', sessionName);
                currentStatus = statusSession; 
                if (statusSession === 'inChat' || statusSession === 'isLogged') {
                    console.log(`[WPP Client] Conectado com sucesso na sessão: ${sessionName}!`);
                }
                if (statusSession === 'notLogged' || statusSession === 'deviceNotConnected') {
                    console.error('[WPP Client] Cliente desconectado!');
                }
            },
            logQR: true,
            // Adicionar depois outras opções tipo keepAlive, etc. (só deus sabe)
        });

        console.log('[WPP Client] Cliente criado. Configurando listener...');
        // Configura o listener para chamar o handler importado
        wppClientInstance.onMessage((message) => handleMessage(wppClientInstance, message));
        console.log('[WPP Client] Listener de mensagens configurado.');

        return wppClientInstance;

    } catch (error) {
        console.error('[WPP Client] Erro CRÍTICO ao iniciar ou conectar:', error);
        currentStatus = 'error';
        wppClientInstance = null; // Garante que a instância é nula em caso de erro
        throw error; // Re-lança o erro para ser tratado no index.js
    }
}

export function getClient() {
    return wppClientInstance;
}

export function getStatus() {
    return currentStatus; // Função para retornar o status atual
}

// Função para fechar a conexão
export async function closeWhatsAppBot() {
    if (wppClientInstance) {
        console.log('[WPP Client] Fechando conexão...');
        try {
            await wppClientInstance.close();
            wppClientInstance = null;
            currentStatus = 'disconnected';
            console.log('[WPP Client] Conexão fechada.');
        } catch (e) {
            console.error('[WPP Client] Erro ao fechar conexão:', e);
            currentStatus = 'error_closing'; // Indica um erro ao fechar
        }
    }
}
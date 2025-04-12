import express from 'express';

const router = express.Router();

// Função para obter o status do cliente (será passada ou importada)
let getClientStatus = () => 'unknown';
export function setClientStatusGetter(getter) {
    getClientStatus = getter;
}

router.get('/', (req, res) => {
    res.send('API do WhatsApp Bot está online!');
});


router.get('/status', (req, res) => {
    res.json({
        message: "Status do Bot",
        session_name: config.sessionName, 
        connection_status: getClientStatus(), 
    });
});

// Adicione outras rotas aqui (ex: /api/send-message, /api/login se implementar autenticação)

export default router; // Exporta o router configurado
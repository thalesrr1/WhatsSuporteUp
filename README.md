# 🤖 WhatsApp Support Bot com Gemini 

[![Node.js](https://img.shields.io/badge/Node.js-18.x-brightgreen.svg)](https://nodejs.org/)
[![WPPConnect](https://img.shields.io/badge/WPPConnect-Latest-blue.svg)](https://github.com/wppconnect-team/wppconnect)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini-orange.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/thalesrr1/WhatsSuporteUp/pulls)

Um assistente inteligente para WhatsApp que utiliza a biblioteca WPPConnect para integração com WhatsApp Web e a API Google Gemini para análise avançada de mensagens e geração de respostas contextuais ou resumos.

![WhatsApp Bot Demo](https://via.placeholder.com/800x400?text=WhatsApp+Bot+Demo)

## ✨ Funcionalidades Principais

- 📱 Conexão transparente com WhatsApp Web via WPPConnect
- 💬 Recebimento e processamento inteligente de mensagens individuais
- 🧠 Integração com a API Google Gemini para análise de texto avançada (NLP)
- 📊 Geração de resumos de mensagens para equipes de suporte (totalmente configurável)
- 🎭 Personalidades ajustáveis: defina diferentes prompts para o Gemini com base na interação
- 🧩 Arquitetura modular para fácil manutenção e expansão
- 🔌 Servidor Express para possíveis integrações ou monitoramento via API

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

* [Node.js](https://nodejs.org/) (v18 ou superior recomendada)
* [npm](https://www.npmjs.com/) (geralmente incluído com o Node.js)
* Um número de telefone com WhatsApp ativo para uso do bot
* Uma chave de API válida do [Google AI Studio (Gemini)](https://aistudio.google.com/app/apikey)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/thalesrr1/WhatsSuporteUp
cd WhatsSuporteUp
```

### 2. Instale as dependências

```bash
npm install
```

## ⚙️ Configuração

### 1. Configure as variáveis de ambiente

Na raiz do projeto, crie um arquivo `.env` baseado no modelo fornecido:

```bash
cp .env.example .env
```

### 2. Edite o arquivo `.env`

Abra o arquivo `.env` em um editor de texto e configure:

```
# Configurações do WhatsApp
WPP_SESSION_NAME=meuBot

# Configuração da API Gemini
GEMINI_API_KEY=sua_chave_aqui

# Configurações do servidor
PORT=3000
```

> **⚠️ IMPORTANTE:** O arquivo `.env` contém informações sensíveis e **não deve** ser incluído no controle de versão. Ele já está listado no `.gitignore`.

## 🏃‍♂️ Rodando o Bot

### Modo de Desenvolvimento (com hot-reload)

Ideal para desenvolvimento ativo, utiliza o `nodemon` para reiniciar automaticamente quando detectar alterações:

```bash
npm run dev
```

### Modo de Produção

Executa o servidor em modo de produção:

```bash
npm start
```

O servidor estará disponível (por padrão) em `http://localhost:3000`.

## 📱 Conectando ao WhatsApp

Após executar o projeto, você poderá conectar-se ao WhatsApp de duas maneiras:

### 1. Interface Gráfica (Chrome)

Um navegador Chrome será aberto automaticamente mostrando o WhatsApp Web. Leia o QR Code com seu dispositivo móvel para autenticar.

### 2. QR Code no Terminal

O QR Code também será exibido diretamente no terminal (`cmd` ou `bash`), permitindo a autenticação sem interface gráfica.

### Sessões Múltiplas

É possível gerenciar múltiplas sessões configurando diferentes nomes no arquivo `.env`:

```
WPP_SESSION_NAME=luizBot
```

Ao iniciar a aplicação, ela utilizará o nome de sessão especificado. Por exemplo:

```bash
# Para iniciar com a sessão "luizBot"
WPP_SESSION_NAME=luizBot npm start

# Para iniciar com a sessão "lucasBot"
WPP_SESSION_NAME=lucasBot npm start
```

## 🛠️ Estrutura do Projeto

```
WhatsSuporteUp/
├── src/
│   ├── controllers/    # Controladores para lógica de negócios
│   ├── services/       # Serviços de integração (WhatsApp, Gemini)
│   ├── models/         # Modelos e esquemas de dados
│   ├── routes/         # Rotas da API Express
│   ├── utils/          # Funções utilitárias
│   └── app.js          # Ponto de entrada da aplicação
├── .env.example        # Exemplo de variáveis de ambiente
├── .gitignore          # Arquivos ignorados pelo Git
├── package.json        # Dependências e scripts
└── README.md           # Este arquivo
```

## 📜 Licença

Este projeto está licenciado sob a [Licença MIT](LICENSE).

## 💬 Suporte

Se tiver dúvidas ou encontrar problemas, abra uma [issue](https://github.com/thalesrr1/WhatsSuporteUp/issues) no GitHub.

---

Feito com ❤️ por [Thales R.](https://github.com/thalesrr1)

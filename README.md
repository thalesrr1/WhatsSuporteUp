# WhatsApp Support Bot com Gemini

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Um bot para WhatsApp que utiliza a biblioteca WPPConnect para interagir com o WhatsApp Web e a API Google Gemini para analisar mensagens e gerar respostas ou resumos.

## Funcionalidades Principais

*   Conexão com WhatsApp Web via WPPConnect.
*   Recebimento e processamento de mensagens individuais.
*   Integração com a API Google Gemini para análise de texto (NLP).
*   Geração de resumos de mensagens para equipes de suporte (configurável).
*   Capacidade de definir diferentes "personalidades" ou prompts para o Gemini com base na interação.
*   Estrutura de projeto modular para fácil manutenção e expansão.
*   Servidor Express básico para possíveis futuras integrações ou status via API.

## Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

*   [Node.js](https://nodejs.org/) (Versão 18 ou superior recomendada)
*   [npm](https://www.npmjs.com/) (Geralmente incluído com o Node.js)
*   Um número de telefone com WhatsApp ativo (que será usado pelo bot).
*   Uma Chave de API válida do [Google AI Studio (Gemini)](https://aistudio.google.com/app/apikey).

## Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/thalesrr1/WhatsSuporteUp
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

## Configuração

1.  **Crie o arquivo de ambiente:**
    Na raiz do projeto, crie um arquivo chamado `.env`. Este arquivo guardará suas chaves secretas e configurações.

2.  **Crie o arquivo `.env`:**
    Copie o arquivo de exemplo `.env.example` para um novo arquivo chamado `.env` na raiz do projeto.
    ```bash
    cp .env.example .env
    ```
    **Importante:** O arquivo `.env` contém informações sensíveis (como senhas de email) e **não deve** ser versionado no Git. Ele já está incluído no `.gitignore`.
    

## Rodando o Bot

Existem duas formas de executar o projeto:

1.  **Modo de Desenvolvimento (com API):**
    Utiliza o `nodemon` para reiniciar automaticamente o servidor quando detectar alterações nos arquivos. Ideal para desenvolvimento ativo.
    ```bash
    npm run dev
    ```
    O servidor estará disponível (por padrão) em `http://localhost:3000`.

2.  **Modo de Produção (com API):**
    Executa o servidor diretamente com Node.js. Use este comando para implantações.
    ```bash
    npm start
    ```

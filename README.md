# FIAP Lab - Video Processing

Sistema de processamento de vídeos desenvolvido para o FIAP Lab. Este projeto oferece uma plataforma robusta para upload, processamento e gerenciamento de vídeos, com autenticação segura e extração de frames.

## Funcionalidades

- **Autenticação Segura**: Login via Email/Senha e Social Login (Google) usando AWS Cognito.
- **Dashboard Interativo**: Interface moderna para gerenciamento de vídeos.
- **Processamento de Vídeo**: Upload e processamento assíncrono.
- **Extração de Frames**: Download de imagens extraídas dos vídeos em formato ZIP.
- **UI Responsiva**: Design fluído e dark mode nativo com Shadcn UI.

## Tecnologias Utilizadas

- **Frontend**: Next.js 16, React 19, TypeScript.
- **Estilização**: Tailwind CSS v4, Shadcn UI, Lucide Icons e Tabler Icons.
- **Autenticação**: AWS Amplify Gen 2 (Auth), Amazon Cognito.
- **Gerenciamento de Estado**: React Hooks e Amplify Hub.

## Instalação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/seu-usuario/fiap-lab.git
    cd fiap-lab
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configuração de Ambiente:**
    Crie um arquivo `.env` ou `.env.local` na raiz do projeto copiando o exemplo:
    ```bash
    cp .env.example .env
    ```
    Preencha as variáveis com suas credenciais do AWS Cognito e Google OAuth:
    ```env
    NEXT_PUBLIC_AWS_COGNITO_REGION=us-east-1
    NEXT_PUBLIC_AWS_COGNITO_POOL_ID=...
    NEXT_PUBLIC_AWS_COGNITO_APP_CLIENT_ID=...
    NEXT_PUBLIC_AWS_COGNITO_DOMAIN=...
    ```

4.  **Execute o projeto:**
    ```bash
    npm run dev
    ```

    O acesso estará disponível em [http://localhost:3000](http://localhost:3000).

## Login Social (Google)

Para que o login com Google funcione localmente:
1.  Certifique-se de adicionar `http://localhost:3000/` nas **Allowed Callback URLs** no Console AWS Cognito.
2.  Configure o `NEXT_PUBLIC_APP_URL=http://localhost:3000` no seu `.env`.

## Licença

Este projeto faz parte do FIAP Lab e é destinado a fins educacionais.

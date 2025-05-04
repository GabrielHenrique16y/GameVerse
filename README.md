# 🎮 GameVerse

![Build Status](https://img.shields.io/badge/https%3A%2F%2Fvercel.com%2Fgabrielhjlcs-projects%2Fgame-verse) ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

GameVerse é uma **Single Page Application (SPA)** para exploradores de jogos: busque títulos, visualize detalhes, trailers e descubra jogos relacionados por plataforma ou franquia.

---

## 🔗 Demo

Acesse a versão hospedada em produção:

[Link](https://gameverse-omega.vercel.app)

---

## 🚀 Funcionalidades

- 🔍 Pesquisa por jogos com detalhes completos (gêneros, plataformas, avaliação, data de lançamento etc.)
- 🎬 Exibição de trailer integrado via YouTube
- 🛒 Links diretos para compra dos jogos
- 🧠 Jogos relacionados recomendados
- 🔐 **Autenticação segura com cookies HttpOnly**
- ❤️ **Favoritar jogos para consulta posterior**
- 🌐 Integração com APIs da IGDB e RAWG
- ☁️ Banco de dados gerenciado com Supabase
- 📧 Recuperação de senha via e-mail

---

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React, Axios, CSS
- **Backend**: Express (Serverless Functions via Vercel)
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: JWT + Cookies HttpOnly
- **APIs Externas**: IGDB, RAWG
---

## 📂 Estrutura de Pastas

```bash
GameVerse/
├── api/                     # Serverless Functions (TypeScript)
│   ├── auth.ts/             # autenticação (login, registro, recuperação de senha)
│   ├── logout.ts/           # logout
│   ├── games.ts             # detalhes e busca de jogos
│   ├── genres/              # endpoints de gêneros
│   ├── platform/            # endpoints de plataformas
│   ├── playlist/            # favoritos (adicionar e listar jogos)
│   └── profile/             # perfil do usuário
├── email_template/          # template de email para recuperação de senha
├── public/                  # assets estáticos (favicon, ícones)
├── src/                     # código-fonte do React
│   ├── components/          # componentes reutilizáveis (header, footer, loading)
│   ├── context/             # contexto de autenticação (AuthContext)
│   ├── Pages/               # páginas da aplicação (login, catálogo, detalhes, perfil etc.)
│   ├── Routes/              # rotas protegidas e públicas
│   ├── styles/              # estilos globais e personalizados
│   ├── types/               # tipos auxiliares (ex: tipos do banco de dados)
│   ├── main.tsx             # ponto de entrada React
│   └── index.css            # estilos globais
├── _utils/                  # utilitários (ex: conexão DB, middlewares de autenticação)
├── index.html               # template HTML base
├── vite.config.ts           # configuração do Vite
├── tsconfig.json            # configuração principal do TypeScript
├── tsconfig.api.json        # configuração TS para a API
├── tsconfig.app.json        # configuração TS para o app React
├── tsconfig.node.json       # configuração TS para Node
├── eslint.config.js         # regras de lint
├── verce.json               # configuração de deploy na Vercel
├── package.json             # dependências e scripts
└── README.md                # documentação do projeto

```

---

## ⚙️ Instalação e Execução

1. **Clone o repositório**
   ```bash
   git clone https://github.com/GabrielHenrique16y/GameVerse.git
   cd GameVerse
   ```
2. **Instale as dependências**
   ```bash
   npm install
   ```
3. **Configure variáveis de ambiente**
   - Crie um arquivo `.env` na raiz:
     ```dotenv
      # Credenciais da IGDB (https://api-docs.igdb.com)
      IGDB_CLIENT_ID=seu_client_id
      IGDB_ACCESS_TOKEN=seu_access_token

      # Supabase
      SUPABASE_URL=sua_supabase_url
      SUPABASE_KEY=sua_public_anon_key
      SUPABASE_JWT_SECRET=sua_jwt_secret
      TOKEN_EXPIRATION=30d

      # Credenciais de envio de email (usado para recuperação de senha)
      EMAIL_USER=seu_email@gmail.com
      EMAIL_PASS=sua_senha_de_aplicativo

     ```
4. **Rode em modo desenvolvimento**
   ```bash
   vercel dev
   ```
   - Acesse: `http://localhost:3000` (frontend + API)

---

## 📄 Licença

Este projeto está licenciado sob a **MIT License**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

Made by Gabriel Henrique


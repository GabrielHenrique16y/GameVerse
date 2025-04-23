# 🎮 GameVerse

![Build Status](https://img.shields.io/badge/https%3A%2F%2Fvercel.com%2Fgabrielhjlcs-projects%2Fgame-verse) ![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

GameVerse é uma **Single Page Application (SPA)** para exploradores de jogos: busque títulos, visualize detalhes, trailers e descubra jogos relacionados por plataforma ou franquia.

---

## 🔗 Demo

Acesse a versão hospedada em produção:

[Link](https://gameverse-omega.vercel.app)

---

## 🛠️ Stack Tecnológico

- **Frontend:** React 19 + Vite + TypeScript
- **Estilização:** CSS
- **Backend:** Serverless Functions (Vercel) em TypeScript
- **API de dados:** IGDB (via Axios)
- **Estado global:** Redux Toolkit + Redux Saga
- **Roteamento:** React Router v6
- **Deploy/CD:** Vercel

---

## ✨ Recursos

- **Catálogo de jogos em destaque**: ranking por avaliação.
- **Busca por plataforma** e jogos exclusivos.
- **Detalhes ricos**: sinopse, capa, gênero, plataforma, desenvolvedor e data de lançamento.
- **Trailers integrados** via YouTube.
- **Jogos relacionados** por franquia ou similaridade.
- **Tratamento de rotas SPA**: atualização de URL sem 404.
- **Página 404 customizada** dentro da aplicação.

---

## 📂 Estrutura de Pastas

```bash
GameVerse/
├── api/                 # Serverless Functions (TypeScript)
│   ├── games/           # endpoints de jogos
│   ├── genres/          # endpoints de gêneros
│   └── platform/        # endpoints de plataformas
├── public/              # assets estáticos (favicon, icons)
├── src/                 # código-fonte do React
│   ├── components/      # componentes reutilizáveis
│   ├── Pages/           # páginas da aplicação
│   ├── interface/       # modelos e tipagens TS
│   ├── Routes/          # definição de rotas
│   ├── services/        # instância Axios
│   ├── main.tsx         # ponto de entrada React
│   └── index.css        # estilos globais
├── index.html           # template HTML
├── vite.config.ts       # configuração Vite
├── tsconfig.*.json      # configs TypeScript
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
     IGDB_CLIENT_ID=seu_client_id
     IGDB_ACCESS_TOKEN=seu_access_token
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


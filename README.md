<div align="center">
  <h1>Portfolio Terminal</h1>
  <p><i>Terminal-first portfolio interface built with React, TypeScript, and Vite</i></p>

  <p>
    <img src="https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white" alt="React" />
    <img src="https://img.shields.io/badge/TypeScript-5.8+-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/UI-Terminal-111827?style=flat-square" alt="Terminal UI" />
  </p>
</div>

---

## Repositório Central de Conteúdo (SSOT)

O `portfolio-terminal` consome conteúdo de um repositório SSOT externo:

- `https://github.com/NullCipherr/portfolio-content`

Endpoints utilizados via raw:

- `https://raw.githubusercontent.com/NullCipherr/portfolio-content/main/content/pt/about.md`
- `https://raw.githubusercontent.com/NullCipherr/portfolio-content/main/content/pt/bio-short.md`
- `https://raw.githubusercontent.com/NullCipherr/portfolio-content/main/content/pt/skills.json`
- `https://raw.githubusercontent.com/NullCipherr/portfolio-content/main/content/pt/projects.json`

Configuração opcional (`.env`):

- `VITE_PORTFOLIO_CONTENT_RAW_BASE_URL=https://raw.githubusercontent.com/NullCipherr/portfolio-content/main`
- `VITE_DEFAULT_LOCALE=pt`

---

## Documentation

Documentação principal deste projeto está centralizada neste README.

Referências relacionadas:

- [portfolio-os](https://github.com/NullCipherr/portfolio-os)
- [portfolio-content](https://github.com/NullCipherr/portfolio-content)

---

## Preview

Portfolio Terminal entrega uma experiência de portfólio em formato shell interativo, orientada a comandos.

- Local URL: `http://localhost:3001`
- Entry point: `src/main.tsx`
- Main shell: `src/features/terminal/components/TerminalShell.tsx`

---

## Overview

**Portfolio Terminal** é uma interface de portfólio desacoplada do `portfolio-os`, construída para evoluir como aplicação independente e ser consumida externamente no futuro.

O projeto prioriza:

- Arquitetura modular por responsabilidade (`features`, `services`, `types`, `styles`);
- Camada de dados remota isolada para consumo do SSOT;
- Experiência de terminal consistente com comandos explícitos;
- Tipagem forte para contratos de conteúdo (`about`, `skills`, `projects`);
- Setup leve com Vite para rápida iteração e deploy simples.

---

## Features

- **Terminal estilizado** com temas (`matrix`, `amber`, `ice`).
- **Comandos de navegação de conteúdo** (`about`, `bio`, `skills`, `projects`, `project <id>`).
- **Comandos operacionais** (`reload`, `source`, `clear`).
- **Comandos de personalização/runtime** (`lang <pt|en>`, `theme <...>`).
- **Abertura de links externos** por comando (`open <id>`).
- **Histórico de comandos** com navegação por setas.

---

## Architecture

Fluxo de alto nível:

1. `src/main.tsx` monta o app React.
2. `src/App.tsx` renderiza o container principal da experiência.
3. `TerminalShell` controla input, histórico, tema, locale e renderização da sessão.
4. `portfolioContentService` concentra o acesso remoto ao SSOT via raw GitHub.
5. `commands.ts` interpreta e executa comandos desacoplados da UI.
6. `markdown.ts` normaliza Markdown para saída textual de terminal.
7. `types/content.ts` define os contratos de conteúdo consumidos em runtime.

---

## Performance

O projeto já nasce com decisões simples de performance:

- Requisições remotas em paralelo para arquivos de conteúdo;
- Parsing leve e tipado para JSON/Markdown;
- Bundle enxuto com Vite e ESM;
- Interface sem dependências visuais pesadas.

Evoluções planejadas incluem cache/revalidação por estratégia de deploy.

---

## Technical Decisions

- **Desacoplamento do OS**: terminal em repositório próprio para reuso e versionamento independente.
- **SSOT externo**: conteúdo centralizado no `portfolio-content`.
- **Separação UI x lógica**: comandos e parsing fora de componentes visuais.
- **Sem backend obrigatório**: consumo direto de `raw.githubusercontent.com`.

---

## Roadmap

- Adicionar suíte de testes unitários para parser e engine de comandos.
- Definir contrato de integração com `portfolio-os` (embed/chamada externa).
- Adicionar telemetria opcional para comandos mais utilizados.
- Estruturar pipeline CI para lint/build/test.
- Expandir comando de busca e filtros de projetos.

---

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Bundler**: Vite 6
- **Styling**: CSS global com variáveis de tema

---

## Project Structure

```text
.
├── src/
│   ├── features/
│   │   └── terminal/
│   │       ├── components/
│   │       │   └── TerminalShell.tsx
│   │       └── lib/
│   │           ├── commands.ts
│   │           └── markdown.ts
│   ├── services/
│   │   └── portfolioContentService.ts
│   ├── styles/
│   │   └── global.css
│   ├── types/
│   │   └── content.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install and run

```bash
npm install
npm run dev
```

### Build for production

```bash
npm run build
npm run preview
```

---

## Environment Variables

Use `.env.example` como baseline:

- `VITE_PORTFOLIO_CONTENT_RAW_BASE_URL`: URL base raw do SSOT.
- `VITE_DEFAULT_LOCALE`: locale inicial da sessão (`pt` ou `en`).
- `VITE_BASE_PATH`: base pública para assets em deploy estático (ex.: `/portfolio-terminal/` no GitHub Pages).

---

## NPM Scripts

- `npm run dev`: inicia servidor local na porta `3001`.
- `npm run build`: executa type-check e build de produção em `dist/`.
- `npm run preview`: serve build de produção localmente.
- `npm run lint`: executa validação de tipos (`tsc --noEmit`).

---

## CI/CD

Pipeline configurada com GitHub Actions:

- `CI` (`.github/workflows/ci.yml`): instala dependências, executa type-check (`npm run lint`) e build (`npm run build`) em push/PR.
- `CD` (`.github/workflows/cd.yml`): em cada push na `main`, gera build de produção e publica automaticamente no GitHub Pages.

---

## Deployment

Deploy automático via GitHub Pages.

```bash
git push origin main
```

O workflow `CD` publica a pasta `dist/` como artifact do Pages usando `VITE_BASE_PATH=/portfolio-terminal/`.

---

## License

MIT. Consulte o arquivo `LICENSE`.

import { PortfolioContent, ProjectItem } from '../../../types/content';
import { markdownToTerminalText, truncateText } from './markdown';

export type TerminalTheme = 'matrix' | 'amber' | 'ice';

export interface ExecuteCommandOptions {
  command: string;
  content: PortfolioContent;
  currentLocale: 'pt' | 'en';
  isFullscreen: boolean;
  setLocale: (locale: 'pt' | 'en') => void;
  setTheme: (theme: TerminalTheme) => void;
  setFullscreen: (value: boolean) => void;
  clear: () => void;
  reload: () => Promise<void>;
}

export interface CommandResult {
  type: 'output' | 'error' | 'muted';
  lines: string[];
}

const divider = '------------------------------------------------------------';
const compactDivider = '--------------------------------------';

const isCompactViewport = (): boolean =>
  typeof window !== 'undefined' ? window.matchMedia('(max-width: 560px)').matches : false;

const helpTextPt = [
  '+--------------------------------------------------------------------------+',
  '| Command Directory                                                        |',
  '+--------------------------+-----------------------------------------------+',
  '| Command                  | Description                                   |',
  '+--------------------------+-----------------------------------------------+',
  '| about                    | Resumo profissional                           |',
  '| about full               | Conteudo completo do about.md                 |',
  '| bio                      | Bio curta                                     |',
  '| skills                   | Lista skills por categoria                    |',
  '| projects                 | Lista projetos com id                         |',
  '| project <id>             | Mostra detalhes de um projeto                 |',
  '| open <id>                | Abre repositorio do projeto no GitHub         |',
  '+--------------------------+-----------------------------------------------+',
  '| lang <pt|en>             | Troca idioma do conteudo remoto               |',
  '| theme <matrix|amber|ice> | Troca tema visual                             |',
  '| fullscreen, fs           | Alterna modo tela cheia                       |',
  '| windowed                 | Volta para modo janela                        |',
  '| source                   | Mostra origem de dados raw                    |',
  '| reload                   | Recarrega conteudo remoto                     |',
  '| clear                    | Limpa o terminal                              |',
  '+--------------------------+-----------------------------------------------+',
].join('\n');

const helpTextEn = [
  '+--------------------------------------------------------------------------+',
  '| Command Directory                                                        |',
  '+--------------------------+-----------------------------------------------+',
  '| Command                  | Description                                   |',
  '+--------------------------+-----------------------------------------------+',
  '| about                    | Professional summary                          |',
  '| about full               | Full content from about.md                    |',
  '| bio                      | Short bio                                     |',
  '| skills                   | Lists skills by category                      |',
  '| projects                 | Lists projects with id                        |',
  '| project <id>             | Shows details for a project                   |',
  '| open <id>                | Opens project repository on GitHub           |',
  '+--------------------------+-----------------------------------------------+',
  '| lang <pt|en>             | Changes remote content language              |',
  '| theme <matrix|amber|ice> | Changes visual theme                          |',
  '| fullscreen, fs           | Toggles fullscreen mode                       |',
  '| windowed                 | Restores window mode                          |',
  '| source                   | Shows raw data source                         |',
  '| reload                   | Reloads remote content                        |',
  '| clear                    | Clears the terminal                           |',
  '+--------------------------+-----------------------------------------------+',
].join('\n');

const compactHelpTextPt = [
  'COMMANDS',
  compactDivider,
  'Content:',
  '  about',
  '  about full',
  '  bio',
  '  skills',
  '  projects',
  '  project <id>',
  '  open <id>',
  '',
  'Runtime:',
  '  lang <pt|en>',
  '  theme <matrix|amber|ice>',
  '  fullscreen | fs',
  '  windowed',
  '  source',
  '  reload',
  '  clear',
  compactDivider,
].join('\n');

const compactHelpTextEn = [
  'COMMANDS',
  compactDivider,
  'Content:',
  '  about',
  '  about full',
  '  bio',
  '  skills',
  '  projects',
  '  project <id>',
  '  open <id>',
  '',
  'Runtime:',
  '  lang <pt|en>',
  '  theme <matrix|amber|ice>',
  '  fullscreen | fs',
  '  windowed',
  '  source',
  '  reload',
  '  clear',
  compactDivider,
].join('\n');

const getHelpText = (locale: 'pt' | 'en'): string => {
  if (locale === 'en') {
    return isCompactViewport() ? compactHelpTextEn : helpTextEn;
  }

  return isCompactViewport() ? compactHelpTextPt : helpTextPt;
};

const findProject = (projects: ProjectItem[], id: string): ProjectItem | undefined =>
  projects.find((project) => project.id.toLowerCase() === id.toLowerCase());

const formatProjectDetails = (project: ProjectItem): string[] => {
  const lines = [
    'PROJECT DETAILS',
    divider,
    `ID: ${project.id}`,
    `TITLE: ${project.title}`,
    `SUMMARY: ${project.summary}`,
  ];

  if (project.stack && project.stack.length > 0) {
    lines.push(`STACK: ${project.stack.join(', ')}`);
  }

  if (project.highlights && project.highlights.length > 0) {
    lines.push('HIGHLIGHTS:');
    project.highlights.forEach((item) => lines.push(`  - ${item}`));
  }

  if (project.links?.github) {
    lines.push(`GITHUB: ${project.links.github}`);
  }

  if (project.links?.demo) {
    lines.push(`DEMO: ${project.links.demo}`);
  }

  lines.push(divider);

  return lines;
};

export const executeCommand = async ({
  command,
  content,
  currentLocale,
  isFullscreen,
  setLocale,
  setTheme,
  setFullscreen,
  clear,
  reload,
}: ExecuteCommandOptions): Promise<CommandResult> => {
  const trimmed = command.trim();
  if (!trimmed) return { type: 'muted', lines: [] };

  const parts = trimmed.split(/\s+/);
  const baseCommand = parts[0];
  if (!baseCommand) return { type: 'muted', lines: [] };

  const args = parts.slice(1);
  const normalized = baseCommand.toLowerCase();

  switch (normalized) {
    case 'help':
    case 'commands':
      return { type: 'output', lines: getHelpText(currentLocale).split('\n') };
    case 'about': {
      const renderFull = args[0]?.toLowerCase() === 'full';
      const text = markdownToTerminalText(content.about);
      const section = (renderFull ? text : truncateText(text)).split('\n');
      return {
        type: 'output',
        lines: ['ABOUT', divider, ...section, divider],
      };
    }
    case 'bio':
      return {
        type: 'output',
        lines: ['BIO', divider, ...markdownToTerminalText(content.bioShort).split('\n'), divider],
      };
    case 'skills': {
      const lines: string[] = ['SKILLS', divider];

      content.skills.forEach((category, index) => {
        lines.push(`[${String(index + 1).padStart(2, '0')}] ${category.category}`);
        lines.push(`  ${category.items.join(' | ')}`);
      });

      if (lines.length <= 2) {
        return { type: 'error', lines: ['Nenhuma skill encontrada no content remoto.'] };
      }

      lines.push(divider);
      return { type: 'output', lines };
    }
    case 'projects': {
      const lines = ['PROJECTS', divider, 'ID                         | TITLE', divider];

      content.projects.forEach((project) => {
        lines.push(`${project.id.padEnd(26, ' ')} | ${project.title}`);
      });

      if (lines.length <= 4) {
        return { type: 'error', lines: ['Nenhum projeto encontrado no content remoto.'] };
      }

      lines.push(divider);
      return { type: 'output', lines };
    }
    case 'project': {
      const id = args[0];
      if (!id) {
        return { type: 'error', lines: ['Uso: project <id>'] };
      }

      const project = findProject(content.projects, id);
      if (!project) {
        return { type: 'error', lines: [`Projeto '${id}' nao encontrado.`] };
      }

      return { type: 'output', lines: formatProjectDetails(project) };
    }
    case 'open': {
      const id = args[0];
      if (!id) {
        return { type: 'error', lines: ['Uso: open <id>'] };
      }

      const project = findProject(content.projects, id);
      if (!project?.links?.github) {
        return { type: 'error', lines: [`Projeto '${id}' sem link de GitHub.`] };
      }

      window.open(project.links.github, '_blank', 'noopener,noreferrer');
      return { type: 'output', lines: [divider, `Abrindo ${project.links.github}`, divider] };
    }
    case 'lang': {
      const next = args[0]?.toLowerCase();
      if (next !== 'pt' && next !== 'en') {
        return { type: 'error', lines: ['Uso: lang <pt|en>'] };
      }

      if (next === currentLocale) {
        return { type: 'muted', lines: [`Idioma ja esta em '${next}'.`] };
      }

      setLocale(next);
      return { type: 'output', lines: [divider, `Idioma alterado para '${next}'. Recarregando...`, divider] };
    }
    case 'theme': {
      const next = args[0]?.toLowerCase() as TerminalTheme | undefined;
      if (!next || !['matrix', 'amber', 'ice'].includes(next)) {
        return { type: 'error', lines: ['Uso: theme <matrix|amber|ice>'] };
      }

      setTheme(next);
      return { type: 'output', lines: [divider, `Tema '${next}' aplicado.`, divider] };
    }
    case 'fullscreen':
    case 'fs': {
      const next = !isFullscreen;
      setFullscreen(next);
      return {
        type: 'output',
        lines: [divider, next ? 'Modo fullscreen ativado.' : 'Modo janela restaurado.', divider],
      };
    }
    case 'windowed':
      setFullscreen(false);
      return { type: 'output', lines: [divider, 'Modo janela restaurado.', divider] };
    case 'exit':
      if (args[0]?.toLowerCase() === 'fullscreen') {
        setFullscreen(false);
        return { type: 'output', lines: [divider, 'Modo janela restaurado.', divider] };
      }

      return {
        type: 'error',
        lines: [`Comando '${normalized}' nao reconhecido. Digite 'help'.`],
      };
    case 'source':
      return {
        type: 'output',
        lines: [
          'SOURCE',
          divider,
          'Fonte de dados: GitHub Raw (portfolio-content)',
          'Arquivos: about.md, bio-short.md, skills.json, projects.json',
          divider,
        ],
      };
    case 'reload':
      await reload();
      return { type: 'output', lines: [divider, 'Conteudo remoto recarregado com sucesso.', divider] };
    case 'clear':
    case 'cls':
      clear();
      return { type: 'muted', lines: [] };
    default:
      return {
        type: 'error',
        lines: [`Comando '${normalized}' nao reconhecido. Digite 'help'.`],
      };
  }
};

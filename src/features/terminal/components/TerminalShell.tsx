import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import { portfolioContentService } from '../../../services/portfolioContentService';
import { Locale, PortfolioContent } from '../../../types/content';
import { executeCommand, TerminalTheme } from '../lib/commands';

interface HistoryEntry {
  id: number;
  type: 'input' | 'output' | 'error' | 'muted';
  content: string;
  createdAt: number;
}

const themeClassMap: Record<TerminalTheme, string> = {
  matrix: 'terminal-theme-matrix',
  amber: 'terminal-theme-amber',
  ice: 'terminal-theme-ice',
};

const initialLocale =
  (import.meta.env.VITE_DEFAULT_LOCALE as Locale | undefined)?.toLowerCase() === 'en'
    ? 'en'
    : 'pt';

const getIsCompactViewport = (): boolean =>
  typeof window !== 'undefined' ? window.matchMedia('(max-width: 560px)').matches : false;

const createBootMessage = (locale: Locale, isCompact = getIsCompactViewport()): string[] => {
  const helpLine =
    locale === 'pt' ? "Digite 'help' para listar comandos." : "Type 'help' to list commands.";

  if (isCompact) {
    return [
      '+--------------------------------------+',
      '| Portfolio Terminal                   |',
      '+--------------------------------------+',
      '| Portfolio: Andrei Costa              |',
      `| Locale: ${locale.padEnd(29, ' ')} |`,
      '| Source: portfolio-content            |',
      '| Delivery: GitHub Raw                 |',
      '+--------------------------------------+',
      '| Digite help para comandos            |',
      '+--------------------------------------+',
    ];
  }

  return [
    '+--------------------------------------------------------------+',
    '| Portfolio Terminal                                           |',
    '+----------------------+---------------------------------------+',
    '| Owner                | Andrei Costa                          |',
    '| Loaded portfolio     | Andrei Costa                          |',
    `| Locale               | ${locale.padEnd(37, ' ')} |`,
    '| Content source       | portfolio-content via GitHub Raw      |',
    '+----------------------+---------------------------------------+',
    `| Hint                 | ${helpLine.padEnd(37, ' ')} |`,
    '+--------------------------------------------------------------+',
  ];
};

interface TerminalShellProps {
  embedded?: boolean;
}

const serializeLines = (lines: string[]): string => lines.join('\n');

export function TerminalShell({ embedded = false }: TerminalShellProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [theme, setTheme] = useState<TerminalTheme>('matrix');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    createBootMessage(initialLocale).map((line, index) => ({
      id: index,
      type: 'output',
      content: line,
      createdAt: Date.now() + index,
    })),
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const prompt = useMemo(() => `booker@portfolio-terminal:${locale} ~ %`, [locale]);

  const addEntry = (type: HistoryEntry['type'], contentValue: string): void => {
    setHistory((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        type,
        content: contentValue,
        createdAt: Date.now(),
      },
    ]);
  };

  const clearTerminal = (): void => {
    setHistory([]);
  };

  const loadContent = async (targetLocale = locale): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const nextContent = await portfolioContentService.getContent(targetLocale);
      setContent(nextContent);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Erro desconhecido.';
      setError(message);
      addEntry('error', `Falha ao carregar conteudo remoto: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadContent(locale);
  }, [locale]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [history, isLoading]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    const rawCommand = input;
    const normalized = rawCommand.trim();

    if (!normalized) {
      addEntry('input', `${prompt}`);
      setInput('');
      return;
    }

    addEntry('input', `${prompt} ${normalized}`);

    setCommandHistory((prev) => [normalized, ...prev.filter((item) => item !== normalized)]);
    setHistoryCursor(null);
    setInput('');

    if (!content) {
      addEntry('error', 'Conteudo ainda nao carregado. Tente novamente em instantes.');
      return;
    }

    const result = await executeCommand({
      command: normalized,
      content,
      currentLocale: locale,
      isFullscreen,
      setLocale,
      setTheme,
      setFullscreen: setIsFullscreen,
      clear: clearTerminal,
      reload: () => loadContent(locale),
    });

    if (result.lines.length > 0) {
      addEntry(result.type, serializeLines(result.lines));
    }
  };

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHistoryCursor((prev) => {
        if (commandHistory.length === 0) return null;

        const nextIndex = prev === null ? 0 : Math.min(prev + 1, commandHistory.length - 1);
        setInput(commandHistory[nextIndex] ?? '');
        return nextIndex;
      });
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHistoryCursor((prev) => {
        if (prev === null) return null;

        const nextIndex = prev - 1;

        if (nextIndex < 0) {
          setInput('');
          return null;
        }

        setInput(commandHistory[nextIndex] ?? '');
        return nextIndex;
      });
    }
  };

  return (
    <section
      className={`terminal-shell ${themeClassMap[theme]} ${isFullscreen ? 'terminal-shell-fullscreen' : ''} ${embedded ? 'terminal-shell-embedded' : ''}`}
      aria-label="Portfolio terminal"
    >
      {!embedded && (
        <header className="terminal-window-bar" aria-hidden="true">
          <div className="terminal-window-controls">
            <span className="terminal-window-button terminal-window-button-close" />
            <span className="terminal-window-button terminal-window-button-minimize" />
            <span className="terminal-window-button terminal-window-button-maximize" />
          </div>
          <span className="terminal-window-title">portfolio-terminal</span>
        </header>
      )}

      <main
        className="terminal-screen"
        role="log"
        aria-live="polite"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((entry) => (
          <article key={entry.id} className={`terminal-entry terminal-entry-${entry.type}`}>
            <pre className="terminal-entry-body">{entry.content}</pre>
          </article>
        ))}

        {isLoading && <p className="terminal-runtime-status">syncing remote content...</p>}

        {error && <p className="terminal-runtime-status terminal-runtime-status-error">last error: {error}</p>}

        <form className="terminal-input-row" onSubmit={(event) => void onSubmit(event)}>
          <label htmlFor="terminal-input" className="sr-only">
            Comando
          </label>
          <span className="terminal-prompt">{prompt}</span>
          <input
            id="terminal-input"
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={onInputKeyDown}
            autoComplete="off"
            spellCheck={false}
            className="terminal-input"
            disabled={isLoading}
            aria-describedby="terminal-help"
          />
        </form>
        <p id="terminal-help" className="terminal-helper">Enter executa comando. Setas navegam no historico.</p>

        <div ref={bottomRef} />
      </main>
    </section>
  );
}

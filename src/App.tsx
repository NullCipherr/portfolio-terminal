import { TerminalShell } from './features/terminal/components/TerminalShell';

export function App() {
  const isEmbedded = (() => {
    if (typeof window === 'undefined') return false;

    const hasEmbedParam = new URLSearchParams(window.location.search).get('embed') === '1';
    const isInsideIframe = window.self !== window.top;
    return hasEmbedParam || isInsideIframe;
  })();

  return (
    <div className={`app-root ${isEmbedded ? 'app-root-embedded' : ''}`}>
      <TerminalShell embedded={isEmbedded} />
    </div>
  );
}

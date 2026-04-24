import { TerminalShell } from './features/terminal/components/TerminalShell';

export function App() {
  const isEmbedded =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('embed') === '1';

  return (
    <div className={`app-root ${isEmbedded ? 'app-root-embedded' : ''}`}>
      <TerminalShell embedded={isEmbedded} />
    </div>
  );
}

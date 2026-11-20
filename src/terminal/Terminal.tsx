import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { complete } from './autocomplete';
import { BANNER, commandNames, commands } from './commands';
import { parse } from './parser';
import { RunContext } from './RunLink';
import { loadTheme, saveTheme, type ThemeName } from './themes';

interface Entry {
  id: number;
  input: string | null;
  output: ReactNode;
}

const PROMPT = 'visitor@portfolio:~$';
const QUICK_COMMANDS = ['help', 'about', 'projects', 'skills', 'github', 'contact'];

let nextId = 0;

export function Terminal() {
  const [entries, setEntries] = useState<Entry[]>(() => [
    { id: nextId++, input: null, output: BANNER },
  ]);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [theme, setThemeState] = useState<ThemeName>(loadTheme);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    saveTheme(theme);
  }, [theme]);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' });
  }, [entries]);

  const print = (entry: Omit<Entry, 'id'>) =>
    setEntries((prev) => [...prev, { ...entry, id: nextId++ }]);

  const execute = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      setInput('');
      setCursor(null);
      if (!trimmed) {
        print({ input: '', output: null });
        return;
      }
      const updatedHistory = [...history, trimmed];
      setHistory(updatedHistory);

      const parsed = parse(trimmed)!;
      const command = commands[parsed.name];
      if (!command) {
        print({
          input: trimmed,
          output: (
            <p className="error">
              command not found: {parsed.name}. Type <code>help</code> for a list of commands.
            </p>
          ),
        });
        return;
      }

      let cleared = false;
      setBusy(true);
      try {
        const output = await command.run({
          args: parsed.args,
          history: updatedHistory,
          theme,
          setTheme: setThemeState,
          clear: () => {
            cleared = true;
            setEntries([]);
          },
          openUrl: (url) => window.open(url, '_blank', 'noopener,noreferrer'),
        });
        if (!cleared) print({ input: trimmed, output });
      } finally {
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [history, theme],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (!busy) void execute(input);
        break;
      case 'ArrowUp': {
        event.preventDefault();
        if (history.length === 0) return;
        const next = cursor === null ? history.length - 1 : Math.max(0, cursor - 1);
        setCursor(next);
        setInput(history[next]!);
        break;
      }
      case 'ArrowDown': {
        event.preventDefault();
        if (cursor === null) return;
        const next = cursor + 1;
        if (next >= history.length) {
          setCursor(null);
          setInput('');
        } else {
          setCursor(next);
          setInput(history[next]!);
        }
        break;
      }
      case 'Tab': {
        event.preventDefault();
        const result = complete(
          input,
          commandNames(),
          (name) => commands[name]?.completions?.() ?? [],
        );
        setInput(result.value);
        if (result.candidates.length > 1) {
          print({ input, output: <p className="muted">{result.candidates.join('  ')}</p> });
        }
        break;
      }
      default:
        if (event.ctrlKey && event.key.toLowerCase() === 'l') {
          event.preventDefault();
          setEntries([]);
        } else if (event.ctrlKey && event.key.toLowerCase() === 'c') {
          event.preventDefault();
          print({ input: `${input}^C`, output: null });
          setInput('');
        }
    }
  };

  return (
    <RunContext value={(cmd) => void execute(cmd)}>
      <main
        className="terminal"
        onClick={() => window.getSelection()?.isCollapsed && inputRef.current?.focus()}
      >
        <div className="titlebar" aria-hidden="true">
          <span className="dot red" />
          <span className="dot yellow" />
          <span className="dot green" />
          <span className="title">{PROMPT}</span>
        </div>

        <section className="screen" aria-live="polite" aria-label="Terminal output">
          {entries.map((entry) => (
            <div key={entry.id} className="entry">
              {entry.input !== null && (
                <div className="line">
                  <span className="prompt">{PROMPT}</span> {entry.input}
                </div>
              )}
              {entry.output && <div className="output">{entry.output}</div>}
            </div>
          ))}

          <form className="line input-line" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="terminal-input" className="prompt">
              {PROMPT}
            </label>
            <input
              id="terminal-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Command input"
              disabled={busy}
            />
          </form>
          <div ref={endRef} />
        </section>

        <nav className="quick" aria-label="Quick commands">
          {QUICK_COMMANDS.map((cmd) => (
            <button key={cmd} type="button" onClick={() => void execute(cmd)}>
              {cmd}
            </button>
          ))}
        </nav>
      </main>
    </RunContext>
  );
}

import { createContext, use, type ReactNode } from 'react';

/** Lets command output contain clickable commands without prop-drilling the runner. */
export const RunContext = createContext<(input: string) => void>(() => {});

export function RunLink({ cmd, children }: { cmd: string; children?: ReactNode }) {
  const run = use(RunContext);
  return (
    <button type="button" className="run-link" onClick={() => run(cmd)} title={`Run "${cmd}"`}>
      {children ?? cmd}
    </button>
  );
}

export function ExternalLink({ href, children }: { href: string; children?: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {children ?? href.replace(/^https?:\/\//, '')}
    </a>
  );
}

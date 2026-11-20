import type { ReactNode } from 'react';
import { profile } from '../data/profile';
import { fetchGitHubSummary } from './github';
import { ExternalLink, RunLink } from './RunLink';
import { isTheme, THEMES, type ThemeName } from './themes';

export interface CommandContext {
  args: string[];
  history: string[];
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  clear: () => void;
  openUrl: (url: string) => void;
}

export interface Command {
  description: string;
  usage?: string;
  hidden?: boolean;
  /** Candidates for tab completion of the first argument. */
  completions?: () => string[];
  run: (ctx: CommandContext) => ReactNode | Promise<ReactNode>;
}

const projectSlugs = () => profile.projects.map((p) => p.slug);

/** A box-drawn banner sized to its content, so it adapts when profile.ts changes. */
function boxBanner(lines: string[]): string {
  const width = Math.max(...lines.map((l) => l.length)) + 4;
  const row = (text: string) => `│  ${text.padEnd(width - 4)}  │`;
  return [`┌${'─'.repeat(width)}┐`, ...lines.map(row), `└${'─'.repeat(width)}┘`].join('\n');
}

const Banner = () => (
  <div className="banner">
    <pre aria-hidden="true" className="accent">
      {boxBanner([`>_ ${profile.name.toLowerCase()}`, '', profile.role.toLowerCase()])}
    </pre>
    <h1 className="sr-only">
      {profile.name} — {profile.role}
    </h1>
    <p>
      Welcome! Type <RunLink cmd="help" /> to see available commands, or try{' '}
      <RunLink cmd="projects" />. Use <kbd>Tab</kbd> to autocomplete and <kbd>↑</kbd>/<kbd>↓</kbd>{' '}
      for history.
    </p>
  </div>
);

export const commands: Record<string, Command> = {
  help: {
    description: 'List available commands',
    run: () => (
      <table className="help">
        <tbody>
          {Object.entries(commands)
            .filter(([, c]) => !c.hidden)
            .map(([name, c]) => (
              <tr key={name}>
                <td>
                  <RunLink cmd={name} />
                </td>
                <td className="muted">{c.usage ?? ''}</td>
                <td>{c.description}</td>
              </tr>
            ))}
        </tbody>
      </table>
    ),
  },

  about: {
    description: 'Who I am',
    run: () => (
      <div>
        <p className="accent">
          {profile.name} — {profile.role}
        </p>
        {profile.summary.map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p className="muted">
          See <RunLink cmd="skills" />, <RunLink cmd="projects" /> or <RunLink cmd="contact" />.
        </p>
      </div>
    ),
  },

  projects: {
    description: 'Things I have built',
    run: () => (
      <ul className="projects">
        {profile.projects.map((p) => (
          <li key={p.slug}>
            <RunLink cmd={`project ${p.slug}`}>{p.slug}</RunLink>
            <span className="muted"> — {p.tagline}</span>
          </li>
        ))}
      </ul>
    ),
  },

  project: {
    description: 'Details about a project',
    usage: '<name>',
    completions: projectSlugs,
    run: ({ args }) => {
      const project = profile.projects.find((p) => p.slug === args[0]?.toLowerCase());
      if (!project) {
        return (
          <p className="error">
            Usage: project &lt;name&gt;. Available: {projectSlugs().join(', ')}
          </p>
        );
      }
      return (
        <div className="project">
          <p className="accent">
            {project.name} <span className="muted">— {project.tagline}</span>
          </p>
          <p>{project.description}</p>
          <p className="tags">
            {project.stack.map((s) => (
              <span key={s} className="tag">
                {s}
              </span>
            ))}
          </p>
          <p>
            source: <ExternalLink href={project.repo} />
            {project.demo && (
              <>
                {' · '}demo: <ExternalLink href={project.demo} />
              </>
            )}
          </p>
        </div>
      );
    },
  },

  skills: {
    description: 'Languages, frameworks and tools',
    run: () => (
      <table className="skills">
        <tbody>
          {Object.entries(profile.skills).map(([group, items]) => (
            <tr key={group}>
              <td className="accent">{group}</td>
              <td>{items.join(' · ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    ),
  },

  github: {
    description: 'Live stats from my GitHub profile',
    run: async () => {
      try {
        const summary = await fetchGitHubSummary(profile.handle);
        return (
          <div>
            <p>
              <span className="accent">{summary.publicRepos}</span> public repos ·{' '}
              <span className="accent">{summary.followers}</span> followers
            </p>
            <ul className="projects">
              {summary.topRepos.map((r) => (
                <li key={r.name}>
                  <ExternalLink href={r.html_url}>{r.name}</ExternalLink>
                  <span className="muted">
                    {' '}
                    ★{r.stargazers_count} {r.language ?? ''}
                    {r.description ? ` — ${r.description}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        );
      } catch (error) {
        return <p className="error">github: {(error as Error).message}</p>;
      }
    },
  },

  contact: {
    description: 'Where to find me',
    run: () => (
      <ul className="plain">
        {profile.links.map((l) => (
          <li key={l.url}>
            <span className="accent">{l.label.padEnd(10)}</span> <ExternalLink href={l.url} />
          </li>
        ))}
      </ul>
    ),
  },

  open: {
    description: 'Open a project repo or link in a new tab',
    usage: '<name>',
    completions: () => [...projectSlugs(), ...profile.links.map((l) => l.label.toLowerCase())],
    run: ({ args, openUrl }) => {
      const target = args[0]?.toLowerCase();
      const url =
        profile.projects.find((p) => p.slug === target)?.repo ??
        profile.links.find((l) => l.label.toLowerCase() === target)?.url;
      if (!url) return <p className="error">open: unknown target "{args[0] ?? ''}"</p>;
      openUrl(url);
      return <p className="muted">Opening {url}…</p>;
    },
  },

  theme: {
    description: 'Change the color theme',
    usage: '[name]',
    completions: () => Object.keys(THEMES),
    run: ({ args, theme, setTheme }) => {
      const requested = args[0]?.toLowerCase();
      if (!requested) {
        return (
          <p>
            Current: <span className="accent">{theme}</span>. Available:{' '}
            {Object.keys(THEMES).map((t) => (
              <span key={t}>
                <RunLink cmd={`theme ${t}`}>{t}</RunLink>{' '}
              </span>
            ))}
          </p>
        );
      }
      if (!isTheme(requested)) return <p className="error">theme: unknown theme "{requested}"</p>;
      setTheme(requested);
      return <p className="muted">Theme set to {THEMES[requested].label}.</p>;
    },
  },

  neofetch: {
    description: 'System information, portfolio edition',
    run: ({ theme }) => (
      <div className="neofetch">
        <pre aria-hidden="true" className="accent">{String.raw`
   ______
  | >_   |
  |      |
  |______|
`}</pre>
        <table>
          <tbody>
            {[
              ['user', `${profile.handle}@portfolio`],
              ['role', profile.role],
              ['os', 'TypeScript / Node.js / React'],
              ['shell', 'terminal-portfolio 1.0'],
              ['theme', THEMES[theme].label],
              ['projects', String(profile.projects.length)],
              ['uptime', 'always learning'],
            ].map(([k, v]) => (
              <tr key={k}>
                <td className="accent">{k}</td>
                <td>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },

  banner: { description: 'Show the welcome banner', run: () => <Banner /> },
  whoami: { description: 'Print the current user', run: () => <p>visitor (welcome! 👋)</p> },
  date: { description: 'Print the current date', run: () => <p>{new Date().toString()}</p> },
  echo: {
    description: 'Print arguments',
    usage: '<text>',
    run: ({ args }) => <p>{args.join(' ')}</p>,
  },

  history: {
    description: 'Show command history',
    run: ({ history }) => (
      <ol className="plain">
        {history.map((h, i) => (
          <li key={i}>
            <span className="muted">{String(i + 1).padStart(3)}</span> {h}
          </li>
        ))}
      </ol>
    ),
  },

  clear: {
    description: 'Clear the screen (Ctrl+L)',
    run: ({ clear }) => {
      clear();
      return null;
    },
  },

  sudo: {
    description: 'Run as superuser',
    hidden: true,
    run: () => (
      <p className="error">Permission denied: nice try 😄 — but you can hire me instead.</p>
    ),
  },
  exit: {
    description: 'Exit',
    hidden: true,
    run: () => (
      <p className="muted">
        There is no escape. Try <RunLink cmd="projects" />.
      </p>
    ),
  },
};

export const BANNER = <Banner />;

export const commandNames = () => Object.keys(commands).filter((n) => !commands[n]!.hidden);

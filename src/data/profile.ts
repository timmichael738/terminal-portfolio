/**
 * All portfolio content lives here. Edit this file to make the terminal your own —
 * every command reads from it, so no component code needs to change.
 */
export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  repo: string;
  demo?: string;
}

export interface Profile {
  name: string;
  handle: string;
  role: string;
  summary: string[];
  links: { label: string; url: string }[];
  skills: Record<string, string[]>;
  projects: Project[];
}

const gh = (repo: string) => `https://github.com/timmichael738/${repo}`;
const pages = (repo: string) => `https://timmichael738.github.io/${repo}/`;

export const profile: Profile = {
  name: 'Michael Timothy',
  handle: 'timmichael738',
  role: 'Full-Stack Software Engineer',
  summary: [
    'I build reliable backends and polished frontends with TypeScript, Node.js and React.',
    'I enjoy the hard parts: concurrency, distributed state, real-time systems, and the UX details that make software feel effortless.',
  ],
  links: [{ label: 'GitHub', url: 'https://github.com/timmichael738' }],
  skills: {
    Languages: ['TypeScript', 'JavaScript', 'Kotlin', 'SQL'],
    Backend: ['Node.js', 'Fastify', 'Express', 'REST', 'WebSockets', 'SSE'],
    Frontend: ['React', 'Vite', 'HTML/CSS', 'Accessibility'],
    Data: ['PostgreSQL', 'Redis', 'MongoDB'],
    Tooling: ['Docker', 'GitHub Actions', 'Vitest', 'ESLint', 'Prometheus'],
  },
  projects: [
    {
      slug: 'gatekeeper',
      name: 'Gatekeeper',
      tagline: 'API gateway with distributed rate limiting',
      description:
        'Token-bucket and sliding-window limits shared across replicas via atomic Redis Lua scripts, hashed API keys, Prometheus metrics and fail-open behaviour.',
      stack: ['TypeScript', 'Fastify', 'Redis', 'Prometheus', 'Docker'],
      repo: gh('gatekeeper'),
    },
    {
      slug: 'taskforge',
      name: 'Taskforge',
      tagline: 'Postgres-backed background job queue',
      description:
        'SKIP LOCKED workers, LISTEN/NOTIFY wake-ups, jittered retries, a dead-letter queue, crash-safe leases, cron schedules and a live dashboard.',
      stack: ['TypeScript', 'PostgreSQL', 'Fastify', 'Docker'],
      repo: gh('taskforge'),
    },
    {
      slug: 'hookrelay',
      name: 'Hookrelay',
      tagline: 'Webhook inspector and localhost tunnel',
      description:
        'Capture webhooks, inspect them live over SSE, and pipe them to your laptop through a WebSocket tunnel CLI with one-click replay.',
      stack: ['TypeScript', 'Fastify', 'WebSockets', 'SSE', 'CLI'],
      repo: gh('hookrelay'),
    },
    {
      slug: 'inkwell',
      name: 'Inkwell',
      tagline: 'Real-time collaborative Markdown editor',
      description:
        'Yjs CRDTs synced over a hand-written y-websocket server, live cursors and presence, SQLite persistence and version history.',
      stack: ['TypeScript', 'Yjs', 'WebSockets', 'CodeMirror', 'React'],
      repo: gh('inkwell'),
    },
    {
      slug: 'terminal-portfolio',
      name: 'Terminal Portfolio',
      tagline: 'This site',
      description:
        'A keyboard-first portfolio with command history, tab completion, themes and live GitHub data.',
      stack: ['React', 'TypeScript', 'Vite'],
      repo: gh('terminal-portfolio'),
      demo: pages('terminal-portfolio'),
    },
    {
      slug: 'quakewatch',
      name: 'Quakewatch',
      tagline: 'Real-time earthquake dashboard',
      description:
        'Live USGS data on an interactive map with magnitude distribution, activity timelines, shareable filters and auto-refresh.',
      stack: ['React', 'TypeScript', 'Leaflet', 'SVG charts'],
      repo: gh('quakewatch'),
      demo: pages('quakewatch'),
    },
    {
      slug: 'flowboard',
      name: 'Flowboard',
      tagline: 'Keyboard-friendly Kanban board',
      description:
        'Accessible drag and drop, unlimited undo/redo, shortcuts, search, labels and JSON import/export — all offline-first.',
      stack: ['React', 'TypeScript', 'dnd-kit'],
      repo: gh('flowboard'),
      demo: pages('flowboard'),
    },
    {
      slug: 'lumen-ui',
      name: 'Lumen UI',
      tagline: 'Accessible React component library',
      description:
        'WAI-ARIA patterns with full keyboard support, axe-tested components, CSS-variable theming and Storybook docs.',
      stack: ['React', 'TypeScript', 'Storybook', 'axe-core'],
      repo: gh('lumen-ui'),
      demo: pages('lumen-ui'),
    },
    {
      slug: 'diffsense',
      name: 'Diffsense',
      tagline: 'AI code reviewer',
      description:
        'Paste a diff or a GitHub PR link and get a streamed, structured review with severity-ranked findings and token cost tracking.',
      stack: ['TypeScript', 'Fastify', 'React', 'LLM streaming'],
      repo: gh('diffsense'),
    },
    {
      slug: 'slotly',
      name: 'Slotly',
      tagline: 'Scheduling SaaS',
      description:
        'Availability rules, time-zone-correct booking pages and double-booking prevention enforced by a Postgres exclusion constraint.',
      stack: ['TypeScript', 'Fastify', 'PostgreSQL', 'React'],
      repo: gh('slotly'),
    },
    {
      slug: 'pulsewatch',
      name: 'Pulsewatch',
      tagline: 'Uptime monitor and status page',
      description:
        'Scheduled HTTP checks, incident detection with Discord alerts and a public status page with 90-day uptime bars.',
      stack: ['TypeScript', 'Fastify', 'SQLite', 'React'],
      repo: gh('pulsewatch'),
    },
  ],
};

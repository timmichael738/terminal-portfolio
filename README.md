# Terminal Portfolio

[![CI](https://github.com/timmichael738/terminal-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/timmichael738/terminal-portfolio/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)
![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)

**A developer portfolio you explore by typing commands.** It's keyboard-first and fast,
with a few easter eggs.

### 👉 [Live demo](https://timmichael738.github.io/terminal-portfolio/)

```text
visitor@portfolio:~$ help
visitor@portfolio:~$ projects
visitor@portfolio:~$ project gatekeeper
visitor@portfolio:~$ github          # live stats from the GitHub API
visitor@portfolio:~$ theme matrix
```

## Features

- **Real shell ergonomics**
  - <kbd>Tab</kbd> completion for commands _and_ their arguments (`project ga⇥` → `project gatekeeper`), extending to the longest common prefix like bash
  - <kbd>↑</kbd>/<kbd>↓</kbd> history, <kbd>Ctrl</kbd>+<kbd>L</kbd> to clear, <kbd>Ctrl</kbd>+<kbd>C</kbd> to cancel
  - A quote-aware tokenizer (`echo "hello world"`)
- **Clickable output.** Commands in the output are buttons, so mouse and touch users can browse too, and a quick-command bar helps on mobile.
- **Live GitHub data.** `github` fetches public repos and followers, ranks original work by stars and recent activity, and caches results for the session.
- **Four themes** (Dracula, Nord, Matrix, Solarized Light). The default follows the OS preference, and your choice is saved.
- **Accessible.** Output is an `aria-live` region, every control is keyboard reachable, and a screen-reader heading names the page.
- **Data-driven.** All content lives in [`src/data/profile.ts`](src/data/profile.ts), so no component changes are needed to make it yours.

## Commands

`help` · `about` · `projects` · `project <name>` · `skills` · `github` · `contact` ·
`open <name>` · `theme [name]` · `neofetch` · `history` · `clear` · `banner` · `whoami` ·
`date` · `echo` … and a couple of hidden ones.

## Architecture

```text
src/
  data/profile.ts         All portfolio content (edit this)
  terminal/
    parser.ts             Quote/escape-aware tokenizer
    autocomplete.ts       Bash-style completion (pure function)
    commands.tsx          Command registry: name → { description, completions, run }
    github.ts             GitHub API client with session cache + ranking
    themes.ts             Theme registry + persistence
    RunLink.tsx           Clickable commands via React context
    Terminal.tsx          Input handling, history, rendering
```

Adding a command is one entry in the registry. `help` and tab completion pick it up automatically:

```tsx
weather: {
  description: 'Current weather',
  run: async ({ args }) => <p>{await getWeather(args[0])}</p>,
},
```

## Development

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # Vitest + Testing Library
npm run build
```

Every push to `main` is linted, type-checked, tested, built and deployed to GitHub Pages by
[GitHub Actions](.github/workflows/ci.yml).

## License

[MIT](LICENSE) © Michael Timothy

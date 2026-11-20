import { describe, expect, it } from 'vitest';
import { complete } from './autocomplete';
import { rankRepos, type Repo } from './github';
import { parse, tokenize } from './parser';

describe('tokenize', () => {
  it('splits on whitespace', () => {
    expect(tokenize('  project   gatekeeper ')).toEqual(['project', 'gatekeeper']);
  });

  it('respects quotes and escapes', () => {
    expect(tokenize(`echo "hello world" 'it''s' a\\ b`)).toEqual([
      'echo',
      'hello world',
      'its',
      'a b',
    ]);
  });

  it('keeps empty quoted arguments', () => {
    expect(tokenize('echo ""')).toEqual(['echo', '']);
  });
});

describe('parse', () => {
  it('lower-cases the command name only', () => {
    expect(parse('THEME Nord')).toEqual({ name: 'theme', args: ['Nord'] });
  });

  it('returns null for blank input', () => {
    expect(parse('   ')).toBeNull();
  });
});

describe('complete', () => {
  const commands = ['help', 'history', 'project', 'projects', 'theme'];
  const args = (cmd: string) => (cmd === 'theme' ? ['dracula', 'nord', 'matrix'] : []);

  it('completes a unique command and adds a space', () => {
    expect(complete('the', commands, args)).toEqual({ value: 'theme ', candidates: ['theme'] });
  });

  it('extends to the longest common prefix when ambiguous', () => {
    const result = complete('pro', commands, args);
    expect(result.value).toBe('project');
    expect(result.candidates).toEqual(['project', 'projects']);
  });

  it('completes arguments for the current command', () => {
    expect(complete('theme n', commands, args).value).toBe('theme nord ');
    expect(complete('theme ', commands, args).candidates).toEqual(['dracula', 'matrix', 'nord']);
  });

  it('leaves input unchanged when nothing matches', () => {
    expect(complete('xyz', commands, args)).toEqual({ value: 'xyz', candidates: [] });
  });
});

describe('rankRepos', () => {
  const repo = (name: string, stars: number, pushed: string, fork = false): Repo => ({
    name,
    stargazers_count: stars,
    pushed_at: pushed,
    fork,
    description: null,
    html_url: '',
    language: null,
  });

  it('drops forks and sorts by stars, then recency', () => {
    const ranked = rankRepos([
      repo('old', 1, '2025-01-01'),
      repo('fork', 99, '2026-01-01', true),
      repo('new', 1, '2026-06-01'),
      repo('star', 5, '2024-01-01'),
    ]);
    expect(ranked.map((r) => r.name)).toEqual(['star', 'new', 'old']);
  });
});

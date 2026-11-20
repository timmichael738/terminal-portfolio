export interface CompletionResult {
  /** The new input value (unchanged if nothing could be completed). */
  value: string;
  /** All candidates, shown to the user when the completion is ambiguous. */
  candidates: string[];
}

export type ArgumentSource = (command: string) => string[];

function commonPrefix(words: string[]): string {
  if (words.length === 0) return '';
  let prefix = words[0]!;
  for (const word of words.slice(1)) {
    while (!word.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

/**
 * Bash-like tab completion. Completes the command name for the first word and, for later
 * words, the arguments that command accepts. Extends to the longest common prefix when
 * several candidates match.
 */
export function complete(
  input: string,
  commands: string[],
  argumentsFor: ArgumentSource,
): CompletionResult {
  const endsWithSpace = /\s$/.test(input);
  const words = input.trimStart().split(/\s+/).filter(Boolean);
  if (endsWithSpace || words.length === 0) words.push('');

  const isCommand = words.length === 1;
  const partial = words.at(-1)!.toLowerCase();
  const pool = isCommand ? commands : argumentsFor(words[0]!.toLowerCase());
  const candidates = pool.filter((c) => c.toLowerCase().startsWith(partial)).sort();

  if (candidates.length === 0) return { value: input, candidates: [] };

  const completion = candidates.length === 1 ? `${candidates[0]} ` : commonPrefix(candidates);
  const head = words.slice(0, -1).join(' ');
  const value = head ? `${head} ${completion}` : completion;
  return { value: value.length >= input.length ? value : input, candidates };
}

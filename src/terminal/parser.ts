export interface ParsedCommand {
  name: string;
  args: string[];
}

/**
 * Shell-style tokenizer: splits on whitespace, honours single and double quotes,
 * and supports backslash escapes ("echo 'hello world'" → ["echo", "hello world"]).
 */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let hasToken = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i]!;
    if (ch === '\\' && i + 1 < input.length && quote !== "'") {
      current += input[++i];
      hasToken = true;
    } else if (quote) {
      if (ch === quote) quote = null;
      else current += ch;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
      hasToken = true;
    } else if (/\s/.test(ch)) {
      if (hasToken) tokens.push(current);
      current = '';
      hasToken = false;
    } else {
      current += ch;
      hasToken = true;
    }
  }
  if (hasToken) tokens.push(current);
  return tokens;
}

export function parse(input: string): ParsedCommand | null {
  const [name, ...args] = tokenize(input.trim());
  return name ? { name: name.toLowerCase(), args } : null;
}

export interface Repo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  pushed_at: string;
}

export interface GitHubSummary {
  publicRepos: number;
  followers: number;
  topRepos: Repo[];
}

let cache: Promise<GitHubSummary> | null = null;

/** Fetches live profile stats from the public GitHub API (cached for the session). */
export function fetchGitHubSummary(
  user: string,
  fetcher: typeof fetch = fetch,
): Promise<GitHubSummary> {
  cache ??= (async () => {
    const [userRes, reposRes] = await Promise.all([
      fetcher(`https://api.github.com/users/${user}`),
      fetcher(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`),
    ]);
    if (!userRes.ok || !reposRes.ok) {
      const limited = userRes.status === 403 || reposRes.status === 403;
      throw new Error(
        limited ? 'GitHub API rate limit reached, try again later' : 'GitHub API request failed',
      );
    }
    const profile = (await userRes.json()) as { public_repos: number; followers: number };
    const repos = (await reposRes.json()) as Repo[];
    return {
      publicRepos: profile.public_repos,
      followers: profile.followers,
      topRepos: rankRepos(repos).slice(0, 6),
    };
  })().catch((error: unknown) => {
    cache = null; // allow a retry after failures
    throw error;
  });
  return cache;
}

/** Original work first, ordered by stars and then by most recent activity. */
export function rankRepos(repos: Repo[]): Repo[] {
  return repos
    .filter((r) => !r.fork)
    .sort(
      (a, b) =>
        b.stargazers_count - a.stargazers_count ||
        Date.parse(b.pushed_at) - Date.parse(a.pushed_at),
    );
}

export function resetGitHubCache(): void {
  cache = null;
}

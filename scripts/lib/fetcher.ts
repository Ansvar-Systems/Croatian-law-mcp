/**
 * Rate-limited HTTP client for Narodne novine ingestion.
 *
 * Official limits documented by NN API: up to 3 requests/second.
 * We stay below this with a 1.2s minimum delay between requests.
 */

const USER_AGENT =
  'Ansvar-Law-MCP-Ingestion/1.0 (+https://github.com/Ansvar-Systems/Croatian-law-mcp)';
const MIN_DELAY_MS = 1200;

let lastRequestAt = 0;

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function enforceRateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestAt;
  if (elapsed < MIN_DELAY_MS) {
    await sleep(MIN_DELAY_MS - elapsed);
  }
  lastRequestAt = Date.now();
}

export interface FetchResult {
  status: number;
  body: string;
  contentType: string;
  url: string;
}

export async function fetchWithRateLimit(url: string, maxRetries = 3): Promise<FetchResult> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    await enforceRateLimit();

    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html, application/json;q=0.9, */*;q=0.8',
      },
      redirect: 'follow',
    });

    if ((response.status === 429 || response.status >= 500) && attempt < maxRetries) {
      const backoff = 1000 * Math.pow(2, attempt + 1);
      await sleep(backoff);
      continue;
    }

    const body = await response.text();
    return {
      status: response.status,
      body,
      contentType: response.headers.get('content-type') ?? '',
      url: response.url,
    };
  }

  throw new Error(`Failed to fetch ${url} after ${maxRetries + 1} attempts`);
}

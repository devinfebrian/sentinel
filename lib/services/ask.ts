/**
 * Ask Sentinel hits the FastAPI agent server (port 8000), a different service
 * from sentinel-backend. next.config.ts rewrites /api/ask to it, so the browser
 * stays same-origin and no token leaves the origin. Unlike the backend, its
 * responses are NOT wrapped in a { success, message, data } envelope — the
 * answer fields come back flat, so this service does its own fetch.
 */

export interface AskResponse {
  answer: string;
  data_range: string;
  unsourced_figures: string[];
}

const ASK_ENDPOINT = '/api/ask';

/** Masks network, HTTP, and parse failures to a clean message. */
export async function askSentinelApi(question: string): Promise<AskResponse> {
  let response: Response;

  try {
    response = await fetch(ASK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
  } catch {
    throw new Error('Network error. Unable to reach the AI assistant.');
  }

  if (!response.ok) {
    throw new Error(
      `The AI assistant is unavailable right now (${response.status}). Please try again later.`
    );
  }

  try {
    return (await response.json()) as AskResponse;
  } catch {
    throw new Error('The AI assistant returned an invalid response.');
  }
}

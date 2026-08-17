import { TryOnError, TryOnJob, TryOnRequestPayload } from "@/types/tryOn";

/**
 * Real backend client.
 *
 * The frontend never talks to YouCam directly and never holds an API key —
 * it only calls our own backend, which owns the YouCam integration.
 * These two functions are the entire contract the UI depends on, so the
 * backend implementation (or the mock in mockTryOnApi.ts) can change
 * freely without touching any component.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

async function parseOrThrow(res: Response): Promise<any> {
  if (!res.ok) {
    const err: TryOnError =
      res.status >= 500
        ? { code: "SERVER_ERROR", message: "We couldn't create your look this time. Please try again." }
        : { code: "GENERATION_FAILED", message: "We couldn't process that request. Please try again." };
    throw err;
  }
  return res.json();
}

export async function createTryOn(
  payload: TryOnRequestPayload
): Promise<{ jobId: string; status: string }> {
  try {
    const res = await fetch(`${BASE_URL}/try-on`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await parseOrThrow(res);
  } catch (e) {
    if ((e as TryOnError)?.code) throw e;
    const err: TryOnError = { code: "NETWORK_ERROR", message: "We couldn't reach FitnTry. Check your connection and try again." };
    throw err;
  }
}

export async function getTryOnStatus(jobId: string): Promise<TryOnJob> {
  try {
    const res = await fetch(`${BASE_URL}/try-on/${jobId}`);
    return await parseOrThrow(res);
  } catch (e) {
    if ((e as TryOnError)?.code) throw e;
    const err: TryOnError = { code: "NETWORK_ERROR", message: "We couldn't reach FitnTry. Check your connection and try again." };
    throw err;
  }
}

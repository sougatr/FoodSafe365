/**
 * FoodSafe365 — Request Body Size & Memory Protection Guard
 * P0-3 Hardening: Enforces strict 1 MB maximum payload limits and streaming size caps.
 */

export const MAX_BODY_BYTES_DEFAULT = 1024 * 1024; // 1 MB (1,048,576 bytes)

export type BoundedParseResult<T = any> =
  | { ok: true; data: T; bytesRead: number }
  | { ok: false; status: 413 | 400; code: 'PAYLOAD_TOO_LARGE' | 'INVALID_JSON'; message: string };

/**
 * Parses JSON request bodies safely with strict maximum byte size limit.
 * - Rejects early if Content-Length header exceeds maxBytes before reading stream.
 * - Reads stream with byte accumulator for chunked payloads, halting early on overflow.
 * - Prevents uncontrolled heap allocation and Out-Of-Memory (OOM) denial-of-service.
 */
export async function parseBoundedJson<T = any>(
  req: Request,
  maxBytes: number = MAX_BODY_BYTES_DEFAULT
): Promise<BoundedParseResult<T>> {
  const contentLengthHeader = req.headers.get('content-length');

  // 1. Upfront Content-Length check
  if (contentLengthHeader) {
    const declaredLength = parseInt(contentLengthHeader, 10);
    if (!isNaN(declaredLength) && declaredLength > maxBytes) {
      return {
        ok: false,
        status: 413,
        code: 'PAYLOAD_TOO_LARGE',
        message: `Request payload size (${declaredLength} bytes) exceeds maximum permitted limit of ${maxBytes} bytes (1 MB).`
      };
    }
  }

  // 2. Read stream with bounded byte counter
  let text = '';
  try {
    if (!req.body) {
      return { ok: true, data: {} as T, bytesRead: 0 };
    }

    const reader = req.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let totalBytes = 0;
    const chunks: string[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        // Abort stream immediately to prevent further memory buffering
        try {
          await reader.cancel('PAYLOAD_TOO_LARGE');
        } catch {
          // Ignore cancel error
        }
        return {
          ok: false,
          status: 413,
          code: 'PAYLOAD_TOO_LARGE',
          message: `Request stream exceeded maximum permitted limit of ${maxBytes} bytes (1 MB).`
        };
      }

      chunks.push(decoder.decode(value, { stream: true }));
    }

    chunks.push(decoder.decode()); // Flush any remaining bytes
    text = chunks.join('');

    if (!text.trim()) {
      return { ok: true, data: {} as T, bytesRead: totalBytes };
    }

    const data = JSON.parse(text);
    return { ok: true, data, bytesRead: totalBytes };
  } catch (err: any) {
    if (err instanceof SyntaxError) {
      return {
        ok: false,
        status: 400,
        code: 'INVALID_JSON',
        message: 'Malformed request payload. Failed to parse valid JSON.'
      };
    }
    return {
      ok: false,
      status: 400,
      code: 'INVALID_JSON',
      message: err?.message || 'Unable to read request payload.'
    };
  }
}

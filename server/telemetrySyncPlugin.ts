/**
 * Development/preview telemetry sync endpoint.
 *
 * Next.js would host this as `app/api/telemetry/sync/route.ts`; in this Vite
 * project the same route is provided by a Vite middleware plugin so the client
 * uses a real HTTP endpoint in both `npm run dev` and `npm run preview`.
 *
 * Production note: replace this middleware with the same handler behind your
 * authenticated ground relay. The request/response contract stays identical.
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { Plugin } from 'vite';

const SYNC_PATH = '/api/telemetry/sync';
const MAX_BODY_BYTES = 1024 * 1024; // 1 MB
const MAX_BATCH_SIZE = 500;
const VALID_MODES = new Set(['rest', 'exercise', 'sleep', 'stress']);
const VALID_SYNC_STATUSES = new Set(['pending', 'synced']);

interface ServerVitals {
  heart_rate: number;
  spo2: number;
  blood_pressure: { systolic: number; diastolic: number };
  body_temp: number;
}

interface ServerTelemetryLog {
  timestamp: string;
  crew_id: string;
  mode: string;
  vitals: ServerVitals;
  posture: string;
  sync_status: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function finiteNumber(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

function validateLog(
  value: unknown,
  index: number,
  crewId: string
): string | null {
  if (!isRecord(value)) return `logs[${index}] must be an object.`;
  if (value.crew_id !== crewId) return `logs[${index}].crew_id must match the batch crew_id.`;
  if (typeof value.timestamp !== 'string' || Number.isNaN(Date.parse(value.timestamp))) {
    return `logs[${index}].timestamp must be an ISO date string.`;
  }
  if (typeof value.mode !== 'string' || !VALID_MODES.has(value.mode)) {
    return `logs[${index}].mode is invalid.`;
  }
  if (typeof value.posture !== 'string' || value.posture.length === 0) {
    return `logs[${index}].posture must be a non-empty string.`;
  }
  if (typeof value.sync_status !== 'string' || !VALID_SYNC_STATUSES.has(value.sync_status)) {
    return `logs[${index}].sync_status is invalid.`;
  }
  if (!isRecord(value.vitals)) return `logs[${index}].vitals must be an object.`;

  const vitals = value.vitals;
  if (!finiteNumber(vitals.heart_rate, 20, 260)) {
    return `logs[${index}].vitals.heart_rate is out of range.`;
  }
  if (!finiteNumber(vitals.spo2, 0, 100)) {
    return `logs[${index}].vitals.spo2 is out of range.`;
  }
  if (!finiteNumber(vitals.body_temp, 20, 45)) {
    return `logs[${index}].vitals.body_temp is out of range.`;
  }
  if (!isRecord(vitals.blood_pressure)) {
    return `logs[${index}].vitals.blood_pressure must be an object.`;
  }
  if (
    !finiteNumber(vitals.blood_pressure.systolic, 30, 300) ||
    !finiteNumber(vitals.blood_pressure.diastolic, 20, 200)
  ) {
    return `logs[${index}].vitals.blood_pressure values are out of range.`;
  }

  return null;
}

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = '';
    let bytes = 0;

    req.on('data', (chunk: Buffer | string) => {
      bytes += Buffer.byteLength(chunk);
      if (bytes > MAX_BODY_BYTES) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      raw += chunk.toString();
    });

    req.on('end', () => {
      try {
        resolve(raw.length === 0 ? {} : JSON.parse(raw));
      } catch {
        reject(new Error('INVALID_JSON'));
      }
    });

    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  if (res.headersSent) return;
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

/**
 * Handle the sync route. Returns `true` when the request was claimed by this
 * middleware, `false` when Vite should continue to the next middleware.
 */
export async function handleTelemetrySyncRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<boolean> {
  if (!req.url) return false;

  const { pathname } = new URL(req.url, 'http://localhost');
  if (pathname !== SYNC_PATH) return false;

  if (req.method === 'GET') {
    sendJson(res, 200, {
      success: true,
      service: 'zenith-telemetry-sync',
      status: 'ready',
      max_batch_size: MAX_BATCH_SIZE,
      checked_at: new Date().toISOString(),
    });
    return true;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    sendJson(res, 405, { success: false, error: 'Method not allowed.' });
    return true;
  }

  let body: unknown;
  try {
    body = await readJsonBody(req);
  } catch (error) {
    const tooLarge = error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE';
    sendJson(res, tooLarge ? 413 : 400, {
      success: false,
      error: tooLarge ? 'Request body exceeds 1 MB.' : 'Request body must be valid JSON.',
    });
    return true;
  }

  if (!isRecord(body)) {
    sendJson(res, 400, { success: false, error: 'Body must be a JSON object.' });
    return true;
  }

  const crewId = body.crew_id;
  const logs = body.logs;

  if (typeof crewId !== 'string' || crewId.trim().length === 0) {
    sendJson(res, 400, { success: false, error: '`crew_id` must be a non-empty string.' });
    return true;
  }

  if (!Array.isArray(logs) || logs.length === 0) {
    sendJson(res, 400, { success: false, error: '`logs` must be a non-empty array.' });
    return true;
  }

  if (logs.length > MAX_BATCH_SIZE) {
    sendJson(res, 413, {
      success: false,
      error: `Batch exceeds the ${MAX_BATCH_SIZE}-packet limit.`,
    });
    return true;
  }

  const validationErrors = logs
    .map((log, index) => validateLog(log, index, crewId))
    .filter((error): error is string => error !== null);

  if (validationErrors.length > 0) {
    sendJson(res, 400, {
      success: false,
      error: 'One or more telemetry packets are invalid.',
      details: validationErrors.slice(0, 10),
    });
    return true;
  }

  const batchId = randomUUID();
  const processedAt = new Date().toISOString();
  const typedLogs = logs as ServerTelemetryLog[];
  const modes = [...new Set(typedLogs.map((log) => log.mode))].join(',');
  const anomalous = typedLogs.filter(
    (log) =>
      log.vitals.spo2 < 90 ||
      log.vitals.heart_rate > 180 ||
      log.vitals.body_temp > 38.5 ||
      log.vitals.blood_pressure.systolic > 180
  ).length;

  // Replace this with durable ground storage / message-queue publish.
  console.info(
    `[telemetry-sync] ${processedAt} batch=${batchId} crew=${crewId} received=${typedLogs.length} modes=${modes} critical_flags=${anomalous}`
  );

  sendJson(res, 200, {
    success: true,
    batch_id: batchId,
    crew_id: crewId,
    received: typedLogs.length,
    accepted: typedLogs.length,
    processed_at: processedAt,
  });
  return true;
}

/** Vite plugin that mounts the sync route in dev and preview servers. */
export function telemetrySyncApiPlugin(): Plugin {
  const middleware = (
    req: IncomingMessage,
    res: ServerResponse,
    next: (error?: unknown) => void
  ): void => {
    handleTelemetrySyncRequest(req, res)
      .then((handled) => {
        if (!handled) next();
      })
      .catch((error: unknown) => {
        console.error('[telemetry-sync] Unhandled route error:', error);
        sendJson(res, 500, { success: false, error: 'Internal telemetry sync error.' });
      });
  };

  return {
    name: 'zenith-telemetry-sync-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
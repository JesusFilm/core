import {
  type JsonWebKey,
  createHash,
  createHmac,
  createPrivateKey,
  createPublicKey,
  sign,
  timingSafeEqual,
  verify
} from 'node:crypto'

import { z } from 'zod'

import {
  editInput,
  historyActionInput,
  historyInput,
  operationInput
} from './editContract'
import { mediaSearchInput } from './mediaContract'

export const resultContractVersion = '1' as const
export const readResult = z
  .object({ contractVersion: z.literal(resultContractVersion) })
  .catchall(z.unknown())
export type ReadResult = z.infer<typeof readResult>
export const readFailure = z
  .object({
    contractVersion: z.literal(resultContractVersion),
    kind: z.literal('read_failure'),
    code: z.enum(['REVISION_CONFLICT', 'LIMIT_EXCEEDED'])
  })
  .strict()
export type ReadFailure = z.infer<typeof readFailure>

const id = z.string().min(1).max(200)
export const listInput = z
  .object({
    query: z.string().max(200).optional(),
    status: z.enum(['draft', 'published']).optional(),
    cursor: z.string().max(4096).optional(),
    limit: z.number().int().min(1).max(50).default(20)
  })
  .strict()
export const journeyInput = z
  .object({
    journeyId: id,
    view: z.enum(['outline', 'steps', 'settings']),
    stepIds: z.array(id).min(1).max(20).optional(),
    revision: z
      .string()
      .regex(/^(0|[1-9]\d{0,19})$/)
      .refine((value) => BigInt(value) <= 18446744073709551615n)
      .optional(),
    cursor: z.string().max(4096).optional()
  })
  .strict()
export const previewInput = z
  .object({
    journeyId: id,
    expectedRevision: journeyInput.shape.revision.unwrap(),
    startStepId: id.optional()
  })
  .strict()
export const readRequest = z.discriminatedUnion('tool', [
  z
    .object({
      tool: z.literal('journey_media_search'),
      input: mediaSearchInput
    })
    .strict(),
  z.object({ tool: z.literal('journeys_list'), input: listInput }).strict(),
  z.object({ tool: z.literal('journey_read'), input: journeyInput }).strict(),
  z.object({ tool: z.literal('journey_edit'), input: editInput }).strict(),
  z
    .object({ tool: z.literal('journey_history'), input: historyInput })
    .strict(),
  z
    .object({ tool: z.literal('journey_undo'), input: historyActionInput })
    .strict(),
  z
    .object({ tool: z.literal('journey_redo'), input: historyActionInput })
    .strict(),
  z
    .object({ tool: z.literal('journey_operation_get'), input: operationInput })
    .strict(),
  z.object({ tool: z.literal('journey_preview'), input: previewInput }).strict()
])
export type ReadRequest = z.infer<typeof readRequest>
export function isContentWrite(tool: ReadRequest['tool']): boolean {
  return (
    tool === 'journey_edit' ||
    tool === 'journey_undo' ||
    tool === 'journey_redo'
  )
}
export const maxStructuredResultBytes = 524288
export const maxTransportResponseBytes = maxStructuredResultBytes + 16384
export function assertStructuredResultSize(result: unknown): void {
  if (
    Buffer.byteLength(JSON.stringify(result), 'utf8') > maxStructuredResultBytes
  )
    throw new Error('LIMIT_EXCEEDED')
}
export const maxToolInputBytes = 262144
// Allow only bounded protocol/credential metadata around the decoded tool input.
export const maxTransportBytes = maxToolInputBytes + 16384
export class InputLimitExceeded extends Error {
  constructor() {
    super('LIMIT_EXCEEDED')
  }
}
export function assertRequestInputSize(request: ReadRequest): void {
  if (
    Buffer.byteLength(JSON.stringify(request.input), 'utf8') > maxToolInputBytes
  )
    throw new InputLimitExceeded()
}
export const readTransportRequest = z.discriminatedUnion('stage', [
  z.object({ request: readRequest, stage: z.literal('read') }).strict(),
  z
    .object({
      request: readRequest,
      stage: z.literal('output'),
      outputHash: z.string().length(64),
      dataHash: z.string().length(64)
    })
    .strict()
])
export const safeReadErrors = [
  'ACCESS_DENIED_OR_NOT_FOUND',
  'REVISION_CONFLICT',
  'LIMIT_EXCEEDED',
  'VALIDATION_FAILED',
  'DEPENDENCY_UNAVAILABLE',
  'IDEMPOTENCY_KEY_REUSED',
  'RESULT_EXPIRED',
  'RESULT_UNAVAILABLE',
  'NOT_EDITABLE',
  'HISTORY_CONFLICT',
  'HISTORY_UNAVAILABLE'
] as const
export function safeReadError(
  error: unknown,
  fallback: (typeof safeReadErrors)[number] = 'ACCESS_DENIED_OR_NOT_FOUND'
): (typeof safeReadErrors)[number] {
  return (
    safeReadErrors.find(
      (code) => error instanceof Error && code === error.message
    ) ?? fallback
  )
}
export const fingerprint = (value: unknown): string =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex')

export function signEnvelope(
  value: Record<string, unknown>,
  key: JsonWebKey
): string {
  const body = Buffer.from(JSON.stringify(value)).toString('base64url')
  const signature = sign(
    'RSA-SHA256',
    Buffer.from(body),
    createPrivateKey({ key, format: 'jwk' })
  )
  return `${body}.${signature.toString('base64url')}`
}

export function verifyEnvelope(
  token: string,
  key: JsonWebKey,
  binding: {
    purpose: string
    issuer: string
    audience: string
    environment: string
  },
  checkExpiry = true
): Record<string, unknown> {
  const parts = token.split('.')
  if (
    parts.length !== 2 ||
    token.length > 32768 ||
    !verify(
      'RSA-SHA256',
      Buffer.from(parts[0]),
      createPublicKey({ key, format: 'jwk' }),
      Buffer.from(parts[1], 'base64url')
    )
  )
    throw new Error('Invalid credential')
  const value = z
    .object({
      purpose: z.string(),
      issuer: z.string(),
      audience: z.string(),
      environment: z.string(),
      expiresAt: z.number().finite()
    })
    .passthrough()
    .parse(JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')))
  if (
    Object.entries(binding).some(
      ([key, expected]) => value[key] !== expected
    ) ||
    (checkExpiry && value.expiresAt <= Date.now())
  )
    throw new Error('Invalid credential')
  return value
}

export const credentialClaims = z.object({
  executorId: z.string().uuid(),
  subject: id,
  clientId: z.string().min(1).max(2048),
  connectionId: id,
  grantVersion: z.number().int().positive(),
  journeyIds: z.array(id).min(1).max(50),
  mode: z.enum(['view', 'edit']),
  requestId: z.string().uuid(),
  requestHash: z.string().length(64),
  expiresAt: z.number(),
  consentExpiresAt: z.number().finite(),
  consentHistoryGeneration: z.number().int().nonnegative(),
  scope: z.enum(['journeys:read', 'journeys:edit'])
})
export type ReadCredential = z.infer<typeof credentialClaims>
export interface ReadTrust {
  issuer: string
  audience: string
  environment: string
  publicKey: JsonWebKey
}
export const serviceUrl = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value)
    return (
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      (url.protocol === 'https:' ||
        (url.protocol === 'http:' &&
          ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))
    )
  })
export const readTrustSchema = z.object({
  issuer: serviceUrl,
  audience: serviceUrl,
  environment: z.enum(['local', 'stage', 'production']),
  publicKey: z
    .object({
      kty: z.literal('RSA'),
      n: z.string().min(1),
      e: z.string().min(1)
    })
    .passthrough()
    .refine(
      (value) =>
        !['d', 'p', 'q', 'dp', 'dq', 'qi'].some((field) => field in value),
      'Only public verification material is allowed'
    )
})
export function verifyReadCredential(
  token: string,
  trust: ReadTrust
): ReadCredential {
  return credentialClaims.parse(
    verifyEnvelope(token, trust.publicKey, {
      issuer: trust.issuer,
      audience: trust.audience,
      environment: trust.environment,
      purpose: 'gateway-read'
    })
  )
}

export function sameSecret(actual: string, expected: string): boolean {
  const left = Buffer.from(actual)
  const right = Buffer.from(expected)
  return (
    right.length >= 32 &&
    left.length === right.length &&
    timingSafeEqual(left, right)
  )
}
export function internalSignature(
  token: string,
  body: string,
  secret: string
): string {
  if (secret.length < 32) throw new Error('Internal signing key required')
  return createHmac('sha256', secret)
    .update(JSON.stringify([token, body]))
    .digest('hex')
}

export async function boundedJson(
  response: Response,
  limit = maxTransportResponseBytes
): Promise<unknown> {
  if (!response.body) throw new Error('Dependency unavailable')
  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > limit) throw new Error('LIMIT_EXCEEDED')
      chunks.push(value)
    }
  } finally {
    await reader.cancel().catch(() => undefined)
  }
  const result: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  if (!response.ok) {
    const failure = z
      .object({ error: z.enum(safeReadErrors) })
      .safeParse(result)
    throw new Error(
      failure.success ? failure.data.error : 'ACCESS_DENIED_OR_NOT_FOUND'
    )
  }
  return result
}

export async function postJson(
  url: string,
  body: unknown,
  authorization: string,
  timeoutMs = 5000
): Promise<unknown> {
  return boundedJson(
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authorization
      },
      redirect: 'error',
      signal: AbortSignal.timeout(timeoutMs),
      body: JSON.stringify(body)
    })
  )
}

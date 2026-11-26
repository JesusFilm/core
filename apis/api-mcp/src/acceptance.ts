import { createHash } from 'node:crypto'

import { z } from 'zod'

import { cardStarterCommand } from '@core/yoga/mcp/cardStarterContract'
import { editInput } from '@core/yoga/mcp/editContract'
import { readRequest } from '@core/yoga/mcp/readContract'
import { actionValue } from '@core/yoga/mcp/structureContract'

import { protocolVersions } from './protocol'
import { validateRelease } from './release'

// A3 is absent from the canonical specification. Do not invent or renumber it.
export const acceptanceCases = [
  'A0',
  'A1',
  'A2',
  'A4',
  'A5',
  'A6',
  'A7',
  'A8',
  'A9',
  'A10',
  'A11',
  'A12',
  'A13',
  'A14',
  'A15',
  'A16',
  'A17',
  'A18',
  'A19',
  'A20',
  'A21'
] as const
export const outcomes = [
  'accepted',
  'denied',
  'interrupted',
  'replayed'
] as const

function literals(value: unknown, property: string): string[] {
  if (!value || typeof value !== 'object') return []
  const object = value as Record<string, unknown>
  const properties = object.properties as
    | Record<string, { const?: unknown; enum?: unknown[] }>
    | undefined
  return [
    ...(typeof properties?.[property]?.const === 'string'
      ? [properties[property].const]
      : (properties?.[property]?.enum ?? []).filter(
          (item): item is string => typeof item === 'string'
        )),
    ...Object.values(object).flatMap((child) =>
      Array.isArray(child)
        ? child.flatMap((item) => literals(item, property))
        : literals(child, property)
    )
  ]
}

// Derive the inventory from executable schemas, including nested starter/action
// variants. A newly supported command automatically adds release requirements.
const editSchema = z.toJSONSchema(editInput, { io: 'input' })
const readSchema = z.toJSONSchema(readRequest, { io: 'input' })
export const registryRows = [
  ...new Set([
    ...readRequest.options.map((option) => `tool/${option.shape.tool.value}`),
    ...cardStarterCommand.shape.starter.options.map(
      (option) => `starter/${option.shape.kind.value}`
    ),
    ...actionValue.options.map((option) => `action/${option.shape.kind.value}`),
    ...literals(editSchema, 'type').map((name) => `edit/${name}`),
    ...literals(editSchema, 'kind').map((name) => `variant/${name}`),
    ...literals(readSchema, 'kind').map((name) => `input-kind/${name}`),
    ...literals(readSchema, 'view').map((name) => `read-view/${name}`),
    ...literals(readSchema, 'source').map((name) => `media-source/${name}`)
  ])
].sort()

export function evidenceDigest(value: unknown): string {
  const canonical = (item: unknown): unknown => {
    if (Array.isArray(item)) return item.map(canonical)
    if (item && typeof item === 'object')
      return Object.fromEntries(
        Object.entries(item)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, child]) => [key, canonical(child)])
      )
    return item
  }
  return createHash('sha256')
    .update(JSON.stringify(canonical(value)))
    .digest('hex')
}

export const registryDigest = evidenceDigest({
  registryRows,
  editSchema,
  reads: readSchema
})

const participant = z.enum([
  'stage-full-stack',
  'normal-browser',
  'claude-web',
  'chatgpt-web',
  'stage-operations'
])
type Participant = z.infer<typeof participant>
export type AcceptanceCheck = { id: string; participant: Participant }
export function releaseChecks(): AcceptanceCheck[] {
  return [
    ...acceptanceCases.map((id) => ({
      id: `case/${id}`,
      participant: 'stage-full-stack' as const
    })),
    ...registryRows.flatMap((row) =>
      outcomes.map((outcome) => ({
        id: `${row}/${outcome}`,
        participant: 'stage-full-stack' as const
      }))
    ),
    ...(['claude-web', 'chatgpt-web'] as const).flatMap((client) =>
      ['A0', 'A1', 'A4', 'A7', 'A8', 'A9', 'A10', 'A13', 'A14', 'A16'].map(
        (id) => ({
          id: `${client}/${id}`,
          participant: client
        })
      )
    ),
    ...['A1', 'A2', 'A8', 'A9', 'A16', 'A21'].map((id) => ({
      id: `browser/${id}`,
      participant: 'normal-browser' as const
    })),
    ...[
      'two-replicas',
      'alerts',
      'limits',
      'rotation',
      'write-disable',
      'effect-disable',
      'previous-digest-rollback',
      'withdrawal-races',
      'retention-cleanup',
      'assembled-retest'
    ].map((id) => ({
      id: `operations/${id}`,
      participant: 'stage-operations' as const
    }))
  ]
}

const sha = z.string().regex(/^[a-f0-9]{40}$/)
const hash = z.string().regex(/^[a-f0-9]{64}$/)
const label = z.string().trim().min(1).max(200)
export const testCounts = z
  .object({
    passed: z.number().int().positive(),
    failed: z.literal(0),
    skipped: z.literal(0),
    pending: z.literal(0)
  })
  .strict()
export const artifactReference = z
  .object({
    path: z.string().regex(/^[a-zA-Z0-9_/-]+\.(json|md|txt|xml)$/),
    sha256: hash
  })
  .strict()
const evidenceRecord = z
  .object({
    id: label,
    checkIds: z.array(label).min(1),
    participant,
    environment: z.literal('stage'),
    sourceCommit: sha,
    releaseDigest: hash,
    registryDigest: hash,
    startedAt: z.string().datetime(),
    finishedAt: z.string().datetime(),
    status: z.literal('passed'),
    counts: testCounts,
    operator: label,
    reviewer: label,
    controlledParticipants: z.array(label).length(0),
    artifacts: z.array(artifactReference).min(1),
    client: z
      .object({
        accountAlias: label,
        actualPlan: label,
        productVersion: label,
        platform: label,
        nodeVersion: label,
        sdkVersion: label,
        protocolVersion: z.enum(protocolVersions as [string, ...string[]]),
        registrationMode: z.enum(['dynamic', 'pre-registered']),
        connectionAlias: label,
        conversationAlias: label,
        toolsOnly: z.boolean()
      })
      .strict()
      .optional()
  })
  .strict()
export const evidenceLedger = z
  .object({
    schemaVersion: z.literal(1),
    sourceCommit: sha,
    releaseDigest: hash,
    registryDigest: hash,
    notBefore: z.string().datetime(),
    records: z.array(evidenceRecord)
  })
  .strict()
export type EvidenceLedger = z.infer<typeof evidenceLedger>

/** This validates evidence declarations, never approves or enables a release.
 * Reviewers must verify artifact contents and actual participant identities.
 */
export function validateAcceptance(
  value: unknown,
  manifest: unknown,
  now = new Date()
) {
  const release = validateRelease(manifest)
  const ledger = evidenceLedger.parse(value)
  const expectedDigest = evidenceDigest(release)
  if (
    ledger.sourceCommit !== release.sourceCommit ||
    ledger.releaseDigest !== expectedDigest ||
    ledger.registryDigest !== registryDigest ||
    !Number.isFinite(now.getTime()) ||
    Date.parse(ledger.notBefore) > now.getTime()
  )
    throw new Error('Candidate mismatch')
  const checks = releaseChecks()
  const covered = new Set<string>()
  const ids = new Set<string>()
  for (const record of ledger.records) {
    if (ids.has(record.id)) throw new Error('Duplicate evidence')
    ids.add(record.id)
    if (
      record.sourceCommit !== ledger.sourceCommit ||
      record.releaseDigest !== ledger.releaseDigest ||
      record.registryDigest !== registryDigest ||
      Date.parse(record.startedAt) < Date.parse(ledger.notBefore) ||
      Date.parse(record.finishedAt) < Date.parse(record.startedAt) ||
      Date.parse(record.finishedAt) > now.getTime()
    )
      throw new Error('Stale evidence')
    const client =
      record.participant === 'claude-web' ||
      record.participant === 'chatgpt-web'
    if (client && !record.client) throw new Error('Missing actual client facts')
    if (record.operator === record.reviewer)
      throw new Error('Independent review required')
    if (new Set(record.checkIds).size !== record.checkIds.length)
      throw new Error('Duplicate check')
    for (const id of record.checkIds) {
      const check = checks.find((item) => item.id === id)
      if (!check || check.participant !== record.participant)
        throw new Error('Wrong participant')
      covered.add(id)
    }
  }
  if (
    !ledger.records.some(
      (record) =>
        (record.participant === 'claude-web' ||
          record.participant === 'chatgpt-web') &&
        record.client?.toolsOnly
    )
  )
    throw new Error('Missing tool-only conversation')
  const missing = checks
    .filter((check) => !covered.has(check.id))
    .map((check) => check.id)
  if (missing.length) throw new Error(`Missing checks: ${missing.join(', ')}`)
  return {
    qualification: 'evidence-ready-for-review',
    sourceCommit: ledger.sourceCommit,
    releaseDigest: expectedDigest,
    checks: covered.size,
    productionApproved: false
  } as const
}

// Existing capability runners own their fixtures, protocol paths and coverage.
// They execute serially because some intentionally reuse their own report paths.
export const localSuites = [
  {
    id: 'reads',
    root: 'apis/api-auth',
    config: 'apis/api-auth/vitest.config.mts',
    modules: [
      'apis/api-auth/src/reads.ts',
      'apis/api-auth/src/store.ts',
      'apis/api-journeys/src/lib/mcpReads.ts'
    ]
  },
  {
    id: 'edits',
    root: '.',
    config: 'apis/api-auth/vitest.edits.config.mts',
    modules: [
      'apis/api-journeys/src/lib/mcpEdits.ts',
      'apis/api-journeys/src/lib/mcpEditsStore.ts',
      'libs/yoga/src/mcp/editContract.ts'
    ]
  },
  {
    id: 'structure',
    root: '.',
    config: 'apis/api-auth/vitest.structure.config.mts',
    modules: [
      'apis/api-journeys/src/lib/mcpStructure.ts',
      'apis/api-journeys/src/lib/mcpStructureHistory.ts'
    ]
  },
  {
    id: 'forms',
    root: '.',
    config: 'apis/api-auth/vitest.forms.config.mts',
    modules: [
      'apis/api-journeys/src/lib/mcpForms.ts',
      'apis/api-journeys/src/lib/mcpFormDestinations.ts'
    ]
  },
  {
    id: 'appearance',
    root: '.',
    config: 'apis/api-auth/vitest.appearance.config.mts',
    modules: [
      'apis/api-journeys/src/lib/mcpAppearance.ts',
      'libs/yoga/src/mcp/appearanceContract.ts'
    ]
  },
  {
    id: 'media',
    root: '.',
    config: 'apis/api-auth/vitest.media.config.mts',
    modules: [
      'apis/api-journeys/src/lib/mcpMedia.ts',
      'apis/api-media/src/lib/mcpMediaSources.ts',
      'libs/yoga/src/mcp/cardStarterContract.ts'
    ]
  },
  {
    id: 'image-upload',
    root: '.',
    config: 'apis/api-auth/vitest.image-upload.config.mts',
    modules: [
      'apis/api-auth/src/mediaJobs.ts',
      'apis/api-media/src/lib/mcpMediaJobs.ts'
    ]
  },
  {
    id: 'video-upload',
    root: '.',
    config: 'apis/api-auth/vitest.video-upload.config.mts',
    modules: [
      'apis/api-media/src/lib/mcpVideoInput.ts',
      'apis/api-media/src/lib/mcpVideoProvider.ts'
    ]
  },
  {
    id: 'image-generation',
    root: '.',
    config: 'apis/api-auth/vitest.image-generation.config.mts',
    modules: ['apis/api-media/src/lib/mcpImageGenerationProvider.ts']
  },
  {
    id: 'operations',
    root: '.',
    config: 'apis/api-auth/vitest.operations.config.mts',
    modules: ['apis/api-auth/src/operations.ts', 'apis/api-mcp/src/release.ts']
  },
  {
    id: 'protocol',
    root: 'apis/api-mcp',
    config: 'apis/api-mcp/vitest.config.mts',
    modules: ['apis/api-mcp/src/protocol.ts', 'apis/api-mcp/src/runtime.ts']
  },
  {
    id: 'admin-components',
    root: 'apps/journeys-admin',
    config: 'apps/journeys-admin/vitest.config.mts',
    filters: [
      'apps/journeys-admin/test/privatePreview',
      'apps/journeys-admin/test/pages/agents.spec.tsx',
      'apps/journeys-admin/src/components/ConnectedAgents/ConnectedAgents.spec.tsx',
      'apps/journeys-admin/src/components/McpImageUpload/McpImageUpload.spec.tsx'
    ],
    modules: []
  }
] as const

export function executedCounts(report: unknown) {
  const counts = z
    .object({
      numTotalTests: z.number().int().positive(),
      numPassedTests: z.number().int(),
      numFailedTests: z.number().int(),
      numPendingTests: z.number().int(),
      numTodoTests: z.number().int(),
      success: z.literal(true)
    })
    .parse(report)
  if (counts.numTotalTests !== counts.numPassedTests)
    throw new Error('Incomplete execution')
  return testCounts.parse({
    passed: counts.numPassedTests,
    failed: counts.numFailedTests,
    skipped: counts.numPendingTests,
    pending: counts.numTodoTests
  })
}

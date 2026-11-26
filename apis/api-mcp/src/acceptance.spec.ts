import { readFileSync } from 'node:fs'

import { readRequest } from '@core/yoga/mcp/readContract'

import {
  acceptanceCases,
  evidenceDigest,
  evidenceLedger,
  executedCounts,
  registryDigest,
  registryRows,
  releaseChecks,
  validateAcceptance
} from './acceptance'

const manifest = JSON.parse(
  readFileSync(
    new URL(
      '../../../tools/scripts/mcp-operations.stage.example.json',
      import.meta.url
    ),
    'utf8'
  )
)
const now = new Date('2026-11-26T12:00:00Z')
function completeLedger() {
  const groups = new Map<string, ReturnType<typeof releaseChecks>>()
  for (const check of releaseChecks())
    groups.set(check.participant, [
      ...(groups.get(check.participant) ?? []),
      check
    ])
  return evidenceLedger.parse({
    schemaVersion: 1,
    sourceCommit: manifest.sourceCommit,
    releaseDigest: evidenceDigest(manifest),
    registryDigest,
    notBefore: '2026-11-26T10:00:00Z',
    records: [...groups].map(([participant, checks]) => ({
      id: participant,
      checkIds: checks.map((check) => check.id),
      participant,
      environment: 'stage',
      sourceCommit: manifest.sourceCommit,
      releaseDigest: evidenceDigest(manifest),
      registryDigest,
      startedAt: '2026-11-26T10:30:00Z',
      finishedAt: '2026-11-26T11:00:00Z',
      status: 'passed',
      counts: { passed: 1, failed: 0, skipped: 0, pending: 0 },
      operator: 'synthetic-operator',
      reviewer: 'synthetic-reviewer',
      controlledParticipants: [],
      artifacts: [{ path: 'redacted/session.md', sha256: 'b'.repeat(64) }],
      ...(['claude-web', 'chatgpt-web'].includes(participant)
        ? {
            client: {
              accountAlias: 'synthetic-account',
              actualPlan: 'recorded-plan',
              productVersion: 'recorded-build',
              platform: 'web',
              nodeVersion: '24.21.0',
              sdkVersion: 'recorded-sdk',
              protocolVersion: '2026-07-28',
              registrationMode: 'pre-registered',
              connectionAlias: participant,
              conversationAlias: 'new-chat',
              toolsOnly: true
            }
          }
        : {})
    }))
  })
}

describe('release acceptance evidence', () => {
  it('derives every tool and nested command variant and keeps the canonical case numbering', () => {
    expect(acceptanceCases).toHaveLength(21)
    expect(acceptanceCases).not.toContain('A3')
    expect(
      registryRows.filter((row) => row.startsWith('starter/'))
    ).toHaveLength(6)
    expect(
      registryRows.filter((row) => row.startsWith('action/'))
    ).toHaveLength(7)
    for (const tool of readRequest.options)
      expect(registryRows).toContain(`tool/${tool.shape.tool.value}`)
    expect(registryRows).toEqual(
      expect.arrayContaining([
        'edit/card_starter_apply',
        'edit/typography_set',
        'variant/video',
        'variant/intro',
        'variant/poll',
        'variant/form',
        'variant/quote',
        'variant/cta',
        'variant/none',
        'variant/step',
        'variant/link',
        'variant/email',
        'variant/chat',
        'variant/phone',
        'variant/sms'
      ])
    )
    const checks = releaseChecks()
    expect(new Set(checks.map((check) => check.id)).size).toBe(checks.length)
  })

  it('accepts complete current declarations for review while never approving production', () => {
    expect(validateAcceptance(completeLedger(), manifest, now)).toMatchObject({
      qualification: 'evidence-ready-for-review',
      productionApproved: false
    })
    expect(evidenceDigest({ b: 1, a: { d: 2, c: null } })).toBe(
      evidenceDigest({ a: { c: null, d: 2 }, b: 1 })
    )
  })

  it.each([
    'missing',
    'stale-registry',
    'wrong-candidate',
    'wrong-deployment',
    'old',
    'future',
    'time-reversed',
    'wrong-participant',
    'missing-client',
    'no-tools-only',
    'duplicate',
    'duplicate-check',
    'self-review',
    'unknown-check'
  ])('rejects %s evidence', (failure) => {
    const ledger = completeLedger()
    const first = ledger.records[0]
    if (failure === 'missing') first.checkIds.pop()
    if (failure === 'stale-registry') ledger.registryDigest = 'a'.repeat(64)
    if (failure === 'wrong-candidate') ledger.sourceCommit = 'a'.repeat(40)
    if (failure === 'wrong-deployment') first.releaseDigest = 'a'.repeat(64)
    if (failure === 'old') first.startedAt = '2026-11-25T00:00:00Z'
    if (failure === 'future') first.finishedAt = '2026-11-27T00:00:00Z'
    if (failure === 'time-reversed') first.finishedAt = '2026-11-26T10:00:00Z'
    if (failure === 'wrong-participant') first.participant = 'normal-browser'
    if (failure === 'missing-client')
      delete ledger.records.find((record) => record.client)!.client
    if (failure === 'no-tools-only')
      for (const record of ledger.records)
        if (record.client) record.client.toolsOnly = false
    if (failure === 'duplicate') ledger.records.push(first)
    if (failure === 'duplicate-check') first.checkIds.push(first.checkIds[0])
    if (failure === 'self-review') first.reviewer = first.operator
    if (failure === 'unknown-check') first.checkIds.push('case/A3')
    expect(() => validateAcceptance(ledger, manifest, now)).toThrow()
  })

  it.each([
    'local',
    'skipped',
    'failed',
    'controlled',
    'bad-protocol',
    'missing-artifact'
  ])('rejects invalid %s declarations', (failure) => {
    const ledger = completeLedger()
    const raw: { records: Array<Record<string, unknown>> } =
      structuredClone(ledger)
    if (failure === 'local') raw.records[0].environment = 'local'
    if (failure === 'skipped')
      raw.records[0].counts = { ...ledger.records[0].counts, skipped: 1 }
    if (failure === 'failed') raw.records[0].status = 'failed'
    if (failure === 'controlled')
      raw.records[0].controlledParticipants = ['Firebase fixture']
    if (failure === 'bad-protocol')
      raw.records[1].client = {
        ...ledger.records[1].client,
        protocolVersion: 'unknown'
      }
    if (failure === 'missing-artifact') raw.records[0].artifacts = []
    expect(() => validateAcceptance(raw, manifest, now)).toThrow()
  })

  it('rejects empty runs, skips, missing counts and failures instead of accepting old reports', () => {
    const valid = {
      numTotalTests: 3,
      numPassedTests: 3,
      numFailedTests: 0,
      numPendingTests: 0,
      numTodoTests: 0,
      success: true
    }
    expect(executedCounts(valid).passed).toBe(3)
    for (const patch of [
      { numTotalTests: 0 },
      { numPassedTests: 2 },
      { numFailedTests: 1 },
      { numPendingTests: 1 },
      { numTodoTests: 1 },
      { success: false }
    ])
      expect(() => executedCounts({ ...valid, ...patch })).toThrow()
    expect(() => executedCounts({})).toThrow()
  })
})

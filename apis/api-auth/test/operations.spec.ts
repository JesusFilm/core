import { request as httpRequest } from 'node:http'
import type { AddressInfo } from 'node:net'

import pino from 'pino'

import { createRuntime } from '../src/runtime'
import { audit, cleanup } from '../src/store'

import { structureFixture } from './grantedStructureFixture'

const secret = 'controlled-operations-10564-at-least-32-characters'

describe('durable operational stops through authenticated HTTP participants', () => {
  if (!process.env.UPLOAD_TEST_AUTH_DATABASE_URL)
    throw new Error('Run node tools/scripts/test-mcp-operations.mjs')
  const f = structureFixture({
    issue: process.env.UPLOAD_TEST_ISSUE,
    authUrl: process.env.UPLOAD_TEST_AUTH_DATABASE_URL,
    journeysUrl: process.env.UPLOAD_TEST_JOURNEYS_DATABASE_URL,
    authEnv: { AUTH_OPERATIONS_SECRET: secret }
  })
  type Status = {
    controls: Array<{ control: string; enabled: boolean; generation: number }>
    accepted: Array<{
      executor: string
      stage: string
      _count: { _all: number }
    }>
    pendingChanges: number
  }
  const request = (
    body: unknown,
    credential = secret,
    origin?: string,
    url = f.ownerConfig.authorityUrl
  ) =>
    new Promise<Response>((resolve, reject) => {
      const req = httpRequest(
        new URL('/internal/operations', url),
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${credential}`,
            'Content-Type': 'application/json',
            Host: new URL(f.authConfig.AUTH_ISSUER).host,
            ...(origin ? { Origin: origin } : {})
          }
        },
        (res) => {
          const chunks: Buffer[] = []
          res.on('data', (chunk: Buffer) => chunks.push(chunk))
          res.on('end', () =>
            resolve(
              new Response(Buffer.concat(chunks), { status: res.statusCode })
            )
          )
          res.on('error', reject)
        }
      )
      req.on('error', reject)
      req.end(JSON.stringify(body))
    })
  async function status(url?: string) {
    const response = await request({ action: 'status' }, secret, undefined, url)
    expect(response.status, await response.clone().text()).toBe(200)
    return (await response.json()) as Status
  }
  async function set(control: 'admission' | 'effects', enabled: boolean) {
    const state = (await status()).controls.find(
      (entry) => entry.control === control
    )!
    const response = await request({
      action: 'set',
      control,
      enabled,
      expectedGeneration: state.generation
    })
    expect(response.status).toBe(200)
    return (await response.json()) as Status
  }
  const command = () => [
    {
      type: 'typography_set',
      blockId: f.id('heading'),
      content: 'Operational synthetic edit'
    }
  ]

  it('denies browser, participant and malformed control calls without exposing secrets or accepting stale changes', async () => {
    for (const credential of [
      'alice',
      f.authConfig.AUTH_READ_OWNER_SECRET!,
      f.authConfig.AUTH_EXCHANGE_CLIENT_SECRET!
    ])
      expect((await request({ action: 'status' }, credential)).status).toBe(403)
    expect(
      (
        await request(
          { action: 'status' },
          secret,
          f.authConfig.AUTH_ADMIN_ORIGIN
        )
      ).status
    ).toBe(403)
    expect(
      (
        await request({
          action: 'set',
          control: 'effects',
          enabled: true,
          expectedGeneration: -1
        })
      ).status
    ).toBe(403)
    expect(
      (await request({ action: 'status', token: 'raw-token-sentinel' })).status
    ).toBe(403)
    const old = (await status()).controls.find(
      (entry) => entry.control === 'admission'
    )!
    await set('admission', false)
    expect(
      (
        await request({
          action: 'set',
          control: 'admission',
          enabled: true,
          expectedGeneration: old.generation
        })
      ).status
    ).toBe(409)
    expect(JSON.stringify(await status())).not.toContain(secret)
  })

  it('stops new reads, saves and private output while an independent effects stop preserves reads and ordinary edits', async () => {
    await set('effects', false)
    const saved = f.receipt(await f.edit(await f.input(command())))
    expect(saved.journeyId).toBe(f.journeyId)
    const before = await f.snapshot()
    await set('admission', false)
    expect(
      (
        await f.call('journey_read', {
          journeyId: f.journeyId,
          view: 'outline'
        })
      ).json.result?.isError
    ).toBe(true)
    expect((await f.edit(await f.input(command()))).json.result?.isError).toBe(
      true
    )
    expect(await f.snapshot()).toEqual(before)
    await set('admission', true)
    expect(
      (
        await f.call('journey_read', {
          journeyId: f.journeyId,
          view: 'outline'
        })
      ).json.result?.isError
    ).not.toBe(true)
  })

  it('rejects a prepared save across close and reopen instead of validating its old generation', async () => {
    let stopped = false
    f.checkpoint = async (point) => {
      if (point !== 'before_accept' || stopped) return
      stopped = true
      await set('admission', false)
      await set('admission', true)
    }
    const before = await f.snapshot()
    expect((await f.edit(await f.input(command()))).json.result?.isError).toBe(
      true
    )
    expect(stopped).toBe(true)
    expect(await f.snapshot()).toEqual(before)
  })

  it('retains accepted bounded work during a stop and recovers its committed receipt without a second write', async () => {
    let stopped = false
    f.checkpoint = async (point) => {
      if (point !== 'after_accept' || stopped) return
      stopped = true
      const state = await set('admission', false)
      expect(
        state.accepted.some(
          (entry) => entry.executor === 'journeys' && entry.stage === 'read'
        )
      ).toBe(true)
    }
    const input = await f.input(command())
    const result = await f.edit(input)
    expect(result.status, result.text).toBe(500)
    expect(result.text).not.toContain('Operational synthetic edit')
    const adminResult = await f.adminRead(
      'blocks { id ... on TypographyBlock { content } }'
    )
    expect(adminResult.errors).toBeUndefined()
    expect(JSON.stringify(adminResult.data)).toContain(
      'Operational synthetic edit'
    )
    const counts = await f.counts()
    await set('admission', true)
    const recovered = f.receipt(await f.edit(input))
    expect(recovered.journeyId).toBe(f.journeyId)
    expect(await f.counts()).toEqual(counts)
  })

  it('rejects pre-upgrade permits missing operational generations at final acceptance', async () => {
    f.checkpoint = async (point, context) => {
      if (point !== 'before_accept') return
      const permit = await f.auth.readPermit.findUniqueOrThrow({
        where: { id: context.permitId }
      })
      const gates = permit.gates as Array<{ id: string; generation: number }>
      await f.auth.readPermit.update({
        where: { id: permit.id },
        data: {
          gates: gates.filter((gate) => !gate.id.startsWith('operations:'))
        }
      })
    }
    const before = await f.snapshot()
    expect((await f.edit(await f.input(command()))).json.result?.isError).toBe(
      true
    )
    expect(await f.snapshot()).toEqual(before)
  })

  it('keeps stop state across issuer replicas and replacement and expires restored audit before serving', async () => {
    await set('effects', false)
    await audit(f.auth, 'operations_change', 'allowed', {
      userId: 'synthetic-operator'
    })
    const retained = await f.auth.securityAudit.findFirstOrThrow({
      where: { userId: 'synthetic-operator' },
      orderBy: { occurredAt: 'desc' }
    })
    expect(retained.expiresAt.getTime() - retained.occurredAt.getTime()).toBe(
      7776000000
    )
    const expired = await f.auth.securityAudit.create({
      data: {
        action: 'read_accept',
        outcome: 'denied',
        occurredAt: new Date('2020-01-01'),
        expiresAt: new Date('2020-03-31')
      }
    })
    const logs: string[] = []
    for (let replacement = 0; replacement < 2; replacement++) {
      const replica = await createRuntime(f.authConfig, {
        db: f.auth,
        identity: {
          authenticate: async () => {
            throw new Error('unused')
          },
          check: async () => undefined
        },
        eligibility: async () => [],
        logger: pino({ base: undefined }, { write: (line) => logs.push(line) })
      })
      try {
        await new Promise<void>((resolve) =>
          replica.server.listen(0, '127.0.0.1', resolve)
        )
        const url = `http://127.0.0.1:${(replica.server.address() as AddressInfo).port}`
        expect((await status(url)).controls).toContainEqual(
          expect.objectContaining({ control: 'effects', enabled: false })
        )
      } finally {
        await replica.close()
      }
    }
    expect(
      await f.auth.securityAudit.findUnique({ where: { id: expired.id } })
    ).toBeNull()
    await cleanup(f.auth)
    expect(
      await f.auth.securityAudit.findUnique({ where: { id: retained.id } })
    ).toEqual(retained)
    for (const sentinel of [secret, 'synthetic-operator', 'raw-token-sentinel'])
      expect(logs.join('')).not.toContain(sentinel)
  })
})

import { generateKeyPairSync, randomUUID } from 'node:crypto'

import {
  assertRequestInputSize,
  maxToolInputBytes,
  maxTransportBytes,
  readRequest,
  signEnvelope,
  verifyEnvelope,
  verifyReadCredential
} from './readContract'

describe('restricted journey read credentials', () => {
  const keys = generateKeyPairSync('rsa', { modulusLength: 2048 })
  const privateKey = keys.privateKey.export({ format: 'jwk' })
  const publicKey = keys.publicKey.export({ format: 'jwk' })

  it('binds a signed credential to its purpose, audience and environment', () => {
    const token = signEnvelope(
      {
        purpose: 'gateway-read',
        issuer: 'issuer',
        audience: 'gateway',
        environment: 'local',
        expiresAt: Date.now() + 60000,
        subject: 'alice'
      },
      privateKey
    )
    const binding = {
      purpose: 'gateway-read',
      issuer: 'issuer',
      audience: 'gateway',
      environment: 'local'
    }
    expect(verifyEnvelope(token, publicKey, binding)).toMatchObject({
      subject: 'alice'
    })
    for (const mismatch of [
      { purpose: 'permit' },
      { issuer: 'other' },
      { audience: 'owner' },
      { environment: 'stage' }
    ]) {
      expect(() =>
        verifyEnvelope(token, publicKey, { ...binding, ...mismatch })
      ).toThrow()
    }
    expect(() =>
      verifyEnvelope(token.slice(0, -8) + 'forged', publicKey, binding)
    ).toThrow()
  })

  it('binds edit authority to a verified OAuth client and finite scope', () => {
    const claims = {
      purpose: 'gateway-read',
      issuer: 'issuer',
      audience: 'gateway',
      environment: 'local',
      expiresAt: Date.now() + 60000,
      consentExpiresAt: Date.now() + 86400000,
      consentHistoryGeneration: 0,
      executorId: randomUUID(),
      subject: 'alice',
      clientId: 'verified-client',
      connectionId: 'connection',
      grantVersion: 1,
      journeyIds: ['journey'],
      mode: 'edit',
      scope: 'journeys:edit',
      requestId: randomUUID(),
      requestHash: 'a'.repeat(64)
    }
    const trust = {
      issuer: 'issuer',
      audience: 'gateway',
      environment: 'local',
      publicKey
    }
    expect(
      verifyReadCredential(signEnvelope(claims, privateKey), trust)
    ).toMatchObject({ clientId: 'verified-client', scope: 'journeys:edit' })
    expect(() =>
      verifyReadCredential(
        signEnvelope({ ...claims, clientId: undefined }, privateKey),
        trust
      )
    ).toThrow()
    expect(() =>
      verifyReadCredential(
        signEnvelope({ ...claims, scope: 'journeys:admin' }, privateKey),
        trust
      )
    ).toThrow()
  })

  it('bounds decoded tool input while allowing signed transport metadata', () => {
    const request = {
      tool: 'journey_edit' as const,
      input: {
        journeyId: 'journey',
        expectedRevision: '4',
        idempotencyKey: '53e8ac4b-facd-4597-a300-a100b787ba09',
        commands: [
          { type: 'typography_set' as const, blockId: 'heading', content: '' }
        ]
      }
    }
    const remaining =
      maxToolInputBytes - Buffer.byteLength(JSON.stringify(request.input))
    request.input.commands[0].content = 'x'.repeat(remaining)
    expect(() => assertRequestInputSize(request)).not.toThrow()
    const envelope = {
      request,
      stage: 'output',
      dataHash: 'a'.repeat(64),
      outputHash: 'b'.repeat(64)
    }
    expect(Buffer.byteLength(JSON.stringify(envelope))).toBeGreaterThan(
      maxToolInputBytes
    )
    expect(Buffer.byteLength(JSON.stringify(envelope))).toBeLessThan(
      maxTransportBytes
    )
    request.input.commands[0].content += 'é'
    expect(() => assertRequestInputSize(request)).toThrow('LIMIT_EXCEEDED')
  })

  it('rejects expired credentials, arbitrary identity and raw query inputs', () => {
    const binding = {
      purpose: 'gateway-read',
      issuer: 'issuer',
      audience: 'gateway',
      environment: 'local'
    }
    const token = signEnvelope(
      { ...binding, expiresAt: Date.now() - 1 },
      privateKey
    )
    expect(() => verifyEnvelope(token, publicKey, binding)).toThrow()
    expect(
      readRequest.safeParse({ tool: 'journeys_list', input: { userId: 'bob' } })
        .success
    ).toBe(false)
    expect(
      readRequest.safeParse({
        tool: 'journey_read',
        input: { journeyId: 'a', view: 'outline', query: '{ journey }' }
      }).success
    ).toBe(false)
  })
})

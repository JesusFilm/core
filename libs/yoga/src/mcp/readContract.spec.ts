import { generateKeyPairSync } from 'node:crypto'

import { readRequest, signEnvelope, verifyEnvelope } from './readContract'

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

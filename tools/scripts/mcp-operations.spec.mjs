import { operate } from './mcp-operations.mjs'

const env = {
  AUTH_ISSUER: 'http://127.0.0.1:4011',
  AUTH_OPERATIONS_SECRET: 'controlled-operations-at-least-32-characters'
}
const status = {
  controls: [
    { control: 'admission', enabled: true, generation: 3 },
    { control: 'effects', enabled: false, generation: 5 }
  ],
  accepted: [
    { executor: 'media', stage: 'media_dispatch', _count: { _all: 1 } }
  ],
  pendingChanges: 1
}

describe('operator command arguments and redacted output', () => {
  it('sends operator-authenticated status and generation-checked changes without redirects', async () => {
    for (const args of [['status'], ['set', 'effects', 'false', '5']]) {
      const output = []
      expect(
        await operate(
          args,
          env,
          async (url, request) => {
            expect(url.href).toBe('http://127.0.0.1:4011/internal/operations')
            expect(request.redirect).toBe('error')
            expect(request.headers.Authorization).toBe(
              `Bearer ${env.AUTH_OPERATIONS_SECRET}`
            )
            expect(JSON.parse(request.body)).toEqual(
              args[0] === 'status'
                ? { action: 'status' }
                : {
                    action: 'set',
                    control: 'effects',
                    enabled: false,
                    expectedGeneration: 5
                  }
            )
            return Response.json(status)
          },
          (line) => output.push(line)
        )
      ).toBe(0)
      expect(JSON.parse(output[0])).toEqual(status)
      expect(output[0]).not.toContain(env.AUTH_OPERATIONS_SECRET)
    }
  })

  it('fails unsafe URLs, credentials and malformed commands before sending', async () => {
    for (const [args, settings] of [
      [[], env],
      [['set', 'all', 'false', '0'], env],
      [['set', 'effects', 'yes', '0'], env],
      [['set', 'effects', 'true', '-1'], env],
      [['set', 'effects', 'true', '2147483647'], env],
      [['status'], { ...env, AUTH_ISSUER: 'http://remote.invalid' }],
      [
        ['status'],
        { ...env, AUTH_ISSUER: 'https://user:secret@remote.invalid' }
      ],
      [['status'], { ...env, AUTH_OPERATIONS_SECRET: '' }]
    ]) {
      const send = vi.fn()
      expect(await operate(args, settings, send, () => undefined)).toBe(1)
      expect(send).not.toHaveBeenCalled()
    }
  })

  it('redacts dependency errors, denied/stale changes and unexpected server fields', async () => {
    for (const send of [
      async () => {
        throw new Error('raw-provider-error-token-sentinel')
      },
      async () =>
        new Response('raw-provider-error-token-sentinel', { status: 409 }),
      async () =>
        Response.json({ ...status, prompt: 'private-prompt-sentinel' })
    ]) {
      const output = []
      expect(
        await operate(['status'], env, send, (line) => output.push(line))
      ).toBe(1)
      expect(output).toEqual([
        'Operational control failed. Refresh status and verify the operator configuration; no settlement or cancellation is implied.'
      ])
    }
  })
})

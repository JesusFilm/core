import { spawn } from 'node:child_process'
import { once } from 'node:events'

import { mediaExecutorIdentity, mediaExecutorStopped } from './mcpMediaExecutor'

const taskArn =
  'arn:aws:ecs:us-east-2:111122223333:task/core/0123456789abcdef0123456789abcdef'
const clusterArn = 'arn:aws:ecs:us-east-2:111122223333:cluster/core'
const { send, destroy } = vi.hoisted(() => ({
  send: vi.fn(),
  destroy: vi.fn()
}))
vi.mock('@aws-sdk/client-ecs', async (original) => ({
  ...(await original<typeof import('@aws-sdk/client-ecs')>()),
  ECSClient: vi.fn(function () {
    return { send, destroy }
  })
}))

describe('media output executor recovery', () => {
  beforeEach(() => {
    send.mockReset()
    destroy.mockReset()
    vi.stubEnv('ECS_CONTAINER_METADATA_URI_V4', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  describe('positive process stop evidence', () => {
    it('keeps live, foreign, malformed and unreadable executors unresolved', async () => {
      const identity = await mediaExecutorIdentity()
      expect(await mediaExecutorStopped(identity)).toBe(false)
      expect(
        await mediaExecutorStopped({
          ...identity,
          boot: '00000000-0000-4000-8000-000000000000'
        })
      ).toBe(false)
      expect(
        await mediaExecutorStopped({ ...identity, namespace: 'pid:[0]' })
      ).toBe(false)
      expect(await mediaExecutorStopped(null)).toBe(false)
      expect(await mediaExecutorStopped({ ...identity, pid: 0 })).toBe(false)
    })

    it('keeps a process unresolved when the kernel denies the liveness probe', async () => {
      const identity = await mediaExecutorIdentity()
      const probe = vi.spyOn(process, 'kill').mockImplementation(() => {
        throw Object.assign(new Error('Controlled permission denial'), {
          code: 'EPERM'
        })
      })
      try {
        expect(await mediaExecutorStopped(identity)).toBe(false)
      } finally {
        probe.mockRestore()
      }
    })

    it('proves an exited executor stopped and detects PID reuse', async () => {
      const child = spawn(
        process.execPath,
        ['-e', 'setInterval(() => {}, 1000)'],
        { stdio: 'ignore' }
      )
      await once(child, 'spawn')
      try {
        const identity = await mediaExecutorIdentity(child.pid)
        expect(await mediaExecutorStopped(identity)).toBe(false)
        expect(
          await mediaExecutorStopped({
            ...identity,
            started: '0'
          })
        ).toBe(true)
        const exit = once(child, 'exit')
        child.kill('SIGKILL')
        await exit
        expect(await mediaExecutorStopped(identity)).toBe(true)
      } finally {
        if (child.exitCode === null) child.kill('SIGKILL')
      }
    })
  })

  describe('ECS executor stop evidence across task replacement', () => {
    const remote = async () => ({
      ...(await mediaExecutorIdentity()),
      namespace: 'pid:[0]',
      task: { taskArn, clusterArn }
    })
    const description = (lastStatus = 'STOPPED') => ({
      tasks: [{ taskArn, clusterArn, lastStatus }],
      failures: []
    })

    it.each(['core', clusterArn])(
      'captures the server-controlled task identity with cluster %s',
      async (Cluster) => {
        vi.stubEnv(
          'ECS_CONTAINER_METADATA_URI_V4',
          'http://169.254.170.2/v4/controlled'
        )
        const request = vi
          .fn()
          .mockResolvedValue(Response.json({ TaskARN: taskArn, Cluster }))
        vi.stubGlobal('fetch', request)
        expect(await mediaExecutorIdentity()).toMatchObject({
          task: { taskArn, clusterArn }
        })
        expect(request).toHaveBeenCalledWith(
          new URL('http://169.254.170.2/v4/controlled/task'),
          expect.objectContaining({
            redirect: 'error',
            signal: expect.any(AbortSignal)
          })
        )
      }
    )

    it.each([
      'http://foreign.test/v4/id',
      'https://169.254.170.2/v4/id',
      'http://169.254.170.2/v4/id?token=foreign',
      'http://user@169.254.170.2/v4/id'
    ])('rejects an untrusted metadata endpoint %s', async (uri) => {
      vi.stubEnv('ECS_CONTAINER_METADATA_URI_V4', uri)
      const request = vi.fn()
      vi.stubGlobal('fetch', request)
      await expect(mediaExecutorIdentity()).rejects.toThrow(
        'Invalid ECS metadata endpoint'
      )
      expect(request).not.toHaveBeenCalled()
    })

    it('fails output admission when task identity cannot be established', async () => {
      vi.stubEnv(
        'ECS_CONTAINER_METADATA_URI_V4',
        'http://169.254.170.2/v4/controlled'
      )
      const request = vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 503 }))
        .mockResolvedValueOnce(
          Response.json({ TaskARN: 'wrong', Cluster: 'core' })
        )
        .mockRejectedValueOnce(new Error('metadata unavailable'))
      vi.stubGlobal('fetch', request)
      await expect(mediaExecutorIdentity()).rejects.toThrow(
        'ECS metadata unavailable'
      )
      await expect(mediaExecutorIdentity()).rejects.toThrow()
      await expect(mediaExecutorIdentity()).rejects.toThrow(
        'metadata unavailable'
      )
    })

    it.each(['STOPPED', 'STOPPING', 'RUNNING', 'DEPROVISIONING'])(
      'settles only confirmed STOPPED, observed %s',
      async (status) => {
        const identity = await remote()
        send.mockResolvedValueOnce(description(status))
        expect(await mediaExecutorStopped(identity)).toBe(status === 'STOPPED')
        expect(send.mock.calls[0][0].input).toEqual({
          cluster: clusterArn,
          tasks: [taskArn]
        })
        expect(destroy).toHaveBeenCalledOnce()
      }
    )

    it.each([
      {},
      { tasks: [] },
      {
        tasks: [
          {
            taskArn,
            clusterArn,
            desiredStatus: 'STOPPED',
            lastStatus: 'RUNNING'
          }
        ]
      },
      {
        tasks: [
          {
            taskArn: taskArn.replace('0123', 'abcd'),
            clusterArn,
            lastStatus: 'STOPPED'
          }
        ]
      },
      {
        tasks: [
          {
            taskArn,
            clusterArn: clusterArn + '-foreign',
            lastStatus: 'STOPPED'
          }
        ]
      },
      { ...description(), failures: [{ arn: taskArn, reason: 'MISSING' }] }
    ])(
      'keeps absent, contradictory or mismatched task evidence pending, case %#',
      async (response) => {
        const identity = await remote()
        send.mockResolvedValueOnce(response)
        expect(await mediaExecutorStopped(identity)).toBe(false)
      }
    )

    it('keeps authorization errors and unavailable task lookups pending', async () => {
      const identity = await remote()
      send.mockRejectedValueOnce(new Error('AccessDenied'))
      expect(await mediaExecutorStopped(identity)).toBe(false)
      expect(destroy).toHaveBeenCalledOnce()
    })
  })
})

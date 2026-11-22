import { spawn } from 'node:child_process'
import { once } from 'node:events'

import { mediaExecutorIdentity, mediaExecutorStopped } from './mcpMediaExecutor'

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

import { readFile, readlink } from 'node:fs/promises'

import { z } from 'zod'

const executor = z.object({
  boot: z.string().uuid(),
  namespace: z.string().regex(/^pid:\[\d+\]$/),
  pid: z.number().int().positive(),
  started: z.string().regex(/^\d+$/)
})

async function namespace() {
  return {
    boot: (await readFile('/proc/sys/kernel/random/boot_id', 'utf8')).trim(),
    namespace: await readlink('/proc/self/ns/pid')
  }
}

async function processState(pid: number) {
  const stat = await readFile(`/proc/${pid}/stat`, 'utf8')
  // The command name can contain spaces and closing parentheses.
  const fields = stat.slice(stat.lastIndexOf(')') + 2).split(' ')
  return { state: fields[0], started: fields[19] }
}

export async function mediaExecutorIdentity(pid = process.pid) {
  return executor.parse({
    ...(await namespace()),
    pid,
    started: (await processState(pid)).started
  })
}

/** A remote host, a different PID namespace, or an unreadable procfs supplies
 * no stop evidence. Never substitute elapsed time for a stopped executor.
 */
export async function mediaExecutorStopped(value: unknown) {
  const parsed = executor.safeParse(value)
  if (!parsed.success) return false
  try {
    const current = await namespace()
    if (
      current.boot !== parsed.data.boot ||
      current.namespace !== parsed.data.namespace
    )
      return false
    try {
      process.kill(parsed.data.pid, 0)
    } catch (error) {
      return (error as NodeJS.ErrnoException).code === 'ESRCH'
    }
    const original = await processState(parsed.data.pid)
    return (
      original.started !== parsed.data.started ||
      ['Z', 'X'].includes(original.state)
    )
  } catch {
    return false
  }
}

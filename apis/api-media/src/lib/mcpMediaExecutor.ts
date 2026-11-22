import { readFile, readlink } from 'node:fs/promises'

import { DescribeTasksCommand, ECSClient } from '@aws-sdk/client-ecs'
import { z } from 'zod'

import { boundedJson } from '@core/yoga/mcp/readContract'

const task = z.object({
  taskArn: z
    .string()
    .regex(
      /^arn:aws:ecs:[a-z0-9-]+:[0-9]{12}:task\/(?:[a-zA-Z0-9_-]+\/)?[a-f0-9]{32}$/
    ),
  clusterArn: z
    .string()
    .regex(/^arn:aws:ecs:[a-z0-9-]+:[0-9]{12}:cluster\/[a-zA-Z0-9_-]+$/)
})
const executor = z.object({
  boot: z.string().uuid(),
  namespace: z.string().regex(/^pid:\[\d+\]$/),
  pid: z.number().int().positive(),
  started: z.string().regex(/^\d+$/),
  task: task.optional()
})

async function currentTask() {
  const uri = process.env.ECS_CONTAINER_METADATA_URI_V4
  if (!uri) return undefined
  const url = new URL(uri.replace(/\/$/, '') + '/task')
  if (
    url.origin !== 'http://169.254.170.2' ||
    !url.pathname.startsWith('/v4/') ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error('Invalid ECS metadata endpoint')
  const response = await fetch(url, {
    redirect: 'error',
    signal: AbortSignal.timeout(2000)
  })
  if (!response.ok) throw new Error('ECS metadata unavailable')
  const metadata = z
    .object({ TaskARN: task.shape.taskArn, Cluster: z.string().min(1) })
    .parse(await boundedJson(response, 65536))
  const prefix = metadata.TaskARN.split(':').slice(0, 5).join(':')
  return task.parse({
    taskArn: metadata.TaskARN,
    clusterArn: metadata.Cluster.startsWith('arn:')
      ? metadata.Cluster
      : `${prefix}:cluster/${metadata.Cluster}`
  })
}

async function taskStopped(identity: z.infer<typeof task>) {
  const client = new ECSClient({
    region: identity.taskArn.split(':')[3],
    maxAttempts: 1
  })
  try {
    const response = await client.send(
      new DescribeTasksCommand({
        cluster: identity.clusterArn,
        tasks: [identity.taskArn]
      }),
      { abortSignal: AbortSignal.timeout(5000) }
    )
    return (
      !response.failures?.length &&
      response.tasks?.length === 1 &&
      response.tasks[0].taskArn === identity.taskArn &&
      response.tasks[0].clusterArn === identity.clusterArn &&
      response.tasks[0].lastStatus === 'STOPPED'
    )
  } finally {
    client.destroy()
  }
}

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
  const taskIdentity = await currentTask()
  return executor.parse({
    ...(await namespace()),
    pid,
    started: (await processState(pid)).started,
    ...(taskIdentity ? { task: taskIdentity } : {})
  })
}

/** A remote host, a different PID namespace, or an unreadable procfs supplies
 * no stop evidence. Never substitute elapsed time for a stopped executor.
 */
async function localExecutorStopped(identity: z.infer<typeof executor>) {
  try {
    const current = await namespace()
    if (
      current.boot !== identity.boot ||
      current.namespace !== identity.namespace
    )
      return false
    try {
      process.kill(identity.pid, 0)
    } catch (error) {
      return (error as NodeJS.ErrnoException).code === 'ESRCH'
    }
    const original = await processState(identity.pid)
    return (
      original.started !== identity.started ||
      ['Z', 'X'].includes(original.state)
    )
  } catch {
    return false
  }
}

export async function mediaExecutorStopped(value: unknown) {
  const parsed = executor.safeParse(value)
  if (!parsed.success) return false
  if (await localExecutorStopped(parsed.data)) return true
  if (!parsed.data.task) return false
  return taskStopped(parsed.data.task).catch(() => false)
}

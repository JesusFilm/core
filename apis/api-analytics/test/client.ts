import { createHash } from 'node:crypto'

import { buildHTTPExecutor } from '@graphql-tools/executor-http'

import { api_keys as PrismaApiKey } from '@core/prisma/analytics/client'

import { yoga } from '../src/yoga'

import { prismaMock } from './prismaMock'

export function getClient(
  options?: Omit<Parameters<typeof buildHTTPExecutor>[0], 'fetch'>
): ReturnType<typeof buildHTTPExecutor> {
  return buildHTTPExecutor({
    ...options,
    fetch: yoga.fetch.bind({})
  })
}

export function getAuthenticatedClient(
  options?: Omit<Parameters<typeof buildHTTPExecutor>[0], 'fetch'>
): ReturnType<typeof buildHTTPExecutor> {
  const apiKey =
    'd53cae10f378d14b6ececb9a9d787c3d5d126b5ee95b52ecf4772f9bf43e43d4'
  const client = getClient({
    headers: {
      authorization: `Bearer ${apiKey}`
    },
    ...options
  })

  beforeEach(() => {
    const prismaUser = {
      id: 1,
      email: 'admin@example.com'
    }
    const keyHash = createHash('sha256')
      .update(`${process.env.PLAUSIBLE_SECRET_KEY_BASE}${apiKey}`)
      .digest('hex')
      .toLowerCase()
    prismaMock.api_keys.findFirst.mockResolvedValue({
      key_hash: keyHash,
      users: prismaUser
    } as unknown as PrismaApiKey)
  })

  return client
}

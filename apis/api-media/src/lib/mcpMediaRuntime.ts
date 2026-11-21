import { prisma as journeys } from '@core/prisma/journeys/client'
import { prisma as languages } from '@core/prisma/languages/client'
import {
  configureMediaWriteGuard,
  mediaRootClient,
  prisma
} from '@core/prisma/media/client'
import { getLaunchDarklyClient } from '@core/shared/ui/getLaunchDarklyClient'
import { auth } from '@core/yoga/firebaseClient'
import { readTrustSchema, serviceUrl } from '@core/yoga/mcp/readContract'
import { z } from 'zod'

import { createMediaMutationGuard } from './mcpMediaMutations'
import { mediaProviders } from './mcpMediaProviders'
import {
  type MediaSourcesConfig,
  createMediaSourceHandler,
  useMcpMediaSources
} from './mcpMediaSources'

export function mediaRuntime(
  env: NodeJS.ProcessEnv,
  dependencies: {
    media?: Parameters<typeof createMediaSourceHandler>[1]
    journeys?: Parameters<typeof createMediaSourceHandler>[2]
    languages?: Parameters<typeof createMediaSourceHandler>[3]
    providers?: Parameters<typeof createMediaSourceHandler>[4]
    flags?: MediaSourcesConfig['flags']
  } = {}
) {
  if (!env.MCP_MEDIA_ENABLED || env.MCP_MEDIA_ENABLED === 'false')
    return { plugins: [useMcpMediaSources()], mutations: undefined }
  if (env.MCP_MEDIA_ENABLED !== 'true')
    throw new Error('Invalid media configuration')
  const config = readTrustSchema
    .extend({
      internalSecret: z.string().min(32),
      authoritySecret: z.string().min(32),
      authorityUrl: serviceUrl,
      mutationSecret: z.string().min(32),
      imageAccount: z.string().regex(/^[a-zA-Z0-9_-]+$/)
    })
    .parse({
      issuer: env.MCP_READ_ISSUER,
      audience: env.MCP_READ_GATEWAY_AUDIENCE,
      environment: env.MCP_READ_ENVIRONMENT,
      publicKey: JSON.parse(env.MCP_READ_PUBLIC_KEY ?? 'null'),
      internalSecret: env.MEDIA_MCP_INTERNAL_SECRET,
      authoritySecret: env.MEDIA_MCP_AUTHORITY_SECRET,
      authorityUrl: env.MCP_READ_AUTHORITY_URL,
      mutationSecret: env.MCP_PERMISSION_MEDIA_SECRET,
      imageAccount: env.CLOUDFLARE_IMAGE_ACCOUNT
    })
  const mutations = createMediaMutationGuard(
    {
      authorityUrl: config.authorityUrl,
      authoritySecret: config.mutationSecret
    },
    dependencies.media ?? mediaRootClient
  )
  configureMediaWriteGuard((intent, operation, options) =>
    mutations.run(intent, operation, false, options)
  )
  const handler = createMediaSourceHandler(
    {
      ...config,
      flags:
        dependencies.flags ??
        async function flags(userId) {
          const client = await getLaunchDarklyClient()
          if (typeof client.variation !== 'function')
            return { mediaLibrary: false, websiteMode: false }
          const user = await auth.getUser(userId)
          const context = {
            key: userId,
            firstName: user.displayName,
            email: user.email
          }
          return {
            mediaLibrary:
              (await client.variation('mediaLibrary', context, false)) === true,
            websiteMode:
              (await client.variation('websiteMode', context, false)) === true
          }
        }
    },
    dependencies.media ?? prisma,
    dependencies.journeys ?? journeys,
    dependencies.languages ?? languages,
    dependencies.providers ?? mediaProviders(env)
  )
  return {
    mutations,
    plugins: [
      useMcpMediaSources(handler),
      mutations.plugin,
      {
        onPluginInit() {
          const timer = setInterval(() => {
            void mutations.recover().catch(() => undefined)
          }, 10000)
          timer.unref()
        }
      }
    ]
  }
}

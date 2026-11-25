import { z } from 'zod'

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

import {
  type ImageUploadProvider,
  cloudflareUploadProvider
} from './mcpImageProvider'
import { mediaJobHttp } from './mcpMediaJobHttp'
import { createMediaJobs } from './mcpMediaJobs'
import { createMediaMutationGuard } from './mcpMediaMutations'
import { mediaProviders } from './mcpMediaProviders'
import {
  type MediaSourcesConfig,
  createMediaSourceHandler,
  useMcpMediaSources
} from './mcpMediaSources'
import { type UploadStorage, s3UploadStorage } from './mcpUploadStorage'
import { type VideoUploadProvider, muxUploadProvider } from './mcpVideoProvider'

export function mediaRuntime(
  env: NodeJS.ProcessEnv,
  dependencies: {
    media?: Parameters<typeof createMediaSourceHandler>[1]
    journeys?: Parameters<typeof createMediaSourceHandler>[2]
    languages?: Parameters<typeof createMediaSourceHandler>[3]
    providers?: Parameters<typeof createMediaSourceHandler>[4]
    flags?: MediaSourcesConfig['flags']
    uploads?: {
      storage: UploadStorage
      provider: ImageUploadProvider
      videoProvider?: VideoUploadProvider
      browserIdentity: (token: string) => Promise<string>
      hooks?: Parameters<typeof createMediaJobs>[5]
      scheduleProcessing?: (work: () => Promise<void>) => void
    }
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
  const uploads =
    env.MCP_IMAGE_UPLOADS_ENABLED === 'true'
      ? z
          .object({
            adminOrigin: serviceUrl,
            ingressOrigin: serviceUrl,
            ticketSecret: z.string().min(32),
            uploadLimit: z.coerce.number().int().min(1).max(2).default(2)
          })
          .parse({
            adminOrigin: env.JOURNEYS_ADMIN_URL,
            ingressOrigin: env.MCP_MEDIA_INGRESS_URL,
            ticketSecret: env.MCP_MEDIA_UPLOAD_TICKET_SECRET,
            uploadLimit: env.MCP_MEDIA_UPLOAD_LIMIT
          })
      : undefined
  const jobs = uploads
    ? createMediaJobs(
        {
          ...uploads,
          authorityUrl: config.authorityUrl,
          authoritySecret: config.authoritySecret
        },
        dependencies.media ?? mediaRootClient,
        dependencies.journeys ?? journeys,
        dependencies.uploads?.storage ??
          s3UploadStorage(
            z.string().min(1).parse(env.MCP_MEDIA_STAGING_BUCKET)
          ),
        dependencies.uploads?.provider ?? cloudflareUploadProvider(env),
        dependencies.uploads?.hooks,
        env.MCP_VIDEO_UPLOADS_ENABLED === 'true'
          ? (dependencies.uploads?.videoProvider ??
              muxUploadProvider(env, dependencies.media ?? mediaRootClient))
          : undefined
      )
    : undefined
  return {
    mutations,
    jobs,
    plugins: [
      ...(jobs && uploads
        ? [
            mediaJobHttp(
              {
                ...config,
                ...uploads,
                muxWebhookSecret:
                  env.MCP_VIDEO_UPLOADS_ENABLED === 'true'
                    ? z.string().min(32).parse(env.MCP_MUX_WEBHOOK_SECRET)
                    : undefined,
                flags:
                  dependencies.flags ??
                  (async () => ({ mediaLibrary: true, websiteMode: false }))
              },
              dependencies.media ?? mediaRootClient,
              jobs,
              dependencies.uploads?.browserIdentity ??
                (async (token) => (await auth.verifyIdToken(token, true)).uid)
            )
          ]
        : []),
      useMcpMediaSources(handler),
      mutations.plugin,
      {
        onPluginInit() {
          let processing: Promise<void> | undefined
          const runProcessing = () => {
            if (!jobs) return Promise.resolve()
            processing ??= jobs.processCompletedTransfers().finally(() => {
              processing = undefined
            })
            return processing
          }
          dependencies.uploads?.scheduleProcessing?.(runProcessing)
          const timer = setInterval(() => {
            void mutations.recover().catch(() => undefined)
            void jobs?.recover().catch(() => undefined)
            if (jobs && !dependencies.uploads?.scheduleProcessing)
              void runProcessing().catch(() => undefined)
          }, 10000)
          timer.unref()
        }
      }
    ]
  }
}

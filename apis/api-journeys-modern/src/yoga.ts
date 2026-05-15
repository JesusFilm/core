// eslint-disable-next-line import/order -- Must be imported first
import { tracingPlugin } from '@core/yoga/tracer'

import {
  useForwardedJWT,
  useHmacSignatureValidation
} from '@graphql-hive/gateway'
import {
  createInMemoryCache,
  useResponseCache
} from '@graphql-yoga/plugin-response-cache'
import { initContextCache } from '@pothos/core'
import { createYoga, useReadinessCheck } from 'graphql-yoga'
import get from 'lodash/get'

import { prisma } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'
import { getInteropContext } from '@core/yoga/interop'

import { env } from './env'
import { logger } from './logger'
import { schema } from './schema'
import { Context } from './schema/authScopes'

export const cache = createInMemoryCache()

export const yoga = createYoga<
  Record<string, unknown>,
  Context & ReturnType<typeof initContextCache>
>({
  schema,
  logging: logger,
  maskedErrors: process.env.NODE_ENV === 'test' ? false : undefined,
  context: async ({ request, params }) => {
    const payload = get(params, 'extensions.jwt.payload')
    const user = getUserFromPayload(payload, logger)

    if (user != null) {
      const currentRoles =
        (
          await prisma.userRole.findUnique({
            where: { userId: user?.id }
          })
        )?.roles ?? []

      return {
        ...initContextCache(),
        type: 'authenticated',
        user: { ...user, roles: currentRoles },
        currentRoles,
        cache
      }
    }
    const interopToken = request.headers.get('interop-token')
    const ipAddress = request.headers.get('x-forwarded-for')
    const interopContext = getInteropContext({ interopToken, ipAddress })
    if (interopContext != null)
      return {
        ...initContextCache(),
        type: 'interop',
        ...interopContext,
        cache
      }

    return {
      ...initContextCache(),
      type: 'public',
      cache
    }
  },
  plugins: [
    tracingPlugin,
    useForwardedJWT({}),
    process.env.NODE_ENV !== 'test'
      ? useHmacSignatureValidation({
          secret: env.GATEWAY_HMAC_SECRET
        })
      : {},
    useReadinessCheck({
      endpoint: '/.well-known/apollo/server-health',
      check: async () => {
        await prisma.$queryRaw`SELECT 1`
      }
    }),
    process.env.NODE_ENV !== 'test'
      ? useResponseCache({
          session: () => null,
          cache,
          ttlPerSchemaCoordinate: {
            'Journey.blockTypenames': 0,
            'Query.adminJourney': 0,
            'Query.adminJourneys': 0,
            'Query.customDomain': 0,
            'Query.customDomains': 0,
            // Private per-user data — must not be served from a global shared
            // cache (session: () => null). TTL 0 disables caching entirely for
            // this field, preventing cross-user profile contamination that caused
            // the terms-and-conditions redirect to be skipped for new users.
            'Query.getJourneyProfile': 0,
            'Query.getUserRole': 0,
            'Query.googleSheetsSyncs': 0,
            // Team-scoped admin reads. The default TTL of Infinity caches the
            // first response indefinitely, keyed only on (query, teamId). When
            // a fresh user's first read returns an empty list, the cached
            // entry has no TemplateGalleryPage entity IDs in it — so
            // mutation-based invalidation cannot match it, and subsequent
            // creates appear to "disappear" until the cache is manually
            // flushed (NES-1648).
            'Query.templateGalleryPage': 0,
            'Query.templateGalleryPages': 0,
            // Public renderer. Finite TTL caps cache-poisoning impact: a `null`
            // response (unknown slug / draft / malformed) caches with no entity
            // ID, so the plugin's automatic entity-ID invalidation cannot evict
            // it. Without a finite TTL the null branch would persist for the
            // lifetime of the cache, letting an attacker pre-poison popular
            // slugs so legitimate later publishes appear 404. 60 s gives the
            // renderer reasonable cache hit-rate while bounding poisoning impact.
            //
            // The legitimate-workflow stale-null gap (NES-1644: publish →
            // unpublish → publish → cached null persists for up to 60 s, public
            // page renders 404) is closed by explicit
            // `cache.invalidate([{ typename: 'TemplateGalleryPage' }])` calls in
            // every TemplateGalleryPage mutation (publish, unpublish, delete,
            // assignJourney, reorderTemplate, update). Typename-level
            // invalidation walks the cache by recorded typename presence, so
            // it reaches null entries that have no entity ID. See the
            // `responseCacheLifecycle.spec.ts` canary for proof. The 60 s TTL
            // therefore now exists primarily to bound the (much smaller)
            // attacker-controlled poisoning window — workflow correctness no
            // longer depends on it.
            'Query.templateGalleryPageBySlug': 60_000,
            'Query.journeysPlausibleStatsAggregate': 5000,
            'Query.journeysPlausibleStatsBreakdown': 5000,
            'Query.journeysPlausibleStatsRealtimeVisitors': 5000,
            'Query.journeysPlausibleStatsTimeseries': 5000,
            'Query.templateFamilyStatsAggregate': 5000,
            'Query.templateFamilyStatsBreakdown': 5000
          }
        })
      : {}
  ]
})

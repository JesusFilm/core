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
        currentRoles
      }
    }
    const interopToken = request.headers.get('interop-token')
    const ipAddress = request.headers.get('x-forwarded-for')
    const interopContext = getInteropContext({ interopToken, ipAddress })
    if (interopContext != null)
      return {
        ...initContextCache(),
        type: 'interop',
        ...interopContext
      }

    return {
      ...initContextCache(),
      type: 'public'
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
            // Public renderer. TTL 0 because the response embeds journey-side
            // data (the `templates` list) whose underlying mutations live in
            // the separate api-journeys service. Yoga's entity-ID auto-
            // invalidation only runs for mutations that flow through this
            // server, so journey-side actions (trash, edit, soft-delete)
            // would otherwise leave a stale cached page for up to the TTL.
            // Cached null entries also can't be reached by entity-ID
            // invalidation (no entity to track), which previously made
            // unpublish→republish cycles serve a stale 404. One indexed
            // slug lookup per request is trivial.
            'Query.templateGalleryPageBySlug': 0,
            // Per-user / ACL-scoped reads overridden from api-journeys. These
            // share two hazards under the default Infinity TTL on a global
            // (session: () => null) cache:
            //   1. Stale empty/null lists. When a read returns [] or null, the
            //      cached entry carries no entity IDs, so mutation-based
            //      invalidation can never match it — a subsequent create appears
            //      to "disappear" until the cache is flushed (same class as
            //      NES-1648 above; surfaced for userInvites: inviting an editor
            //      did not show until a full refresh).
            //   2. Cross-user contamination. The cache is keyed without a
            //      session, so one user's ACL-filtered result could be served to
            //      another. TTL 0 disables caching for these private reads
            //      entirely, which is the only safe option here.
            'Query.adminJourneysReport': 0,
            'Query.block': 0,
            'Query.blocks': 0,
            'Query.hosts': 0,
            'Query.integrations': 0,
            'Query.journey': 0,
            'Query.journeyCollection': 0,
            'Query.journeyCollections': 0,
            'Query.journeyEventsConnection': 0,
            'Query.journeyTemplateLanguageIds': 0,
            'Query.journeyTheme': 0,
            'Query.journeyVisitorsConnection': 0,
            'Query.journeys': 0,
            'Query.journeysEmailPreference': 0,
            'Query.qrCode': 0,
            'Query.qrCodes': 0,
            'Query.team': 0,
            'Query.teams': 0,
            'Query.userInvites': 0,
            'Query.userTeam': 0,
            'Query.userTeamInvites': 0,
            'Query.userTeams': 0,
            'Query.visitor': 0,
            'Query.visitorsConnection': 0,
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

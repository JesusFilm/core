import { prisma } from '@core/prisma/media/client'

import { logger } from '../../logger'
import { builder } from '../builder'
import { NotFoundError } from '../error'

import { publishLink } from './edge'
import { ShortLinkStatus } from './enums/shortLinkStatus'
import {
  assertShortLinkAdmin,
  editorScopes,
  isProtectedAssetClass
} from './lib/access'

/** One bulk action at a time: the publishes that follow are one KV call per link. */
export const BULK_UPDATE_MAX_IDS = 100

builder.mutationFields((t) => ({
  shortLinkBulkUpdate: t.withAuth(editorScopes).prismaFieldWithInput({
    type: ['ShortLink'],
    description:
      'pause, resume, retag or re-campaign several short links at once; every link is republished to the edge',
    errors: { types: [NotFoundError] },
    nullable: false,
    input: {
      ids: t.input.stringList({
        required: true,
        description: `at most ${BULK_UPDATE_MAX_IDS} ids`,
        validate: { maxLength: BULK_UPDATE_MAX_IDS }
      }),
      status: t.input.field({ type: ShortLinkStatus, required: false }),
      addTags: t.input.stringList({ required: false }),
      removeTags: t.input.stringList({ required: false }),
      addCampaignIds: t.input.stringList({ required: false }),
      removeCampaignIds: t.input.stringList({ required: false })
    },
    resolve: async (query, _, { input }, context) => {
      const ids = [...new Set(input.ids)]
      if (ids.length === 0) return []

      const existing = await prisma.shortLink.findMany({
        where: { id: { in: ids }, deletedAt: null },
        select: { id: true, tags: true, assetClass: true }
      })
      const missing = ids.filter(
        (id) => !existing.some((link) => link.id === id)
      )
      if (missing.length > 0)
        throw new NotFoundError('short link not found', [
          { path: ['input', 'ids'], value: missing.join(', ') }
        ])

      const protectedLink = existing.find((link) =>
        isProtectedAssetClass(link.assetClass)
      )
      if (input.status != null && protectedLink != null)
        assertShortLinkAdmin(
          context,
          `only a short link admin may change the status of a ${protectedLink.assetClass} link`
        )

      const addTags = input.addTags ?? []
      const removeTags = input.removeTags ?? []
      const addCampaignIds = input.addCampaignIds ?? []
      const removeCampaignIds = input.removeCampaignIds ?? []

      // The database changes commit as one unit; the edge is published
      // afterwards, one link at a time, so a slow or failing KV call can never
      // roll the database back under records that were already written.
      const updated = await prisma.$transaction(async (tx) => {
        const links = []
        for (const link of existing) {
          const tags = [
            ...new Set(
              [...link.tags, ...addTags].filter(
                (tag) => !removeTags.includes(tag)
              )
            )
          ]
          links.push(
            await tx.shortLink.update({
              ...query,
              where: { id: link.id },
              data: {
                status: input.status ?? undefined,
                // a person deciding the status overrides the health check's pause
                pausedByHealthCheckAt: input.status != null ? null : undefined,
                tags,
                campaigns: {
                  connect: addCampaignIds.map((id) => ({ id })),
                  disconnect: removeCampaignIds.map((id) => ({ id }))
                }
              }
            })
          )
        }
        return links
      })

      const published = []
      for (const shortLink of updated) {
        let edgePublishedAt: Date | null = null
        try {
          edgePublishedAt = await publishLink(shortLink.id)
        } catch (error) {
          // the link keeps its old edgePublishedAt, which the admin shows as
          // "not published"; Republish repairs it
          logger.error(
            { error, shortLinkId: shortLink.id },
            'short link bulk update: edge publish failed'
          )
        }
        published.push(
          edgePublishedAt == null
            ? shortLink
            : { ...shortLink, edgePublishedAt }
        )
      }
      return published
    }
  })
}))

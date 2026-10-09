import { prisma } from '@core/prisma/media/client'

import { builder } from '../builder'
import { NotFoundError } from '../error'

import { publishLink } from './edge'
import { ShortLinkStatus } from './enums/shortLinkStatus'
import { editorScopes } from './lib/access'

builder.mutationFields((t) => ({
  shortLinkBulkUpdate: t.withAuth(editorScopes).prismaFieldWithInput({
    type: ['ShortLink'],
    description:
      'pause, resume, retag or re-campaign several short links at once; every link is republished to the edge',
    errors: { types: [NotFoundError] },
    nullable: false,
    input: {
      ids: t.input.stringList({ required: true }),
      status: t.input.field({ type: ShortLinkStatus, required: false }),
      addTags: t.input.stringList({ required: false }),
      removeTags: t.input.stringList({ required: false }),
      addCampaignIds: t.input.stringList({ required: false }),
      removeCampaignIds: t.input.stringList({ required: false })
    },
    resolve: async (query, _, { input }) => {
      const ids = [...new Set(input.ids)]
      if (ids.length === 0) return []

      const existing = await prisma.shortLink.findMany({
        where: { id: { in: ids }, deletedAt: null },
        select: { id: true, tags: true }
      })
      const missing = ids.filter(
        (id) => !existing.some((link) => link.id === id)
      )
      if (missing.length > 0)
        throw new NotFoundError('short link not found', [
          { path: ['input', 'ids'], value: missing.join(', ') }
        ])

      const addTags = input.addTags ?? []
      const removeTags = input.removeTags ?? []
      const addCampaignIds = input.addCampaignIds ?? []
      const removeCampaignIds = input.removeCampaignIds ?? []

      return await prisma.$transaction(async (tx) => {
        const updated = []
        for (const link of existing) {
          const tags = [
            ...new Set(
              [...link.tags, ...addTags].filter(
                (tag) => !removeTags.includes(tag)
              )
            )
          ]
          const shortLink = await tx.shortLink.update({
            ...query,
            where: { id: link.id },
            data: {
              status: input.status ?? undefined,
              tags,
              campaigns: {
                connect: addCampaignIds.map((id) => ({ id })),
                disconnect: removeCampaignIds.map((id) => ({ id }))
              }
            }
          })
          const edgePublishedAt = await publishLink(link.id, tx)
          updated.push(
            edgePublishedAt == null
              ? shortLink
              : { ...shortLink, edgePublishedAt }
          )
        }
        return updated
      })
    }
  })
}))

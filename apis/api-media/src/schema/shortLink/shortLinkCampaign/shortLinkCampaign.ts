import { Prisma, prisma } from '@core/prisma/media/client'

import { builder } from '../../builder'
import { NotFoundError } from '../../error'
import { publishLink } from '../edge'

export const ShortLinkCampaign = builder.prismaObject('ShortLinkCampaign', {
  description:
    'A named group of short links (a YouTube push, a season, a partner) with an optional date range and owner',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    description: t.exposeString('description', { nullable: true }),
    startsAt: t.expose('startsAt', { type: 'DateTime', nullable: true }),
    endsAt: t.expose('endsAt', { type: 'DateTime', nullable: true }),
    tags: t.exposeStringList('tags', { nullable: false }),
    ownerId: t.exposeString('ownerId', {
      nullable: true,
      description: 'user id of the campaign owner'
    }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    shortLinks: t.relation('shortLinks', {
      nullable: false,
      description: 'live (not soft-deleted) links in this campaign',
      query: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }
    }),
    linkCount: t.relationCount('shortLinks', {
      nullable: false,
      where: { deletedAt: null }
    })
  })
})

function campaignNotFound(path: string[], id: string): NotFoundError {
  return new NotFoundError('short link campaign not found', [
    { path, value: id }
  ])
}

function isRecordNotFound(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  )
}

const campaignScopes = {
  $any: { isShortLinkEditor: true, isValidInterop: true }
} as const

builder.queryFields((t) => ({
  shortLinkCampaigns: t.withAuth(campaignScopes).prismaConnection({
    cursor: 'id',
    type: 'ShortLinkCampaign',
    description: 'list short link campaigns, optionally filtered by name',
    nullable: false,
    args: {
      search: t.arg.string({
        required: false,
        description: 'case-insensitive match against the campaign name'
      })
    },
    resolve: async (query, _, { search }) =>
      await prisma.shortLinkCampaign.findMany({
        ...query,
        where:
          search != null && search !== ''
            ? { name: { contains: search, mode: 'insensitive' } }
            : undefined,
        orderBy: { name: 'asc' }
      }),
    totalCount: async (_, { search }) =>
      await prisma.shortLinkCampaign.count({
        where:
          search != null && search !== ''
            ? { name: { contains: search, mode: 'insensitive' } }
            : undefined
      })
  }),
  shortLinkCampaign: t.withAuth(campaignScopes).prismaField({
    type: 'ShortLinkCampaign',
    description: 'find a short link campaign by id',
    errors: { types: [NotFoundError] },
    nullable: false,
    args: { id: t.arg.string({ required: true }) },
    resolve: async (query, _, { id }) => {
      const campaign = await prisma.shortLinkCampaign.findUnique({
        ...query,
        where: { id }
      })
      if (campaign == null) throw campaignNotFound(['id'], id)
      return campaign
    }
  })
}))

builder.mutationFields((t) => ({
  shortLinkCampaignCreate: t.withAuth(campaignScopes).prismaFieldWithInput({
    type: 'ShortLinkCampaign',
    description: 'create a short link campaign',
    nullable: false,
    input: {
      name: t.input.string({ required: true }),
      description: t.input.string({ required: false }),
      startsAt: t.input.field({ type: 'DateTime', required: false }),
      endsAt: t.input.field({ type: 'DateTime', required: false }),
      tags: t.input.stringList({ required: false })
    },
    resolve: async (query, _, { input }, context) =>
      await prisma.shortLinkCampaign.create({
        ...query,
        data: {
          name: input.name,
          description: input.description ?? undefined,
          startsAt: input.startsAt ?? undefined,
          endsAt: input.endsAt ?? undefined,
          tags: input.tags ?? [],
          ownerId:
            context.type === 'authenticated' ? context.user.id : undefined
        }
      })
  }),
  shortLinkCampaignUpdate: t.withAuth(campaignScopes).prismaFieldWithInput({
    type: 'ShortLinkCampaign',
    description: 'update a short link campaign',
    errors: { types: [NotFoundError] },
    nullable: false,
    input: {
      id: t.input.string({ required: true }),
      name: t.input.string({ required: false }),
      description: t.input.string({ required: false }),
      startsAt: t.input.field({ type: 'DateTime', required: false }),
      endsAt: t.input.field({ type: 'DateTime', required: false }),
      tags: t.input.stringList({ required: false })
    },
    resolve: async (query, _, { input }) => {
      try {
        return await prisma.shortLinkCampaign.update({
          ...query,
          where: { id: input.id },
          data: {
            name: input.name ?? undefined,
            description: input.description,
            startsAt: input.startsAt,
            endsAt: input.endsAt,
            tags: input.tags ?? undefined
          }
        })
      } catch (error) {
        if (isRecordNotFound(error))
          throw campaignNotFound(['input', 'id'], input.id)
        throw error
      }
    }
  }),
  shortLinkCampaignDelete: t.withAuth(campaignScopes).prismaField({
    type: 'ShortLinkCampaign',
    description:
      'delete a short link campaign; its links are detached, not deleted',
    errors: { types: [NotFoundError] },
    nullable: false,
    args: { id: t.arg.string({ required: true }) },
    resolve: async (query, _, { id }) =>
      await prisma.$transaction(async (tx) => {
        const links = await tx.shortLink.findMany({
          where: { campaigns: { some: { id } }, deletedAt: null },
          select: { id: true }
        })
        let campaign
        try {
          campaign = await tx.shortLinkCampaign.delete({
            ...query,
            where: { id }
          })
        } catch (error) {
          if (isRecordNotFound(error)) throw campaignNotFound(['id'], id)
          throw error
        }
        // the routing records carry campaignIds, so every detached link is
        // republished without this campaign
        for (const link of links) await publishLink(link.id, tx)
        return campaign
      })
  })
}))

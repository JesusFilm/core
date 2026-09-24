import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { isInTeam } from '../authScopes'
import { builder } from '../builder'
import { assertHttpsUrl } from '../templateGalleryPage/assertHttpsUrl'
import { SlugTakenError } from '../templateGalleryPage/generateUniqueSlug'
import {
  mediaCreateData,
  mediaUpdateData,
  resolveMediaInput
} from '../templateGalleryPage/media/resolveMediaInput'

import { CampaignRef } from './campaign'
import { validateUserSuppliedCampaignSlug } from './campaignSlug'
import {
  assertJourneyListSize,
  filterToTeamJourneys
} from './filterToTeamJourneys'
import { CampaignUpdateInput } from './inputs'

async function replaceRoleList(
  tx: Prisma.TransactionClient,
  campaignId: string,
  teamId: string,
  role: 'share' | 'template',
  journeyIds: readonly string[]
): Promise<void> {
  await tx.campaignJourney.deleteMany({ where: { campaignId, role } })
  if (journeyIds.length === 0) return
  const { validIds } = await filterToTeamJourneys(tx, teamId, journeyIds, role)
  if (validIds.length === 0) return
  await tx.campaignJourney.createMany({
    data: validIds.map((journeyId, order) => ({
      campaignId,
      journeyId,
      role,
      order
    }))
  })
}

builder.mutationField('campaignUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      "Update editable fields of a Campaign. All input fields are optional: a field omitted leaves the existing value alone, a field set to `null` clears it (where nullable). When `shareJourneyIds` / `templateJourneyIds` is provided, that role's list is replaced in the given order (other role untouched). Allowed on both `draft` and `published` campaigns.\n\nAuth: caller must be a member of the campaign's team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the campaign's team.\n- BAD_USER_INPUT (field: `slug`): user-supplied slug fails shape, length, reserved-word, or uniqueness checks.\n- BAD_USER_INPUT (field: `backgroundImageSrc`): URL is not https.\n- BAD_USER_INPUT (field: `shareJourneyIds` / `templateJourneyIds`): more than 100 ids.\n- CONFLICT (field: `media` / `journeys`): a concurrent write touched the same rows; retry.",
    type: CampaignRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignUpdateInput, required: true })
    },
    resolve: async (query, _parent, args, context) => {
      const id = String(args.id)
      const input = args.input

      const campaign = await prisma.campaign.findUnique({
        where: { id },
        select: { id: true, teamId: true }
      })
      if (campaign == null) {
        throw new GraphQLError('campaign not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }
      if (!(await isInTeam({ context, teamId: campaign.teamId }))) {
        throw new GraphQLError('user is not allowed to update campaign', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      assertHttpsUrl(input.backgroundImageSrc, 'backgroundImageSrc')
      assertJourneyListSize(input.shareJourneyIds, 'shareJourneyIds')
      assertJourneyListSize(input.templateJourneyIds, 'templateJourneyIds')

      // External IO must run BEFORE the tx. Null when media was omitted.
      const resolvedMedia = await resolveMediaInput(input.media)

      const slug =
        input.slug != null
          ? await validateUserSuppliedCampaignSlug(input.slug, id)
          : undefined

      return await prisma.$transaction(async (tx) => {
        try {
          if (input.shareJourneyIds != null) {
            await replaceRoleList(
              tx,
              id,
              campaign.teamId,
              'share',
              input.shareJourneyIds
            )
          }
          if (input.templateJourneyIds != null) {
            await replaceRoleList(
              tx,
              id,
              campaign.teamId,
              'template',
              input.templateJourneyIds
            )
          }
        } catch (error) {
          // (campaignId, role, order) unique tripped by an interleaved write.
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
          ) {
            throw new GraphQLError(
              'campaign journeys were modified concurrently; retry',
              { extensions: { code: 'CONFLICT', field: 'journeys' } }
            )
          }
          throw error
        }

        if (resolvedMedia != null) {
          try {
            await tx.campaignMedia.upsert({
              where: { campaignId: id },
              create: { campaignId: id, ...mediaCreateData(resolvedMedia) },
              update: mediaUpdateData(resolvedMedia)
            })
          } catch (error) {
            if (
              error instanceof Prisma.PrismaClientKnownRequestError &&
              error.code === 'P2002'
            ) {
              throw new GraphQLError('media was modified concurrently; retry', {
                extensions: { code: 'CONFLICT', field: 'media' }
              })
            }
            throw error
          }
        }

        const data: Prisma.CampaignUpdateInput = {
          title: input.title ?? undefined,
          description: input.description ?? undefined,
          statsFrom: input.statsFrom ?? undefined,
          slug
        }
        // Nullable scalars: undefined leaves alone, null clears.
        if (input.eyebrow !== undefined) data.eyebrow = input.eyebrow
        if (input.tagline !== undefined) data.tagline = input.tagline
        if (input.backgroundImageSrc !== undefined) {
          data.backgroundImageSrc = input.backgroundImageSrc
        }
        if (input.backgroundImageAlt !== undefined) {
          data.backgroundImageAlt = input.backgroundImageAlt
        }

        try {
          return await tx.campaign.update({ ...query, where: { id }, data })
        } catch (error) {
          // Two concurrent updates with the same slug both pass validation;
          // the second trips the unique index at commit.
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002' &&
            Array.isArray(error.meta?.target) &&
            (error.meta.target as string[]).includes('slug')
          ) {
            throw new SlugTakenError()
          }
          throw error
        }
      })
    }
  })
)

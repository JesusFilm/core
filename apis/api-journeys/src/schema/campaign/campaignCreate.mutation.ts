import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'
import { assertHttpsUrl } from '../templateGalleryPage/assertHttpsUrl'
import {
  mediaCreateData,
  resolveMediaInput
} from '../templateGalleryPage/media/resolveMediaInput'

import { CampaignRef } from './campaign'
import { generateUniqueCampaignSlug } from './campaignSlug'
import {
  assertJourneyListSize,
  filterToTeamJourneys
} from './filterToTeamJourneys'
import { CampaignCreateInput } from './inputs'

type CreateInput = typeof CampaignCreateInput.$inferInput

builder.mutationField('campaignCreate', (t) =>
  t
    .withAuth((_parent, args) => ({
      $all: {
        isAuthenticated: true,
        isInTeam: (args.input as CreateInput).teamId
      }
    }))
    .prismaField({
      description:
        'Create a new Campaign in `draft` status. The server generates a unique slug from `input.title`. Initial `shareJourneyIds` / `templateJourneyIds` are attached in the order given (invalid ids are silently filtered out).\n\nAuth: caller must be authenticated and a member of `input.teamId`.\n\nErrors:\n- BAD_USER_INPUT (field: `backgroundImageSrc`): URL is not https.\n- BAD_USER_INPUT (field: `slug`): the title normalizes to empty or to a reserved word.\n- BAD_USER_INPUT (field: `shareJourneyIds` / `templateJourneyIds`): more than 100 ids.\n- CONFLICT (field: `media`): media row was modified concurrently.',
      type: CampaignRef,
      nullable: false,
      args: {
        input: t.arg({ type: CampaignCreateInput, required: true })
      },
      resolve: async (query, _parent, args) => {
        const {
          teamId,
          title,
          eyebrow,
          tagline,
          description,
          backgroundImageSrc,
          backgroundImageAlt,
          statsFrom,
          shareJourneyIds,
          templateJourneyIds,
          media
        } = args.input
        assertHttpsUrl(backgroundImageSrc, 'backgroundImageSrc')
        assertJourneyListSize(shareJourneyIds, 'shareJourneyIds')
        assertJourneyListSize(templateJourneyIds, 'templateJourneyIds')

        // External IO (oEmbed / cross-DB Mux read) must run BEFORE the tx.
        const resolvedMedia = await resolveMediaInput(media)

        let attempt = 0
        while (true) {
          const slug = await generateUniqueCampaignSlug(title)
          try {
            return await prisma.$transaction(async (tx) => {
              const { validIds: shareIds } = await filterToTeamJourneys(
                tx,
                teamId,
                shareJourneyIds ?? [],
                'share'
              )
              const { validIds: templateIds } = await filterToTeamJourneys(
                tx,
                teamId,
                templateJourneyIds ?? [],
                'template'
              )
              const campaign = await tx.campaign.create({
                data: {
                  team: { connect: { id: teamId } },
                  title,
                  slug,
                  status: 'draft',
                  eyebrow: eyebrow ?? undefined,
                  tagline: tagline ?? undefined,
                  description: description ?? undefined,
                  backgroundImageSrc: backgroundImageSrc ?? undefined,
                  backgroundImageAlt: backgroundImageAlt ?? undefined,
                  statsFrom: statsFrom ?? undefined,
                  journeys: {
                    createMany: {
                      data: [
                        ...shareIds.map((journeyId, order) => ({
                          journeyId,
                          role: 'share' as const,
                          order
                        })),
                        ...templateIds.map((journeyId, order) => ({
                          journeyId,
                          role: 'template' as const,
                          order
                        }))
                      ]
                    }
                  }
                }
              })
              if (resolvedMedia != null) {
                try {
                  await tx.campaignMedia.create({
                    data: {
                      campaignId: campaign.id,
                      ...mediaCreateData(resolvedMedia)
                    }
                  })
                } catch (error) {
                  if (
                    error instanceof Prisma.PrismaClientKnownRequestError &&
                    error.code === 'P2002'
                  ) {
                    throw new GraphQLError(
                      'media was modified concurrently; retry',
                      { extensions: { code: 'CONFLICT', field: 'media' } }
                    )
                  }
                  throw error
                }
              }
              // Re-read with the Pothos `query` spread so the response includes
              // the just-created relations and any nested selections.
              return await tx.campaign.findUniqueOrThrow({
                ...query,
                where: { id: campaign.id }
              })
            })
          } catch (error) {
            // Retry only the slug-uniqueness race (fresh slug on the next pass).
            if (
              error instanceof Prisma.PrismaClientKnownRequestError &&
              error.code === 'P2002' &&
              Array.isArray(error.meta?.target) &&
              (error.meta.target as string[]).includes('slug') &&
              attempt === 0
            ) {
              attempt += 1
              continue
            }
            throw error
          }
        }
      }
    })
)

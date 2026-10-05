import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { CampaignRef } from './campaign'
import { Action, campaignAcl } from './campaign.acl'
import { fetchLanguage } from './gatewayClient'
import { CampaignCreateInput } from './inputs'
import { resolveCampaignStringValues, seedCampaign } from './seed'
import {
  TEXT_CAPS,
  assertLength,
  badUserInput,
  generateUniqueCampaignSlug
} from './validation'

builder.mutationField('campaignCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Create a draft Campaign born complete (the Campaign Seed): the generated slug, one Campaign Language, the Light Campaign Theme and a Palette drawn from it, both Campaign Pages, the Campaign Chrome, the seventeen Campaign Strings and the starter sections, all in one transaction. No regions, media or journeys. Returns the full campaign so the editor opens it with no second fetch.\n\nAuth: campaign Create — any member or manager of `input.teamId`.\n\nErrors:\n- FORBIDDEN: caller is not in the team.\n- NOT_FOUND: the team does not exist.\n- BAD_USER_INPUT (field: `title`): empty or over 100 characters.\n- BAD_USER_INPUT (field: `defaultLanguageId`): not an api-languages language.\n- BAD_USER_INPUT (field: `slug`): the title normalises to empty or to a reserved word.',
    type: CampaignRef,
    nullable: false,
    args: {
      input: t.arg({ type: CampaignCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }, context) => {
      const teamId = String(input.teamId)
      const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: { userTeams: true }
      })
      if (team == null)
        throw new GraphQLError('team not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (!campaignAcl(Action.Create, { team }, context.user))
        throw new GraphQLError('user is not allowed to create campaign', {
          extensions: { code: 'FORBIDDEN' }
        })

      const title = assertLength(input.title, 'title', TEXT_CAPS.campaignTitle, {
        required: true
      })
      const defaultLanguageId = String(input.defaultLanguageId)
      const language = await fetchLanguage(defaultLanguageId)
      if (language == null)
        throw badUserInput(
          'defaultLanguageId must be an existing language',
          'defaultLanguageId'
        )
      const strings = await resolveCampaignStringValues(language.bcp47)

      let attempt = 0
      while (true) {
        const slug = await generateUniqueCampaignSlug(title)
        try {
          return await prisma.$transaction(async (tx) => {
            const campaignId = await seedCampaign(tx, {
              teamId,
              title,
              slug,
              defaultLanguageId,
              strings,
              year: new Date().getUTCFullYear()
            })
            return await tx.campaign.findUniqueOrThrow({
              ...query,
              where: { id: campaignId }
            })
          })
        } catch (error) {
          // Only the slug-uniqueness race is retried, once, with a fresh slug.
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

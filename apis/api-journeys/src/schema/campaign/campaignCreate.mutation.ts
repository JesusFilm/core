import { prisma } from '@core/prisma/journeys/client'

import { Action } from '../../lib/auth/ability'
import { builder } from '../builder'

import { CampaignRef } from './campaign'
import { campaignAcl } from './campaign.acl'
import { badUserInput, conflict, forbidden, notFound } from './errors'
import { fetchLanguage } from './gatewayClient'
import { CampaignCreateInput } from './inputs'
import { resolveCampaignStringValues, seedCampaign } from './seed'
import { generateUniqueCampaignSlug } from './slug'
import { TEXT_CAPS, assertLength, isUniqueViolation } from './validation'

builder.mutationField('campaignCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Create a draft Campaign born complete (the Campaign Seed): the generated slug, one Campaign Language, the Light Campaign Theme and a Palette drawn from it, both Campaign Pages, the Campaign Chrome, the eighteen Campaign Strings and the starter sections, all in one transaction. No regions, media or journeys. Returns the full campaign so the editor opens it with no second fetch.\n\nAuth: campaign Create — any member or manager of `input.teamId`.\n\nErrors:\n- FORBIDDEN: caller is not in the team.\n- NOT_FOUND: the team does not exist.\n- BAD_USER_INPUT (field: `title`): empty or over 100 characters.\n- BAD_USER_INPUT (field: `defaultLanguageId`): not an api-languages language.\n- BAD_USER_INPUT (field: `slug`): the title normalises to empty or to a reserved word.\n- CONFLICT (field: `slug`): a concurrent create took the generated address twice; retry.',
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
      if (team == null) throw notFound('team not found')
      if (!campaignAcl(Action.Create, { team }, context.user))
        throw forbidden('user is not allowed to create campaign')

      const title = assertLength(
        input.title,
        'title',
        TEXT_CAPS.campaignTitle,
        {
          required: true
        }
      )
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
          // Only the slug-uniqueness race is retried, once, with a fresh slug;
          // losing it twice is the same CONFLICT a region create answers with.
          if (isUniqueViolation(error, 'slug')) {
            if (attempt === 0) {
              attempt += 1
              continue
            }
            throw conflict(
              'another campaign was just created; try again',
              'slug'
            )
          }
          throw error
        }
      }
    }
  })
)

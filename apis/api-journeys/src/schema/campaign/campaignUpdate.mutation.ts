import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'
import { SlugTakenError } from '../templateGalleryPage/generateUniqueSlug'

import { CampaignRef } from './campaign'
import { Action, INCLUDE_CAMPAIGN_ACL, campaignAcl } from './campaign.acl'
import { CampaignUpdateInput } from './inputs'
import { TEXT_CAPS, assertLength, validateCampaignSlug } from './validation'

builder.mutationField('campaignUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      'Update the campaign settings: the default-language title and the Campaign Address slug. Allowed on draft and published campaigns alike. The slug never follows a title change; it moves only when given here, and existing links to the old address stop resolving.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `title`): empty or over 100 characters.\n- BAD_USER_INPUT (field: `slug`): fails the shape, length, reserved-word or global-uniqueness checks (including the concurrent-update race on the unique constraint).',
    type: CampaignRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignUpdateInput, required: true })
    },
    resolve: async (query, _parent, { id: rawId, input }, context) => {
      const id = String(rawId)
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        include: INCLUDE_CAMPAIGN_ACL
      })
      if (campaign == null)
        throw new GraphQLError('campaign not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      if (!campaignAcl(Action.Update, campaign, context.user))
        throw new GraphQLError('user is not allowed to update campaign', {
          extensions: { code: 'FORBIDDEN' }
        })

      const data: Prisma.CampaignUpdateInput = {}
      if (input.title != null)
        data.title = assertLength(
          input.title,
          'title',
          TEXT_CAPS.campaignTitle,
          { required: true }
        )
      if (input.slug != null)
        data.slug = await validateCampaignSlug(input.slug, id)

      try {
        return await prisma.campaign.update({ ...query, where: { id }, data })
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          Array.isArray(error.meta?.target) &&
          (error.meta.target as string[]).includes('slug')
        )
          throw new SlugTakenError()
        throw error
      }
    }
  })
)

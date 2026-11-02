import { Prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'
import { SlugTakenError } from '../templateGalleryPage/generateUniqueSlug'

import { authorizeCampaign } from './authorizeCampaign'
import { CampaignRef } from './campaign'
import { campaignWrite } from './campaignWrite'
import { badUserInput } from './errors'
import { CampaignUpdateInput } from './inputs'
import { enqueueCampaignSlugRevalidation } from './revalidateCampaign'
import { validateCampaignSlug } from './slug'
import { swapDefaultLanguage } from './translation/defaultLanguageSwap'
import {
  NULL_FIELD_ERROR,
  TEXT_CAPS,
  assertLength,
  assertNotNull,
  assertPalette,
  isUniqueViolation
} from './validation'

const DEFAULT_LANGUAGE_SWAP_TIMEOUT_MS = 30_000

builder.mutationField('campaignUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    description:
      `Update the campaign settings — the default-language title, the Campaign Address slug and the default language — or the Palette. Allowed on draft and published campaigns alike. The slug never follows a title change; it moves only when given here, and existing links to the old address stop resolving. The Palette is picker chrome: each entry assertHex-normalised, deduplicated, the first eight kept newest first; saved outside any Command.\n\nAuth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: id does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: \`title\`): empty or over ${TEXT_CAPS.campaignTitle} characters.\n- BAD_USER_INPUT (field: \`slug\`): fails the shape, length, reserved-word or global-uniqueness checks (including the concurrent-update race on the unique constraint).\n- BAD_USER_INPUT (field: \`palette\`): an entry is not a hex colour.\n- BAD_USER_INPUT (field: \`defaultLanguageId\`): not one of the campaign’s languages, including when a concurrent removal took it.\n- BAD_USER_INPUT (field: \`title\`): given together with a \`defaultLanguageId\` that changes the default; the title is the default-language text, so change the language first, then the title.\n- CONFLICT (field: \`defaultLanguageId\`, extension \`count\`): that many texts have no translation in the new default language yet; machine-translate or write them first. When none is missing, one transaction swaps every field’s default text with the new language’s translation; a machine value promoted to default loses its machine flag.\n` +
      NULL_FIELD_ERROR +
      '\n\nA slug change on a published campaign queues on-demand revalidation of its pages under the old and the new slug.',
    type: CampaignRef,
    nullable: false,
    args: {
      id: t.arg({ type: 'ID', required: true }),
      input: t.arg({ type: CampaignUpdateInput, required: true })
    },
    resolve: async (query, _parent, { id: rawId, input }, context) => {
      const id = String(rawId)
      const campaign = await authorizeCampaign(id, 'update', context.user, {
        languages: true,
        regions: true
      })

      const title = assertNotNull(input.title, 'title')
      const rawSlug = assertNotNull(input.slug, 'slug')
      const palette = assertNotNull(input.palette, 'palette')
      const defaultLanguageId = assertNotNull(
        input.defaultLanguageId,
        'defaultLanguageId'
      )

      const data: Prisma.CampaignUpdateInput = {}
      if (title !== undefined)
        data.title = assertLength(title, 'title', TEXT_CAPS.campaignTitle, {
          required: true
        })
      const slug =
        rawSlug === undefined
          ? undefined
          : await validateCampaignSlug(rawSlug, id)
      if (slug != null) data.slug = slug
      if (palette !== undefined) data.palette = assertPalette(palette)

      const newDefaultLanguageId =
        defaultLanguageId === undefined ? null : String(defaultLanguageId)
      if (
        newDefaultLanguageId != null &&
        !campaign.languages.some(
          (language) => language.languageId === newDefaultLanguageId
        )
      )
        throw badUserInput(
          'defaultLanguageId must be one of the campaign languages',
          'defaultLanguageId'
        )
      const changesDefaultLanguage =
        newDefaultLanguageId != null &&
        newDefaultLanguageId !== campaign.defaultLanguageId
      if (changesDefaultLanguage && title !== undefined)
        throw badUserInput(
          'title cannot be changed together with the default language; change the language first',
          'title'
        )

      // Both paths write the Campaign row, whose `updatedAt` is `@updatedAt`,
      // so neither needs the touch.
      try {
        const updated = changesDefaultLanguage
          ? await campaignWrite(
              id,
              { textRows: true, campaignRow: true, touch: false },
              async ({ tx }) => {
                const swapped = await swapDefaultLanguage(
                  tx,
                  id,
                  newDefaultLanguageId
                )
                return await tx.campaign.update({
                  ...query,
                  where: { id },
                  data: {
                    ...swapped,
                    ...data,
                    defaultLanguageId: newDefaultLanguageId
                  }
                })
              },
              { timeout: DEFAULT_LANGUAGE_SWAP_TIMEOUT_MS }
            )
          : await campaignWrite(
              id,
              { touch: false },
              async ({ tx }) =>
                await tx.campaign.update({ ...query, where: { id }, data })
            )
        if (slug != null)
          await enqueueCampaignSlugRevalidation(
            { ...campaign, slug },
            campaign.slug
          )
        return updated
      } catch (error) {
        if (isUniqueViolation(error, 'slug')) throw new SlugTakenError()
        throw error
      }
    }
  })
)

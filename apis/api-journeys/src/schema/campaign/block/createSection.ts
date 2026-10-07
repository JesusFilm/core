import { prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import {
  CampaignBlockCreateData,
  CampaignBlockWithAction,
  CampaignSectionTypename,
  authorizeBlockCreate,
  createSectionBlock,
  validateSectionPage
} from './service'

/** The four fields every section create input shares. */
export interface SectionCreateInput {
  id?: string | number | null
  campaignId: string | number
  pageId: string | number
  parentOrder?: number | null
}

/**
 * The shared resolve of the per-type section creates: campaign Update,
 * the page check (same campaign; region-only sections off the landing
 * page), the type's own body validation, then the insert in one
 * transaction.
 */
export async function createSection(
  input: SectionCreateInput,
  typename: CampaignSectionTypename,
  user: User,
  body: () => Omit<CampaignBlockCreateData, 'id' | 'typename'>
): Promise<CampaignBlockWithAction> {
  const campaignId = String(input.campaignId)
  await authorizeBlockCreate(campaignId, user)
  const page = await validateSectionPage(
    campaignId,
    String(input.pageId),
    typename
  )
  const data = body()
  return await prisma.$transaction(
    async (tx) =>
      await createSectionBlock(
        tx,
        page,
        {
          id: input.id != null ? String(input.id) : undefined,
          typename,
          ...data
        },
        input.parentOrder
      )
  )
}

export const SECTION_CREATE_ERRORS =
  'Auth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: campaignId does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `pageId`): not a page of this campaign.\n- BAD_USER_INPUT (field: `parentOrder`): negative.'

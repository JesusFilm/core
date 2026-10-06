import { prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import {
  CampaignBlockCreateData,
  CampaignBlockWithAction,
  CampaignSectionTypename,
  authorizeBlockCreate,
  createColumnsSection,
  createSectionBlock,
  createSlotChild,
  validateSectionPage,
  validateSlotParent
} from './service'

/** The fields every section create input shares. */
export interface SectionCreateInput {
  id?: string | number | null
  campaignId: string | number
  pageId: string | number
  parentBlockId?: string | number | null
  parentOrder?: number | null
  /** Columns sections only: client-chosen ids for the two slots. */
  slotIds?: Array<string | number> | null
}

/**
 * The shared resolve of the per-type section creates: campaign Update,
 * the page check (same campaign; region-only sections off the landing
 * page), the column slot check when the section goes into one, the type's
 * own body validation, then the insert in one transaction. A section in a
 * slot is the slot's only child, so `parentOrder` does not apply to it; a
 * Columns section is inserted with its two slots.
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
  const slot =
    input.parentBlockId != null
      ? await validateSlotParent(
          String(input.parentBlockId),
          campaignId,
          page,
          typename
        )
      : null
  const data = {
    id: input.id != null ? String(input.id) : undefined,
    typename,
    ...body()
  }
  return await prisma.$transaction(async (tx) => {
    if (slot != null) return await createSlotChild(tx, slot, data)
    if (typename === 'CampaignColumnsBlock')
      return await createColumnsSection(
        tx,
        page,
        data,
        input.parentOrder,
        input.slotIds?.map(String)
      )
    return await createSectionBlock(tx, page, data, input.parentOrder)
  })
}

export const SECTION_CREATE_ERRORS =
  'Auth: campaign Update — any member or manager of the campaign’s team.\n\nErrors:\n- NOT_FOUND: campaignId does not resolve.\n- FORBIDDEN: caller is not in the team.\n- BAD_USER_INPUT (field: `pageId`): not a page of this campaign.\n- BAD_USER_INPUT (field: `parentOrder`): negative.\n- BAD_USER_INPUT (field: `parentBlockId`): not a live column slot on the page, already holding a section, or the section is a Columns or Region Share section.'

export const SECTION_PARENT_BLOCK_ID_DESCRIPTION =
  'A Column Slot to create the section in, instead of at the page’s top level; `parentOrder` is then ignored. The slot must be empty on the same page.'

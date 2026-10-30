import { User } from '@core/yoga/firebaseClient'

import { assertClientId } from '../validation'

import {
  CampaignBlockCreateData,
  CampaignBlockWithAction,
  CampaignSectionTypename,
  authorizeBlockCreate,
  createColumnsSection,
  createSectionBlock,
  createSlotChild,
  createWithClientIds,
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
  body: () =>
    | Omit<CampaignBlockCreateData, 'id' | 'typename'>
    | Promise<Omit<CampaignBlockCreateData, 'id' | 'typename'>>
): Promise<CampaignBlockWithAction> {
  const campaignId = String(input.campaignId)
  await authorizeBlockCreate(campaignId, user)
  const id = assertClientId(input.id)
  const slotIds = input.slotIds?.map(String)
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
    id,
    typename,
    ...(await body())
  }
  return await createWithClientIds(
    { id: [id], slotIds: slotIds ?? [] },
    campaignId,
    { structure: true },
    async ({ tx }) => {
      if (slot != null) return await createSlotChild(tx, slot, data)
      if (typename === 'CampaignColumnsBlock')
        return await createColumnsSection(
          tx,
          page,
          data,
          input.parentOrder,
          slotIds
        )
      return await createSectionBlock(tx, page, data, input.parentOrder)
    }
  )
}

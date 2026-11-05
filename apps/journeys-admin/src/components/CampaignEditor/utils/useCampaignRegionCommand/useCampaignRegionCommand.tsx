import { useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_regions as CampaignRegion
} from '../../../../../__generated__/GetCampaign'
import { useCampaignRegionCreateMutation } from '../../../../libs/useCampaignRegionCreateMutation'
import { useCampaignRegionDeleteMutation } from '../../../../libs/useCampaignRegionDeleteMutation'
import { useCampaignRegionOrderUpdateMutation } from '../../../../libs/useCampaignRegionOrderUpdateMutation'
import { useCampaignRegionUpdateMutation } from '../../../../libs/useCampaignRegionUpdateMutation'
import {
  regionLines,
  sortedRegions,
  useCampaignEditor
} from '../../CampaignEditorProvider'
import { useCampaignCommand } from '../useCampaignCommand'
import { useCommandFailure } from '../useCommandFailure'

/** The name a new region is born with (PRD §3); campaign content, not UI copy. */
export const NEW_REGION_NAME = 'New region'
const NEW_REGION_SLUG = 'new-region'

/** The slug the API will derive for the next new region: `new-region`, then `-2`, `-3`, … */
export function nextRegionSlug(
  regions: Array<Pick<CampaignRegion, 'slug'>>
): string {
  const taken = new Set(regions.map((region) => region.slug))
  if (!taken.has(NEW_REGION_SLUG)) return NEW_REGION_SLUG
  for (let suffix = 2; suffix <= 50; suffix++) {
    const candidate = `${NEW_REGION_SLUG}-${suffix}`
    if (!taken.has(candidate)) return candidate
  }
  return NEW_REGION_SLUG
}

/** A new region as `campaignRegionCreate` returns it, for the optimistic response: one unlinked default-language Share Language. */
export function newRegion(campaign: Campaign, id: string): CampaignRegion {
  const defaultLanguage = campaign.languages.find(
    (language) => language.languageId === campaign.defaultLanguageId
  )
  return {
    __typename: 'CampaignRegion',
    id,
    campaignId: campaign.id,
    name: NEW_REGION_NAME,
    nameTranslations: [],
    slug: nextRegionSlug(campaign.regions),
    order: campaign.regions.length,
    listed: true,
    languages: [
      {
        __typename: 'CampaignRegionLanguage',
        id: `${id}-${campaign.defaultLanguageId}`,
        regionId: id,
        languageId: campaign.defaultLanguageId,
        journeyId: null,
        journeyUrl: null,
        title: null,
        description: null,
        snapshotEdited: false,
        qrCodeId: null,
        order: 0,
        language: defaultLanguage?.language ?? {
          __typename: 'Language',
          id: campaign.defaultLanguageId,
          bcp47: null,
          name: []
        },
        journey: null,
        qrCode: null
      }
    ],
    countries: []
  }
}

/** What a region is created with: its name, slug and default-language Share Language. */
export type BornRegion = Pick<CampaignRegion, 'name' | 'slug' | 'languages'>

/**
 * A just-created region is still empty while it has no lines, no countries,
 * still the name and slug it was born with, and no Share Language but the
 * one it was born with, unlinked and without a QR code, so undoing its
 * creation may delete it. Any other Share Language, linked or not, makes it
 * non-empty: an unlinked one can hold a QR code, which the delete removes.
 * Renaming or re-slugging is not a Command, so it would be lost.
 */
export function isEmptyRegion(
  campaign: Campaign,
  regionId: string,
  born: BornRegion
): boolean {
  const region = campaign.regions.find((candidate) => candidate.id === regionId)
  if (region == null) return false
  const bornLanguageIds = new Set(born.languages.map((language) => language.id))
  return (
    region.name === born.name &&
    region.slug === born.slug &&
    region.countries.length === 0 &&
    region.languages.every(
      (language) =>
        bornLanguageIds.has(language.id) &&
        language.journeyId == null &&
        language.qrCodeId == null
    ) &&
    regionLines(campaign.blocks, regionId).length === 0
  )
}

type OrderRows = Array<{
  __typename: 'CampaignRegion'
  id: string
  order: number
}>

/** The rows a move produces: the region at `order` (clamped to the end), everyone renumbered. */
export function reorderedRegions(
  regions: CampaignRegion[],
  region: CampaignRegion,
  order: number
): OrderRows {
  const others = sortedRegions(regions).filter(
    (candidate) => candidate.id !== region.id
  )
  others.splice(Math.min(order, others.length), 0, region)
  return others.map((candidate, index) => ({
    __typename: 'CampaignRegion',
    id: candidate.id,
    order: index
  }))
}

interface AddRegionOptions {
  /** The switcher the + Add was pressed in, so the new card is selected inside it. */
  hostBlockId?: string
}

/**
 * The region Commands. Adding a region runs `campaignRegionCreate` and
 * selects the new card; its undo deletes the region while it is still empty
 * (unlisting first, since only an orphan can be deleted) and leaves it alone
 * once the author has put lines, countries or another Share Language on it,
 * linked a journey or renamed it; redo recreates the same row, unless undo
 * left the region in place. List/unlist is a one-field Command with no
 * confirmation, and reorder writes the new order with every region
 * renumbered at once; undo reverses each through the same mutation. Delete
 * is not a Command: see `OrphanPageBar`.
 */
export function useCampaignRegionCommand(): {
  addRegion: (options?: AddRegionOptions) => void
  setListed: (region: CampaignRegion, listed: boolean) => void
  reorderRegion: (region: CampaignRegion, order: number) => void
} {
  const { addCampaignCommand } = useCampaignCommand()
  const { campaign } = useCampaignEditor()
  const campaignRef = useRef(campaign)
  campaignRef.current = campaign
  const [regionCreate] = useCampaignRegionCreateMutation(campaign.id)
  const [regionUpdate] = useCampaignRegionUpdateMutation()
  const [regionDelete] = useCampaignRegionDeleteMutation(campaign.id)
  const [orderUpdate] = useCampaignRegionOrderUpdateMutation()
  const reportFailure = useCommandFailure()

  function addRegion({ hostBlockId }: AddRegionOptions = {}): void {
    const id = uuidv4()
    const region = newRegion(campaign, id)
    let born: BornRegion = region
    const selectRegion = { selectedBlockId: hostBlockId, selectedRegionId: id }

    async function create(): Promise<void> {
      const result = await regionCreate({
        variables: { campaignId: campaign.id, id },
        optimisticResponse: { campaignRegionCreate: region }
      })
      if (result.data?.campaignRegionCreate != null)
        born = result.data.campaignRegionCreate
    }

    addCampaignCommand({
      focus: { execute: selectRegion, redo: selectRegion },
      execute: create,
      async undo() {
        if (!isEmptyRegion(campaignRef.current, id, born)) return
        await regionUpdate({
          variables: { id, input: { listed: false } },
          optimisticResponse: {
            campaignRegionUpdate: { ...region, listed: false }
          }
        })
        await regionDelete({
          variables: { id },
          optimisticResponse: {
            campaignRegionDelete: { __typename: 'CampaignRegion', id }
          }
        })
      },
      async redo() {
        const stillThere = campaignRef.current.regions.some(
          (candidate) => candidate.id === id
        )
        if (!stillThere) await create()
      }
    }).catch((error: unknown) => reportFailure(error))
  }

  function setListed(region: CampaignRegion, listed: boolean): void {
    async function write(next: boolean): Promise<unknown> {
      return await regionUpdate({
        variables: { id: region.id, input: { listed: next } },
        optimisticResponse: {
          campaignRegionUpdate: {
            __typename: 'CampaignRegion',
            id: region.id,
            name: region.name,
            slug: region.slug,
            listed: next
          }
        }
      })
    }

    addCampaignCommand({
      execute: async () => await write(listed),
      undo: async () => await write(region.listed)
    }).catch((error: unknown) => reportFailure(error))
  }

  function reorderRegion(region: CampaignRegion, order: number): void {
    async function write(next: number): Promise<unknown> {
      return await orderUpdate({
        variables: { id: region.id, order: next },
        optimisticResponse: {
          campaignRegionOrderUpdate: reorderedRegions(
            campaign.regions,
            region,
            next
          )
        }
      })
    }

    addCampaignCommand({
      execute: async () => await write(order),
      undo: async () => await write(region.order)
    }).catch((error: unknown) => reportFailure(error))
  }

  return { addRegion, setListed, reorderRegion }
}

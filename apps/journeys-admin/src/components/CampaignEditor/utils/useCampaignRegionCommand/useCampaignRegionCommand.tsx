import { useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_regions as CampaignRegion
} from '../../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../../__generated__/globalTypes'
import { useCampaignRegionCreateMutation } from '../../../../libs/useCampaignRegionCreateMutation'
import { useCampaignRegionDeleteMutation } from '../../../../libs/useCampaignRegionDeleteMutation'
import { useCampaignRegionOrderUpdateMutation } from '../../../../libs/useCampaignRegionOrderUpdateMutation'
import { useCampaignRegionUpdateMutation } from '../../../../libs/useCampaignRegionUpdateMutation'
import {
  regionLines,
  sortedRegions,
  useCampaignEditor
} from '../../CampaignEditorProvider'

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

/** A new region as `campaignRegionCreate` returns it, for the optimistic response. */
export function newRegion(campaign: Campaign, id: string): CampaignRegion {
  return {
    __typename: 'CampaignRegion',
    id,
    campaignId: campaign.id,
    name: NEW_REGION_NAME,
    slug: nextRegionSlug(campaign.regions),
    order: campaign.regions.length,
    listed: true,
    countries: []
  }
}

/**
 * A just-created region is still empty while it has no lines, no countries
 * and nothing else the author added, so undoing its creation may delete it.
 */
export function isEmptyRegion(campaign: Campaign, regionId: string): boolean {
  const region = campaign.regions.find((candidate) => candidate.id === regionId)
  if (region == null) return false
  return (
    region.countries.length === 0 &&
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

interface Focus {
  pageKind: CampaignPageKind
  regionId?: string
  selectedBlockId?: string
  selectedRegionId?: string
}

interface ListedParameters {
  listed: boolean
}

interface OrderParameters {
  order: number
  rows: OrderRows
}

interface AddRegionOptions {
  /** The switcher the + Add was pressed in, so the new card is selected inside it. */
  hostBlockId?: string
}

/**
 * The region Commands. Adding a region runs `campaignRegionCreate` and
 * selects the new card; its undo deletes the region while it is still empty
 * (unlisting first, since only an orphan can be deleted) and leaves it alone
 * once the author has put lines or countries on it; redo recreates the same
 * row. List/unlist is a one-field Command with no confirmation, and reorder
 * writes the new order with every region renumbered at once; undo reverses
 * each through the same mutation. Delete is not a Command: see
 * `OrphanPageBar`.
 */
export function useCampaignRegionCommand(): {
  addRegion: (options?: AddRegionOptions) => void
  setListed: (region: CampaignRegion, listed: boolean) => void
  reorderRegion: (region: CampaignRegion, order: number) => void
} {
  const { add } = useCommand()
  const { campaign, state, dispatch } = useCampaignEditor()
  const campaignRef = useRef(campaign)
  campaignRef.current = campaign
  const [regionCreate] = useCampaignRegionCreateMutation(campaign.id)
  const [regionUpdate] = useCampaignRegionUpdateMutation()
  const [regionDelete] = useCampaignRegionDeleteMutation(campaign.id)
  const [orderUpdate] = useCampaignRegionOrderUpdateMutation()

  function currentFocus(): Focus {
    return {
      pageKind: state.pageKind,
      regionId: state.regionId,
      selectedBlockId: state.selectedBlockId,
      selectedRegionId: state.selectedRegionId
    }
  }

  function focus(target: Focus): void {
    dispatch({ type: 'SetEditorFocusAction', ...target })
  }

  function addRegion({ hostBlockId }: AddRegionOptions = {}): void {
    const id = uuidv4()
    const region = newRegion(campaign, id)
    const before = currentFocus()
    const after: Focus = {
      pageKind: state.pageKind,
      regionId: state.regionId,
      selectedBlockId: hostBlockId,
      selectedRegionId: id
    }

    function create(): void {
      void regionCreate({
        variables: { campaignId: campaign.id, id },
        optimisticResponse: { campaignRegionCreate: region }
      })
    }

    add({
      parameters: { execute: {}, undo: {} },
      execute() {
        focus(after)
        create()
      },
      undo() {
        focus(before)
        if (!isEmptyRegion(campaignRef.current, id)) return
        void regionUpdate({
          variables: { id, input: { listed: false } },
          optimisticResponse: {
            campaignRegionUpdate: { ...region, listed: false }
          }
        }).then(
          async () =>
            await regionDelete({
              variables: { id },
              optimisticResponse: {
                campaignRegionDelete: { __typename: 'CampaignRegion', id }
              }
            })
        )
      },
      redo() {
        focus(after)
        create()
      }
    })
  }

  function setListed(region: CampaignRegion, listed: boolean): void {
    const target = currentFocus()
    add<ListedParameters>({
      parameters: { execute: { listed }, undo: { listed: region.listed } },
      execute({ listed: next }) {
        focus(target)
        void regionUpdate({
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
    })
  }

  function reorderRegion(region: CampaignRegion, order: number): void {
    const target = currentFocus()
    add<OrderParameters>({
      parameters: {
        execute: {
          order,
          rows: reorderedRegions(campaign.regions, region, order)
        },
        undo: {
          order: region.order,
          rows: reorderedRegions(campaign.regions, region, region.order)
        }
      },
      execute({ order: next, rows }) {
        focus(target)
        void orderUpdate({
          variables: { id: region.id, order: next },
          optimisticResponse: { campaignRegionOrderUpdate: rows }
        })
      }
    })
  }

  return { addRegion, setListed, reorderRegion }
}

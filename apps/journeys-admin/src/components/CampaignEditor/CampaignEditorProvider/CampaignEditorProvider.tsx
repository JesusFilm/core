import {
  Dispatch,
  ReactElement,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer
} from 'react'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_regions as CampaignRegion
} from '../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../__generated__/globalTypes'

export interface CampaignEditorState {
  /** The page the canvas shows; a view choice, never a Command. */
  pageKind: CampaignPageKind
  /** The region the Region Page is rendered for; ignored on the landing page. */
  regionId?: string
  /** The selected block; undefined is the campaign row (or a region card). */
  selectedBlockId?: string
  /** The selected region card; its switcher, if known, is `selectedBlockId`. */
  selectedRegionId?: string
  /** Bumped by the bar's Edit so the selected block's primary text takes focus. */
  editRequest: number
}

interface SetPageKindAction {
  type: 'SetPageKindAction'
  pageKind: CampaignPageKind
  /** The region to render the Region Page for; the first region when omitted. */
  regionId?: string
}
interface SelectBlockAction {
  type: 'SelectBlockAction'
  blockId?: string
}
/** Select a region card; `hostBlockId` is the switcher it was clicked in. */
interface SelectRegionAction {
  type: 'SelectRegionAction'
  regionId: string
  hostBlockId?: string
}
/**
 * Focus a page and a block (or a region card) together: what a Command's
 * undo dispatches first when it was made on another page, so the author
 * sees the value change.
 */
interface SetEditorFocusAction {
  type: 'SetEditorFocusAction'
  pageKind?: CampaignPageKind
  regionId?: string
  selectedBlockId?: string
  selectedRegionId?: string
}
interface RequestEditAction {
  type: 'RequestEditAction'
}
export type CampaignEditorAction =
  | SetPageKindAction
  | SelectBlockAction
  | SelectRegionAction
  | SetEditorFocusAction
  | RequestEditAction

export function reducer(
  state: CampaignEditorState,
  action: CampaignEditorAction
): CampaignEditorState {
  switch (action.type) {
    case 'SetPageKindAction':
      return {
        ...state,
        pageKind: action.pageKind,
        regionId: action.regionId ?? state.regionId,
        selectedBlockId: undefined,
        selectedRegionId: undefined
      }
    case 'SelectBlockAction':
      return {
        ...state,
        selectedBlockId: action.blockId,
        selectedRegionId: undefined
      }
    case 'SelectRegionAction':
      return {
        ...state,
        selectedBlockId: action.hostBlockId,
        selectedRegionId: action.regionId
      }
    case 'SetEditorFocusAction':
      return {
        ...state,
        pageKind: action.pageKind ?? state.pageKind,
        regionId: action.regionId ?? state.regionId,
        selectedBlockId: action.selectedBlockId,
        selectedRegionId: action.selectedRegionId
      }
    case 'RequestEditAction':
      return { ...state, editRequest: state.editRequest + 1 }
  }
}

export type CampaignSelectionKind =
  | 'campaign'
  | 'section'
  | 'chrome'
  | 'text'
  | 'button'
  | 'region'

export interface CampaignSelection {
  kind: CampaignSelectionKind
  /** The selected block; undefined on the campaign row or a region card. */
  block?: CampaignBlock
  /** The section or chrome block hosting the selection; the block itself when one is selected. */
  host?: CampaignBlock
  /** The selected region card, or the region a selected Region Line belongs to. */
  region?: CampaignRegion
}

export const CAMPAIGN_SELECTION: CampaignSelection = { kind: 'campaign' }

function isChrome(block: CampaignBlock): boolean {
  return (
    block.__typename === 'CampaignHeaderBlock' ||
    block.__typename === 'CampaignFooterBlock'
  )
}

/** The campaign's regions in switcher order. */
export function sortedRegions(regions: CampaignRegion[]): CampaignRegion[] {
  return [...regions].sort((a, b) => a.order - b.order)
}

/** A region's Region Lines in line order. */
export function regionLines(
  blocks: CampaignBlock[],
  regionId: string
): CampaignBlock[] {
  return blocks
    .filter(
      (block) =>
        block.regionId === regionId &&
        block.parentBlockId == null &&
        block.parentOrder != null
    )
    .sort((a, b) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0))
}

/**
 * Resolve the selection from the block and region lists: what is selected
 * and where it sits. A region card wins when one is selected and still
 * exists; a Region Line resolves to text with its region and no host.
 */
export function resolveSelection(
  blocks: CampaignBlock[],
  selectedBlockId: string | undefined,
  regions: CampaignRegion[] = [],
  selectedRegionId?: string
): CampaignSelection {
  if (selectedRegionId != null) {
    const region = regions.find(
      (candidate) => candidate.id === selectedRegionId
    )
    if (region != null)
      return {
        kind: 'region',
        region,
        host: blocks.find((candidate) => candidate.id === selectedBlockId)
      }
  }
  if (selectedBlockId == null) return CAMPAIGN_SELECTION
  const block = blocks.find((candidate) => candidate.id === selectedBlockId)
  if (block == null) return CAMPAIGN_SELECTION
  if (
    block.__typename === 'CampaignTypographyBlock' ||
    block.__typename === 'CampaignButtonBlock'
  ) {
    if (block.regionId != null)
      return {
        kind: 'text',
        block,
        region: regions.find((candidate) => candidate.id === block.regionId)
      }
    const host = blocks.find(
      (candidate) => candidate.id === block.parentBlockId
    )
    return {
      kind: block.__typename === 'CampaignTypographyBlock' ? 'text' : 'button',
      block,
      host
    }
  }
  return { kind: isChrome(block) ? 'chrome' : 'section', block, host: block }
}

export interface CampaignEditorContextValue {
  campaign: Campaign
  state: CampaignEditorState
  dispatch: Dispatch<CampaignEditorAction>
  selection: CampaignSelection
  /** The region the canvas renders the Region Page for; undefined on the landing page or with no regions. */
  currentRegion?: CampaignRegion
  /** Select a block, or the campaign row when no id is given. */
  selectBlock: (blockId?: string) => void
  /** Select a region card, naming the switcher it sits in when known. */
  selectRegion: (regionId: string, hostBlockId?: string) => void
  /** Escape: an Extra steps up to its section, a line to its region, a region to its switcher, a section or chrome block to the campaign row. */
  escape: () => void
  /** The page a block sits on; undefined for chrome and Region Lines, which every page shows. */
  pageKindOf: (
    block: Pick<CampaignBlock, 'pageId'>
  ) => CampaignPageKind | undefined
}

export const CampaignEditorContext = createContext<
  CampaignEditorContextValue | undefined
>(undefined)

interface CampaignEditorProviderProps {
  campaign: Campaign
  initialState?: Partial<CampaignEditorState>
  children: ReactNode
}

/**
 * The campaign editor's selection reducer: which page the canvas shows (and
 * which region the Region Page is rendered for) and which block or region
 * card is selected. The selection resolves against the campaign's block and
 * region lists, so a row that leaves the cache (deleted, undone) falls back
 * to the campaign row without a dispatch.
 */
export function CampaignEditorProvider({
  campaign,
  initialState,
  children
}: CampaignEditorProviderProps): ReactElement {
  const [state, dispatch] = useReducer(reducer, {
    pageKind: CampaignPageKind.landing,
    editRequest: 0,
    ...initialState
  })
  const selection = useMemo(
    () =>
      resolveSelection(
        campaign.blocks,
        state.selectedBlockId,
        campaign.regions,
        state.selectedRegionId
      ),
    [
      campaign.blocks,
      campaign.regions,
      state.selectedBlockId,
      state.selectedRegionId
    ]
  )
  const currentRegion = useMemo(() => {
    if (state.pageKind !== CampaignPageKind.regionTemplate) return undefined
    const regions = sortedRegions(campaign.regions)
    return (
      regions.find((candidate) => candidate.id === state.regionId) ?? regions[0]
    )
  }, [campaign.regions, state.pageKind, state.regionId])
  const selectBlock = useCallback(
    (blockId?: string) => dispatch({ type: 'SelectBlockAction', blockId }),
    []
  )
  const selectRegion = useCallback(
    (regionId: string, hostBlockId?: string) =>
      dispatch({ type: 'SelectRegionAction', regionId, hostBlockId }),
    []
  )
  const escape = useCallback(() => {
    if (selection.kind === 'campaign') return
    if (selection.kind === 'region') {
      selectBlock(selection.host?.id)
      return
    }
    if (selection.kind === 'text' && selection.region != null) {
      selectRegion(selection.region.id)
      return
    }
    if (selection.kind === 'text' || selection.kind === 'button') {
      selectBlock(selection.host?.id)
      return
    }
    selectBlock(undefined)
  }, [selection, selectBlock, selectRegion])
  const pageKindOf = useCallback(
    (block: Pick<CampaignBlock, 'pageId'>) =>
      campaign.pages.find((page) => page.id === block.pageId)?.kind,
    [campaign.pages]
  )
  const value = useMemo(
    () => ({
      campaign,
      state,
      dispatch,
      selection,
      currentRegion,
      selectBlock,
      selectRegion,
      escape,
      pageKindOf
    }),
    [
      campaign,
      state,
      selection,
      currentRegion,
      selectBlock,
      selectRegion,
      escape,
      pageKindOf
    ]
  )

  return (
    <CampaignEditorContext.Provider value={value}>
      {children}
    </CampaignEditorContext.Provider>
  )
}

export function useCampaignEditor(): CampaignEditorContextValue {
  const context = useContext(CampaignEditorContext)
  if (context === undefined)
    throw new Error(
      'useCampaignEditor must be used within a CampaignEditorProvider'
    )
  return context
}

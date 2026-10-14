import {
  Dispatch,
  MutableRefObject,
  ReactElement,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef
} from 'react'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_regions as CampaignRegion
} from '../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { isInColumnSlot } from '../sectionTypes'

/** The left rail panel that is open; `none` while all are closed. */
export type CampaignPanel = 'pages' | 'navigator' | 'add' | 'localize' | 'none'

/** The Inspector tab the selection shows. */
export type CampaignInspectorTab = 'style' | 'settings'

export interface CampaignEditorState {
  /** The page the canvas shows; a view choice, never a Command. */
  pageKind: CampaignPageKind
  /** The region the Region Page is rendered for; ignored on the landing page. */
  regionId?: string
  /**
   * The Preview Language the canvas renders in: a campaign language id, the
   * default on first open. Text edits made while it is not the default write
   * translations for it. A view choice, never a Command.
   */
  previewLanguageId: string
  /** The selected block; undefined is the campaign (or a region card). */
  selectedBlockId?: string
  /** The selected region card; its switcher, if known, is `selectedBlockId`. */
  selectedRegionId?: string
  /** Bumped by the bar's Edit so the selected block's primary text takes focus. */
  editRequest: number
  /** The open rail panel; a view choice, never a Command. */
  panel: CampaignPanel
  /** The Inspector tab; a view choice, never a Command. */
  inspectorTab: CampaignInspectorTab
  /** Bumped by Option+Z so the Navigator expands or collapses its whole tree. */
  navigatorExpandRequest: number
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
interface SetPreviewLanguageAction {
  type: 'SetPreviewLanguageAction'
  previewLanguageId: string
}
/** Open a rail panel, or close it when it is the one already open. */
interface SetPanelAction {
  type: 'SetPanelAction'
  panel: CampaignPanel
}
interface SetInspectorTabAction {
  type: 'SetInspectorTabAction'
  inspectorTab: CampaignInspectorTab
}
/** Ask the Navigator to expand every row, or collapse them all when already expanded. */
interface ToggleNavigatorExpandAction {
  type: 'ToggleNavigatorExpandAction'
}
export type CampaignEditorAction =
  | SetPageKindAction
  | SelectBlockAction
  | SelectRegionAction
  | SetEditorFocusAction
  | RequestEditAction
  | SetPreviewLanguageAction
  | SetPanelAction
  | SetInspectorTabAction
  | ToggleNavigatorExpandAction

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
    case 'SetPreviewLanguageAction':
      return { ...state, previewLanguageId: action.previewLanguageId }
    case 'SetPanelAction':
      return {
        ...state,
        panel: state.panel === action.panel ? 'none' : action.panel
      }
    case 'SetInspectorTabAction':
      return { ...state, inspectorTab: action.inspectorTab }
    case 'ToggleNavigatorExpandAction':
      return {
        ...state,
        navigatorExpandRequest: state.navigatorExpandRequest + 1
      }
  }
}

export type CampaignSelectionKind =
  | 'campaign'
  | 'section'
  | 'chrome'
  | 'text'
  | 'button'
  | 'slot'
  | 'column'
  | 'card'
  | 'journey'
  | 'region'

export interface CampaignSelection {
  kind: CampaignSelectionKind
  /** The selected block; undefined on the campaign or a region card. */
  block?: CampaignBlock
  /**
   * The section or chrome block hosting the selection; the block itself when
   * one is selected, and the Columns section for a selected Column Slot.
   */
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

/** A Video Carousel's explicit item: a CampaignVideoBlock ordered among its children. */
export function isCarouselItem(
  blocks: CampaignBlock[],
  block: CampaignBlock
): boolean {
  if (block.__typename !== 'CampaignVideoBlock' || block.parentOrder == null)
    return false
  return blocks.some(
    (candidate) =>
      candidate.id === block.parentBlockId &&
      candidate.__typename === 'CampaignVideoCarouselBlock'
  )
}

/** The campaign's regions in switcher order. */
export function sortedRegions(regions: CampaignRegion[]): CampaignRegion[] {
  return [...regions].sort((a, b) => a.order - b.order)
}

/** A region's Region Lines in line order. */
/** A region needs a journey while any of its Share Languages is unlinked: its switcher card and page-selector entry carry the badge. */
export function regionNeedsJourney(
  region: Pick<CampaignRegion, 'languages'>
): boolean {
  return region.languages.some((language) => language.journeyId == null)
}

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
  if (block.__typename === 'CampaignColumnBlock')
    return {
      kind: 'slot',
      block,
      host: blocks.find((candidate) => candidate.id === block.parentBlockId)
    }
  if (isCarouselItem(blocks, block)) {
    const host = blocks.find(
      (candidate) => candidate.id === block.parentBlockId
    )
    return { kind: 'card', block, host }
  }
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
  if (isInColumnSlot(blocks, block))
    return { kind: 'column', block, host: block }
  if (block.__typename === 'CampaignJourneyBlock')
    return {
      kind: 'journey',
      block,
      host: blocks.find((candidate) => candidate.id === block.parentBlockId)
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
  /** Select a block, or the campaign when no id is given. */
  selectBlock: (blockId?: string) => void
  /** Select a region card, naming the switcher it sits in when known. */
  selectRegion: (regionId: string, hostBlockId?: string) => void
  /**
   * Escape: an Extra or a card steps up to its section, a line to its region,
   * a region to its switcher, a Column Slot or the section in one to its
   * Columns section, a section or chrome block to the campaign.
   */
  escape: () => void
  /** The page a block sits on; undefined for chrome and Region Lines, which every page shows. */
  pageKindOf: (
    block: Pick<CampaignBlock, 'pageId'>
  ) => CampaignPageKind | undefined
  /**
   * The canvas frame's document, set by the canvas while the frame is
   * mounted. A ref, so reading it for scroll-to or a hover attribute never
   * re-renders the editor.
   */
  frameDocumentRef: MutableRefObject<Document | null>
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
 * to the campaign without a dispatch. The Preview Language is clamped the
 * same way: when its language leaves `campaign.languages` (removed in the
 * Languages panel) the preview falls back to the campaign default.
 */
export function CampaignEditorProvider({
  campaign,
  initialState,
  children
}: CampaignEditorProviderProps): ReactElement {
  const defaultState: CampaignEditorState = {
    pageKind: CampaignPageKind.landing,
    previewLanguageId: campaign.defaultLanguageId,
    editRequest: 0,
    panel: 'none',
    inspectorTab: 'style',
    navigatorExpandRequest: 0
  }
  const [rawState, dispatch] = useReducer(reducer, {
    ...defaultState,
    ...initialState
  })
  const previewLanguageId = campaign.languages.some(
    (language) => language.languageId === rawState.previewLanguageId
  )
    ? rawState.previewLanguageId
    : campaign.defaultLanguageId
  const state = useMemo(
    () => ({ ...rawState, previewLanguageId }),
    [rawState, previewLanguageId]
  )
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
    if (
      selection.kind === 'text' ||
      selection.kind === 'button' ||
      selection.kind === 'card' ||
      selection.kind === 'journey'
    ) {
      selectBlock(selection.host?.id)
      return
    }
    if (selection.kind === 'slot') {
      selectBlock(selection.host?.id)
      return
    }
    if (selection.kind === 'column') {
      const slot = campaign.blocks.find(
        (candidate) => candidate.id === selection.block?.parentBlockId
      )
      selectBlock(slot?.parentBlockId ?? undefined)
      return
    }
    selectBlock(undefined)
  }, [selection, selectBlock, selectRegion, campaign.blocks])
  const pageKindOf = useCallback(
    (block: Pick<CampaignBlock, 'pageId'>) =>
      campaign.pages.find((page) => page.id === block.pageId)?.kind,
    [campaign.pages]
  )
  const frameDocumentRef = useRef<Document | null>(null)
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
      pageKindOf,
      frameDocumentRef
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

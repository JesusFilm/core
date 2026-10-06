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
  GetCampaign_campaign_blocks as CampaignBlock
} from '../../../../__generated__/GetCampaign'
import { CampaignPageKind } from '../../../../__generated__/globalTypes'

export interface CampaignEditorState {
  /** The page the canvas shows; a view choice, never a Command. */
  pageKind: CampaignPageKind
  /** The selected block; undefined is the campaign row. */
  selectedBlockId?: string
  /** Bumped by the bar's Edit so the selected block's primary text takes focus. */
  editRequest: number
}

interface SetPageKindAction {
  type: 'SetPageKindAction'
  pageKind: CampaignPageKind
}
interface SelectBlockAction {
  type: 'SelectBlockAction'
  blockId?: string
}
/**
 * Focus a page and a block together: what a Command's undo dispatches first
 * when it was made on another page, so the author sees the value change.
 */
interface SetEditorFocusAction {
  type: 'SetEditorFocusAction'
  pageKind?: CampaignPageKind
  selectedBlockId?: string
}
interface RequestEditAction {
  type: 'RequestEditAction'
}
export type CampaignEditorAction =
  | SetPageKindAction
  | SelectBlockAction
  | SetEditorFocusAction
  | RequestEditAction

export function reducer(
  state: CampaignEditorState,
  action: CampaignEditorAction
): CampaignEditorState {
  switch (action.type) {
    case 'SetPageKindAction':
      return { ...state, pageKind: action.pageKind, selectedBlockId: undefined }
    case 'SelectBlockAction':
      return { ...state, selectedBlockId: action.blockId }
    case 'SetEditorFocusAction':
      return {
        ...state,
        pageKind: action.pageKind ?? state.pageKind,
        selectedBlockId: action.selectedBlockId
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
  | 'card'

export interface CampaignSelection {
  kind: CampaignSelectionKind
  /** The selected block; undefined on the campaign row. */
  block?: CampaignBlock
  /** The section or chrome block hosting the selection; the block itself when one is selected. */
  host?: CampaignBlock
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

/** Resolve the selection from the block list: what is selected and where it sits. */
export function resolveSelection(
  blocks: CampaignBlock[],
  selectedBlockId: string | undefined
): CampaignSelection {
  if (selectedBlockId == null) return CAMPAIGN_SELECTION
  const block = blocks.find((candidate) => candidate.id === selectedBlockId)
  if (block == null) return CAMPAIGN_SELECTION
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
  /** Select a block, or the campaign row when no id is given. */
  selectBlock: (blockId?: string) => void
  /** Escape: an Extra or a card steps up to its section, a section or chrome block to the campaign row. */
  escape: () => void
  /** The page a block sits on; undefined for chrome, which every page shows. */
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
 * The campaign editor's selection reducer: which page the canvas shows and
 * which block is selected. The selection resolves against the campaign's
 * block list, so a block that leaves the cache (deleted, undone) falls back
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
    () => resolveSelection(campaign.blocks, state.selectedBlockId),
    [campaign.blocks, state.selectedBlockId]
  )
  const selectBlock = useCallback(
    (blockId?: string) => dispatch({ type: 'SelectBlockAction', blockId }),
    []
  )
  const escape = useCallback(() => {
    if (selection.kind === 'campaign') return
    if (
      selection.kind === 'text' ||
      selection.kind === 'button' ||
      selection.kind === 'card'
    ) {
      selectBlock(selection.host?.id)
      return
    }
    selectBlock(undefined)
  }, [selection, selectBlock])
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
      selectBlock,
      escape,
      pageKindOf
    }),
    [campaign, state, selection, selectBlock, escape, pageKindOf]
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

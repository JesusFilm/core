import { useCallback, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useCommand } from '@core/journeys/ui/CommandProvider'

import { GetCampaign_campaign_blocks as CampaignBlock } from '../../../../../__generated__/GetCampaign'
import { useCampaignBlockDeleteMutation } from '../../../../libs/useCampaignBlockDeleteMutation'
import { useCampaignBlockRestoreMutation } from '../../../../libs/useCampaignBlockRestoreMutation'
import {
  CampaignVideoPick,
  useCampaignCarouselItemCreateMutation
} from '../../../../libs/useCampaignVideoBlockCreateMutation'
import { useCampaignVideoCarouselBlockPlaylistImportMutation } from '../../../../libs/useCampaignVideoCarouselBlockPlaylistImportMutation'
import {
  CampaignCarouselVideoInput,
  CampaignVideoCarouselBlock,
  useCampaignVideoCarouselBlockUpdateMutation
} from '../../../../libs/useCampaignVideoCarouselBlockUpdateMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { siblingsOf } from '../useCampaignBlockDeleteCommand'
import { messageOf, useCampaignStyleCommand } from '../useCampaignStyleCommand'

export interface CampaignCarouselCommand {
  /** Watch expansion of a pasted Watch link, as one Command. */
  setWatchVideo: (carousel: CampaignVideoCarouselBlock, url: string) => void
  /** Explicit mode (`videoId: null`), as one Command; the items stay. */
  clearWatchVideo: (carousel: CampaignVideoCarouselBlock) => void
  /** One explicit item from a YouTube link or a Mux upload, as one Command. */
  addItem: (
    carousel: CampaignVideoCarouselBlock,
    pick: Exclude<CampaignVideoPick, { url: string }>
  ) => void
  /** The first 12 videos of a YouTube playlist as explicit items, as one Command. */
  importPlaylist: (carousel: CampaignVideoCarouselBlock, url: string) => void
  /** The API's message, verbatim, when the last change failed. */
  error?: string
}

type OrderRow = Pick<CampaignBlock, '__typename' | 'id'> & {
  parentOrder: number
}

/** The carousel's children once `removed` are gone, renumbered: what their deletes return. */
function remainingChildren(
  blocks: CampaignBlock[],
  carouselId: string,
  removed: Set<string>
): OrderRow[] {
  const anchor = blocks.find(
    (block) => block.parentBlockId === carouselId && block.parentOrder != null
  )
  if (anchor == null) return []
  return [anchor, ...siblingsOf(blocks, anchor)]
    .filter((block) => !removed.has(block.id))
    .sort((a, b) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0))
    .map((block, parentOrder) => ({
      __typename: block.__typename,
      id: block.id,
      parentOrder
    }))
}

/**
 * The Video Carousel's Commands. The nullable `videoId` is the mode: a
 * Watch link sets it (Watch expansion) and undo writes the previous id
 * back; clearing it switches to explicit mode. Adding items — one YouTube
 * video or upload, or a playlist's first 12 — is one Command that also
 * switches an expanded carousel to explicit mode so the items show. The
 * items are created once; undo soft-deletes them (and restores the Watch
 * video it replaced), redo restores the same rows. A refused change shows
 * the API's message and is retried by redo.
 */
export function useCampaignCarouselCommand(): CampaignCarouselCommand {
  const { add } = useCommand()
  const {
    campaign,
    state: { pageKind },
    dispatch,
    pageKindOf
  } = useCampaignEditor()
  const blocksRef = useRef(campaign.blocks)
  blocksRef.current = campaign.blocks
  const styleCommand = useCampaignStyleCommand()
  const writeVideo = useCampaignVideoCarouselBlockUpdateMutation()
  const createItem = useCampaignCarouselItemCreateMutation(campaign.id)
  const createPlaylist = useCampaignVideoCarouselBlockPlaylistImportMutation(
    campaign.id
  )
  const [blockDelete] = useCampaignBlockDeleteMutation(campaign.id)
  const [blockRestore] = useCampaignBlockRestoreMutation(campaign.id)
  const [itemError, setItemError] = useState<string>()

  const current = useCallback(
    (carousel: CampaignVideoCarouselBlock): CampaignVideoCarouselBlock =>
      (blocksRef.current.find((block) => block.id === carousel.id) as
        | CampaignVideoCarouselBlock
        | undefined) ?? carousel,
    []
  )

  function setWatchVideo(
    carousel: CampaignVideoCarouselBlock,
    url: string
  ): void {
    setItemError(undefined)
    styleCommand.addStyle<
      CampaignVideoCarouselBlock,
      CampaignCarouselVideoInput
    >({
      block: carousel,
      input: { url },
      previous: {
        videoId: carousel.videoId,
        videoVariantLanguageId: carousel.videoVariantLanguageId
      },
      run: writeVideo
    })
  }

  function clearWatchVideo(carousel: CampaignVideoCarouselBlock): void {
    setItemError(undefined)
    styleCommand.addStyle<
      CampaignVideoCarouselBlock,
      CampaignCarouselVideoInput
    >({
      block: carousel,
      input: { videoId: null },
      previous: {
        videoId: carousel.videoId,
        videoVariantLanguageId: carousel.videoVariantLanguageId
      },
      run: writeVideo
    })
  }

  function addItems(
    carousel: CampaignVideoCarouselBlock,
    create: (target: CampaignVideoCarouselBlock) => Promise<CampaignBlock[]>
  ): void {
    styleCommand.clearError()
    setItemError(undefined)
    const blockPageKind = pageKindOf(carousel) ?? pageKind
    const previous: CampaignCarouselVideoInput = {
      videoId: carousel.videoId,
      videoVariantLanguageId: carousel.videoVariantLanguageId
    }
    const wasExpanded = carousel.videoId != null
    let created: CampaignBlock[] | undefined

    function focus(): void {
      dispatch({
        type: 'SetEditorFocusAction',
        pageKind: blockPageKind,
        selectedBlockId: carousel.id
      })
    }

    add({
      parameters: { execute: {}, undo: {} },
      execute() {
        focus()
        void (async () => {
          if (wasExpanded)
            await writeVideo(current(carousel), { videoId: null })
          if (created == null) {
            created = await create(current(carousel))
            return
          }
          await Promise.all(
            created.map(
              async (block) =>
                await blockRestore({
                  variables: { id: block.id },
                  optimisticResponse: { campaignBlockRestore: [block] }
                })
            )
          )
        })().catch((error: unknown) => setItemError(messageOf(error)))
      },
      undo() {
        focus()
        void (async () => {
          const removed = new Set<string>()
          for (const block of created ?? []) {
            removed.add(block.id)
            await blockDelete({
              variables: { id: block.id },
              optimisticResponse: {
                campaignBlockDelete: remainingChildren(
                  blocksRef.current,
                  carousel.id,
                  removed
                )
              }
            })
          }
          if (wasExpanded) await writeVideo(current(carousel), previous)
        })().catch((error: unknown) => setItemError(messageOf(error)))
      }
    })
  }

  function addItem(
    carousel: CampaignVideoCarouselBlock,
    pick: Exclude<CampaignVideoPick, { url: string }>
  ): void {
    const id = uuidv4()
    addItems(carousel, async (target) => {
      const parentOrder = blocksRef.current.filter(
        (block) =>
          block.parentBlockId === target.id && block.parentOrder != null
      ).length
      const result = await createItem({
        id,
        carousel: target,
        pick,
        parentOrder
      })
      const item = result.data?.campaignVideoBlockCreate
      return item != null ? [item] : []
    })
  }

  function importPlaylist(
    carousel: CampaignVideoCarouselBlock,
    url: string
  ): void {
    addItems(carousel, async (target) => {
      const result = await createPlaylist(target.id, url)
      return result.data?.campaignVideoCarouselBlockPlaylistImport ?? []
    })
  }

  return {
    setWatchVideo,
    clearWatchVideo,
    addItem,
    importPlaylist,
    error: itemError ?? styleCommand.error
  }
}

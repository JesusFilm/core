import { useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

import {
  GetCampaign_campaign_blocks as CampaignBlock,
  GetCampaign_campaign_blocks_CampaignVideoCarouselBlock as CampaignVideoCarouselBlock
} from '../../../../../__generated__/GetCampaign'
import { campaignTextCap } from '../../../../libs/useCampaignBlockTextMutation'
import {
  CampaignBlockUpdateInput,
  useCampaignBlockUpdateMutation
} from '../../../../libs/useCampaignBlockUpdateMutation'
import { useCampaignCarouselItemCreateMutation } from '../../../../libs/useCampaignCarouselItemCreateMutation'
import { CampaignVideoPick } from '../../../../libs/useCampaignVideoBlockCreateMutation'
import { useCampaignVideoCarouselBlockPlaylistImportMutation } from '../../../../libs/useCampaignVideoCarouselBlockPlaylistImportMutation'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { messageOf } from '../messageOf'
import { CampaignSiblingRow, siblingRows, siblingsOf } from '../siblingsOf'
import { useCampaignBlockFieldsCommand } from '../useCampaignBlockFieldsCommand'
import { useCampaignBlockSoftDelete } from '../useCampaignBlockSoftDelete'
import { useCampaignCommand } from '../useCampaignCommand'

type CampaignCarouselVideoInput =
  CampaignBlockUpdateInput<'CampaignVideoCarouselBlock'>

export interface CampaignCarouselCommand {
  /** Watch expansion of a pasted Watch link, as one Command. */
  /**
   * Expand a Watch video (a series or collection) into the carousel; its
   * label, title and description replace the carousel's eyebrow, title and
   * description (undo restores them).
   */
  setWatchVideo: (
    carousel: CampaignVideoCarouselBlock,
    url: string,
    text?: WatchVideoText
  ) => void
  /** Explicit mode (`videoId: null`), as one Command; the items stay. */
  clearWatchVideo: (carousel: CampaignVideoCarouselBlock) => void
  /** One explicit item from a YouTube link or a Mux upload, as one Command. */
  addItem: (
    carousel: CampaignVideoCarouselBlock,
    pick: CampaignVideoPick
  ) => void
  /** The first 12 videos of a YouTube playlist as explicit items, as one Command. */
  importPlaylist: (carousel: CampaignVideoCarouselBlock, url: string) => void
  /** The API's message, verbatim, when the last change failed. */
  error?: string
}

/** The expanded Watch video's text, written over the carousel's own: its label as the eyebrow, its title and description. */
export interface WatchVideoText {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
}

/** Trim text to a cap, as the API counts it (code points), with an ellipsis when cut. */
export function fitCampaignText(value: string, cap: number): string {
  const points = [...value.trim()]
  if (points.length <= cap) return points.join('')
  return `${points
    .slice(0, cap - 1)
    .join('')
    .trimEnd()}…`
}

/** The carousel's children once `removed` are gone, renumbered: what their deletes return. */
function remainingChildren(
  blocks: CampaignBlock[],
  carouselId: string,
  removed: Set<string>
): CampaignSiblingRow[] {
  const anchor = blocks.find(
    (block) => block.parentBlockId === carouselId && block.parentOrder != null
  )
  if (anchor == null) return []
  return siblingRows(
    [anchor, ...siblingsOf(blocks, anchor)]
      .filter((block) => !removed.has(block.id))
      .sort((a, b) => (a.parentOrder ?? 0) - (b.parentOrder ?? 0))
  )
}

/**
 * The Video Carousel's Commands. The nullable `videoId` is the mode: a
 * Watch link sets it (Watch expansion) and undo writes the previous id
 * back; clearing it switches to explicit mode. Adding items — one YouTube
 * video or upload, or a playlist's first 12 — is one Command that also
 * switches an expanded carousel to explicit mode so the items show. The
 * items are created once; undo soft-deletes them (and restores the Watch
 * video it replaced), redo restores the same rows. An undo pressed while the
 * create is in flight waits for it, so it removes the items once they land.
 * A refused create writes the Watch video back and shows the API's message;
 * its undo sends nothing and redo runs the create again. The Campaign
 * Command module reports a refused undo or redo in the snackbar.
 */
export function useCampaignCarouselCommand(): CampaignCarouselCommand {
  const { addCampaignCommand } = useCampaignCommand()
  const { campaign } = useCampaignEditor()
  const blocksRef = useRef(campaign.blocks)
  blocksRef.current = campaign.blocks
  const fieldsCommand = useCampaignBlockFieldsCommand()
  const { update, previousFields } = useCampaignBlockUpdateMutation()
  const createItem = useCampaignCarouselItemCreateMutation(campaign.id)
  const createPlaylist = useCampaignVideoCarouselBlockPlaylistImportMutation(
    campaign.id
  )
  const { softDelete, restore } = useCampaignBlockSoftDelete()
  const [itemError, setItemError] = useState<string>()

  function setWatchVideo(
    carousel: CampaignVideoCarouselBlock,
    url: string,
    text?: WatchVideoText
  ): void {
    setItemError(undefined)
    const input: CampaignCarouselVideoInput = { url }
    for (const field of ['eyebrow', 'title', 'description'] as const) {
      const value = text?.[field]
      if (value == null || value.trim() === '') continue
      input[field] = fitCampaignText(
        value,
        campaignTextCap('CampaignVideoCarouselBlock', field)
      )
    }
    fieldsCommand.addFields(carousel, input)
  }

  function clearWatchVideo(carousel: CampaignVideoCarouselBlock): void {
    setItemError(undefined)
    fieldsCommand.addFields(carousel, { videoId: null })
  }

  function addItems(
    carousel: CampaignVideoCarouselBlock,
    create: (target: CampaignVideoCarouselBlock) => Promise<CampaignBlock[]>
  ): void {
    fieldsCommand.clearError()
    setItemError(undefined)
    const explicit: CampaignCarouselVideoInput = { videoId: null }
    const previous = previousFields(carousel, explicit)
    const wasExpanded = previous.videoId != null
    let created: CampaignBlock[] = []

    async function removeItems(): Promise<void> {
      const removed = new Set<string>()
      for (const block of created) {
        removed.add(block.id)
        await softDelete(
          block,
          remainingChildren(blocksRef.current, carousel.id, removed)
        )
      }
    }

    async function restoreItems(): Promise<void> {
      await Promise.all(
        created.map(async (block) => await restore(block, [block]))
      )
    }

    addCampaignCommand({
      async execute() {
        if (wasExpanded) await update(carousel, explicit)
        try {
          created = await create(carousel)
        } catch (error) {
          // The create's refusal is the one to report, not this write's.
          if (wasExpanded)
            await update(carousel, previous).catch(() => undefined)
          throw error
        }
      },
      async undo() {
        await removeItems()
        if (wasExpanded) await update(carousel, previous)
      },
      async redo() {
        if (wasExpanded) await update(carousel, explicit)
        await restoreItems()
      }
    }).catch((error: unknown) => setItemError(messageOf(error)))
  }

  function addItem(
    carousel: CampaignVideoCarouselBlock,
    pick: CampaignVideoPick
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
    error: itemError ?? fieldsCommand.error
  }
}

import { RefObject, useEffect } from 'react'

import VideoJsPlayer from '../../utils/videoJsTypes'

// Space kept between captions and the controls around them
const CONTROLS_GAP = 8

// Set on the player while the offsets apply; the player styles key off it
export const CAPTIONS_ABOVE_CONTROLS_CLASS = 'captions-above-controls'

interface CaptionOffsets {
  bottom: number
  inline: number
}

/**
 * Keeps captions clear of the mobile controls. In landscape they sit level
 * with the row of time, subtitles, settings and fullscreen, between the time
 * and the buttons; in portrait they sit above the controls. The offsets are
 * stored as `--caption-bottom` and `--caption-inline` on the player, with
 * `CAPTIONS_ABOVE_CONTROLS_CLASS`, where the styles for both video.js captions
 * and Safari's native captions read them.
 * @param player - The video.js player showing the captions
 * @param buttonRowRef - The mobile controls row with the time and buttons
 */
export function useCaptionOffset(
  player: VideoJsPlayer,
  buttonRowRef: RefObject<HTMLElement | null>
): void {
  useEffect(() => {
    const playerEl = player.el() as HTMLElement | null
    const buttonRow = buttonRowRef.current
    if (playerEl == null || buttonRow == null) return

    const getCaptionOffsets = (): CaptionOffsets | null => {
      // The mobile controls are not displayed from the md breakpoint up
      if (buttonRow.offsetParent == null) return null

      const playerRect = playerEl.getBoundingClientRect()
      const row = buttonRow.getBoundingClientRect()
      const isLandscape = window.matchMedia('(orientation: landscape)').matches
      if (!isLandscape)
        return {
          bottom: playerRect.bottom - row.top + CONTROLS_GAP,
          inline: 0
        }

      // Centred between the time on the left and the buttons on the right
      const time =
        buttonRow.children.length > 1 ? buttonRow.firstElementChild : null
      const buttons = buttonRow.lastElementChild
      const timeInset =
        time == null ? 0 : time.getBoundingClientRect().right - playerRect.left
      const buttonsInset =
        buttons == null
          ? 0
          : playerRect.right - buttons.getBoundingClientRect().left
      return {
        bottom: playerRect.bottom - row.bottom,
        inline: Math.max(timeInset, buttonsInset) + CONTROLS_GAP
      }
    }

    // Starts as not applied, so a player without mobile controls is untouched
    let currentOffsets = `${null} ${null}`
    const updateOffsets = (): void => {
      const offsets = getCaptionOffsets()
      const bottom =
        offsets == null ? null : `${Math.max(Math.round(offsets.bottom), 0)}px`
      const inline =
        offsets == null ? null : `${Math.max(Math.round(offsets.inline), 0)}px`
      if (`${bottom} ${inline}` === currentOffsets) return
      currentOffsets = `${bottom} ${inline}`

      if (bottom == null || inline == null) {
        playerEl.classList.remove(CAPTIONS_ABOVE_CONTROLS_CLASS)
        playerEl.style.removeProperty('--caption-bottom')
        playerEl.style.removeProperty('--caption-inline')
      } else {
        playerEl.classList.add(CAPTIONS_ABOVE_CONTROLS_CLASS)
        playerEl.style.setProperty('--caption-bottom', bottom)
        playerEl.style.setProperty('--caption-inline', inline)
      }
      // video.js lays out its captions in px, so redraw them in the new space
      const textTrackDisplay = player.getChild('TextTrackDisplay')
      if (
        textTrackDisplay != null &&
        'updateDisplay' in textTrackDisplay &&
        typeof textTrackDisplay.updateDisplay === 'function'
      )
        textTrackDisplay.updateDisplay()
    }

    updateOffsets()
    window.addEventListener('resize', updateOffsets)
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(updateOffsets)
    resizeObserver?.observe(playerEl)
    resizeObserver?.observe(buttonRow)
    return () => {
      window.removeEventListener('resize', updateOffsets)
      resizeObserver?.disconnect()
      playerEl.classList.remove(CAPTIONS_ABOVE_CONTROLS_CLASS)
      playerEl.style.removeProperty('--caption-bottom')
      playerEl.style.removeProperty('--caption-inline')
    }
  }, [player, buttonRowRef])
}

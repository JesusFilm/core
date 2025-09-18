import { ReactElement, useEffect, useMemo, useState } from 'react'
import type Player from 'video.js/dist/types/player'

interface HeroSubtitleOverlayProps {
  player: (Player & { textTracks?: () => TextTrackList }) | null
  subtitleLanguageId?: string | null
  visible: boolean
}

interface CueEvent extends Event {
  track?: TextTrack
}

const STRIP_TAGS_REGEX = /<[^>]+>/g

function extractLinesFromCue(cue: TextTrackCue): string[] {
  if (cue == null) return []

  const text = 'text' in cue ? cue.text : ''
  if (text == null) return []

  return text
    .replace(STRIP_TAGS_REGEX, ' ')
    .replace(/&nbsp;/gi, ' ')
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
}

export function HeroSubtitleOverlay({
  player,
  subtitleLanguageId,
  visible
}: HeroSubtitleOverlayProps): ReactElement | null {
  const [lines, setLines] = useState<string[]>([])

  const shouldRender = visible && lines.length > 0

  const updateFromActiveTrack = useMemo(() => {
    return () => {
      if (!visible || player == null) {
        setLines([])
        return
      }

      const textTracks = player.textTracks?.()
      if (textTracks == null) {
        setLines([])
        return
      }

      let activeTrack: TextTrack | null = null

      for (let idx = 0; idx < textTracks.length; idx++) {
        const track = textTracks[idx]
        if (track.kind === 'subtitles' && track.mode === 'showing') {
          activeTrack = track
          break
        }
      }

      if (activeTrack == null) {
        setLines([])
        return
      }

      const { activeCues } = activeTrack
      if (activeCues == null || activeCues.length === 0) {
        setLines([])
        return
      }

      const nextLines: string[] = []
      for (let cueIndex = 0; cueIndex < activeCues.length; cueIndex++) {
        const cue = activeCues[cueIndex]
        nextLines.push(...extractLinesFromCue(cue))
      }

      setLines(nextLines)
    }
  }, [player, visible])

  useEffect(() => {
    if (!visible || player == null) {
      setLines([])
      return
    }

    const textTracks = player.textTracks?.()
    if (textTracks == null) {
      setLines([])
      return
    }

    const cleanupListeners: Array<() => void> = []

    const handleCueChange = () => {
      updateFromActiveTrack()
    }

    const handleAddTrack = (event: Event) => {
      const track = (event as CueEvent).track
      if (track?.kind === 'subtitles') {
        track.addEventListener('cuechange', handleCueChange)
        cleanupListeners.push(() => {
          track.removeEventListener('cuechange', handleCueChange)
        })
        updateFromActiveTrack()
      }
    }

    for (let idx = 0; idx < textTracks.length; idx++) {
      const track = textTracks[idx]
      if (track.kind === 'subtitles') {
        track.addEventListener('cuechange', handleCueChange)
        cleanupListeners.push(() => {
          track.removeEventListener('cuechange', handleCueChange)
        })
      }
    }

    textTracks.addEventListener?.('addtrack', handleAddTrack)
    cleanupListeners.push(() => {
      textTracks.removeEventListener?.('addtrack', handleAddTrack)
    })

    const handleTextTrackChange = () => {
      updateFromActiveTrack()
    }

    player.on?.('texttrackchange', handleTextTrackChange)
    cleanupListeners.push(() => {
      player.off?.('texttrackchange', handleTextTrackChange)
    })

    updateFromActiveTrack()

    return () => {
      cleanupListeners.forEach((cleanup) => cleanup())
      setLines([])
    }
  }, [player, subtitleLanguageId, updateFromActiveTrack, visible])

  if (!shouldRender) return null

  return (
    <div
      className="pointer-events-none absolute inset-x-0 bottom-[12%] flex justify-center px-6"
      aria-live="polite"
    >
      <div className="flex max-w-4xl flex-col gap-3 text-center text-white">
        {lines.map((line, index) => (
          <span
            key={`${index}-${line}`}
            className="mx-auto rounded-3xl bg-black/70 px-6 py-4 text-2xl font-semibold leading-tight tracking-wide md:text-3xl"
            style={{ textShadow: '0px 4px 18px rgba(0, 0, 0, 0.7)' }}
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  )
}

import { ReactElement, useEffect, useMemo, useState } from 'react'
import type Player from 'video.js/dist/types/player'

interface HeroSubtitleOverlayProps {
  player: (Player & { textTracks?: () => TextTrackList }) | null
  subtitleLanguageId?: string | null
  visible: boolean
}

interface SubtitleSegment {
  id: string
  text: string
  durationMs: number
}

interface CueEvent extends Event {
  track?: TextTrack
}

const STRIP_TAGS_REGEX = /<[^>]+>/g

function splitLineIntoSegments(line: string, maxWords: number): string[] {
  const words = line.split(/\s+/).filter(Boolean)
  if (words.length === 0) return []

  const segments: string[] = []
  for (let idx = 0; idx < words.length; idx += maxWords) {
    segments.push(words.slice(idx, idx + maxWords).join(' '))
  }
  return segments
}

function extractSegmentsFromCue(
  cue: TextTrackCue,
  cueIndex: number,
  timestamp: number
): SubtitleSegment[] {
  if (cue == null) return []

  const text = 'text' in cue ? cue.text : ''
  if (text == null) return []

  const rawLines = text
    .replace(STRIP_TAGS_REGEX, ' ')
    .replace(/&nbsp;/gi, ' ')
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  const segmentsPerCue = rawLines.flatMap((line) =>
    splitLineIntoSegments(line, 8)
  )

  const cueWithTiming = cue as Partial<{ startTime: number; endTime: number }>
  const startTime = typeof cueWithTiming.startTime === 'number' ? cueWithTiming.startTime : 0
  const endTime = typeof cueWithTiming.endTime === 'number' ? cueWithTiming.endTime : 0
  const cueDurationMs = Math.max((endTime - startTime) * 1000, 0)

  const segmentDurationMs = Math.min(
    Math.max(
      cueDurationMs > 0
        ? cueDurationMs / Math.max(segmentsPerCue.length, 1)
        : 2000,
      1200
    ),
    4500
  )

  return segmentsPerCue.map((content, segmentIndex) => ({
    id: `${timestamp}-${cueIndex}-${segmentIndex}`,
    text: content,
    durationMs: segmentDurationMs
  }))
}

export function HeroSubtitleOverlay({
  player,
  subtitleLanguageId,
  visible
}: HeroSubtitleOverlayProps): ReactElement | null {
  const [segments, setSegments] = useState<SubtitleSegment[]>([])
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)

  const shouldRender = visible && segments.length > 0

  const updateFromActiveTrack = useMemo(() => {
    return () => {
      if (!visible || player == null) {
        setSegments([])
        setCurrentSegmentIndex(0)
        return
      }

      const textTracks = player.textTracks?.()
      if (textTracks == null) {
        setSegments([])
        setCurrentSegmentIndex(0)
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
        setSegments([])
        setCurrentSegmentIndex(0)
        return
      }

      const { activeCues } = activeTrack
      if (activeCues == null || activeCues.length === 0) {
        setSegments([])
        setCurrentSegmentIndex(0)
        return
      }

      const nextSegments: SubtitleSegment[] = []
      const timestamp = Date.now()
      for (let cueIndex = 0; cueIndex < activeCues.length; cueIndex++) {
        const cue = activeCues[cueIndex]
        nextSegments.push(...extractSegmentsFromCue(cue, cueIndex, timestamp))
      }

      setSegments(nextSegments)
      setCurrentSegmentIndex(0)
    }
  }, [player, visible])

  useEffect(() => {
    if (!visible || player == null) {
      setSegments([])
      setCurrentSegmentIndex(0)
      return
    }

    const textTracks = player.textTracks?.()
    if (textTracks == null) {
      setSegments([])
      setCurrentSegmentIndex(0)
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
      setSegments([])
      setCurrentSegmentIndex(0)
    }
  }, [player, subtitleLanguageId, updateFromActiveTrack, visible])

  useEffect(() => {
    if (!visible) return
    if (segments.length <= 1) return

    const current = segments[currentSegmentIndex]
    if (current == null) return

    const timeout = window.setTimeout(() => {
      setCurrentSegmentIndex((previous) =>
        previous >= segments.length - 1 ? previous : previous + 1
      )
    }, current.durationMs)

    return () => window.clearTimeout(timeout)
  }, [currentSegmentIndex, segments, visible])

  useEffect(() => {
    if (player == null) return

    const element = player.el() as HTMLElement | null
    if (element == null) return

    element.classList.add('hero-hide-native-subtitles')

    return () => {
      element.classList.remove('hero-hide-native-subtitles')
    }
  }, [player])

  if (!shouldRender) return null

  return (
    <>
      <div
        className="pointer-events-none absolute z-2 inset-x-0 bottom-[26px] flex justify-center px-6 font-mono"
        aria-live="polite"
      >
        <div className="flex max-w-4xl flex-col gap-3 text-center text-white">
          {segments[currentSegmentIndex] != null && (
            <span
              key={segments[currentSegmentIndex].id}
              className="hero-subtitle-line mx-auto px-6 py-4 text-2xl font-semibold leading-tight  tracking-wider md:text-xl text-shadow-lg"

            >
              {segments[currentSegmentIndex].text}
            </span>
          )}
        </div>
      </div>
      <style jsx global>{`
        @keyframes heroSubtitleFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-subtitle-line {
          display: inline-block;
          animation: heroSubtitleFadeIn 280ms ease-out forwards;
          will-change: transform, opacity;
        }

        .hero-hide-native-subtitles .vjs-text-track-display {
          display: none !important;
        }
      `}</style>
    </>
  )
}

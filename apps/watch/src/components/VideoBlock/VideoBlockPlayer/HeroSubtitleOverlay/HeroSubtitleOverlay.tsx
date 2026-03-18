import { ReactElement, useEffect, useState } from 'react'
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

  const text = 'text' in cue ? (cue as any).text : ''
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
  const startTime =
    typeof cueWithTiming.startTime === 'number' ? cueWithTiming.startTime : 0
  const endTime =
    typeof cueWithTiming.endTime === 'number' ? cueWithTiming.endTime : 0
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

// styles for this component appear in the globals.css file
export function HeroSubtitleOverlay({
  player,
  subtitleLanguageId,
  visible
}: HeroSubtitleOverlayProps): ReactElement | null {
  const [segments, setSegments] = useState<SubtitleSegment[]>([])
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0)

  const shouldRender = visible && segments.length > 0

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

    let lastUpdateTime = 0

    const updateSegmentsFromTrack = () => {
      if (!visible || player == null) {
        setSegments([])
        setCurrentSegmentIndex(0)
        return
      }

      const currentTextTracks = player.textTracks?.()
      if (currentTextTracks == null) {
        setSegments([])
        setCurrentSegmentIndex(0)
        return
      }

      let activeTrack: TextTrack | null = null

      for (let idx = 0; idx < currentTextTracks.length; idx++) {
        const track = currentTextTracks[idx]
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

      // Throttle updates to prevent excessive re-renders
      const now = Date.now()
      if (now - lastUpdateTime < 100) return // Minimum 100ms between updates
      lastUpdateTime = now

      const nextSegments: SubtitleSegment[] = []
      const timestamp = now
      for (let cueIndex = 0; cueIndex < activeCues.length; cueIndex++) {
        const cue = activeCues[cueIndex]
        nextSegments.push(...extractSegmentsFromCue(cue, cueIndex, timestamp))
      }

      setSegments(nextSegments)
      setCurrentSegmentIndex(0)
    }

    const handleCueChange = () => {
      updateSegmentsFromTrack()
    }

    const handleAddTrack = (event: Event) => {
      const track = (event as CueEvent).track
      if (track?.kind === 'subtitles') {
        track.addEventListener('cuechange', handleCueChange)
        cleanupListeners.push(() => {
          track.removeEventListener('cuechange', handleCueChange)
        })
        updateSegmentsFromTrack()
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
      updateSegmentsFromTrack()
    }

    player.on?.('texttrackchange', handleTextTrackChange)
    cleanupListeners.push(() => {
      player.off?.('texttrackchange', handleTextTrackChange)
    })

    updateSegmentsFromTrack()

    return () => {
      cleanupListeners.forEach((cleanup) => cleanup())
      setSegments([])
      setCurrentSegmentIndex(0)
    }
  }, [player, subtitleLanguageId, visible])

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
    <div
      className="pointer-events-none absolute inset-x-0 top-1/2 z-2 flex min-h-[120px] -translate-y-1/2 justify-center px-6 md:top-auto md:bottom-[0px] md:translate-y-0"
      aria-live="polite"
    >
      <div className="flex max-w-4xl flex-col justify-center text-center text-white md:-mr-20 md:max-w-[400px] lg:max-w-none">
        {segments[currentSegmentIndex] != null && (
          <span
            key={segments[currentSegmentIndex].id}
            className="hero-subtitle-line mx-auto px-6 py-4 text-2xl leading-tight font-bold tracking-wider uppercase text-shadow-lg md:font-mono md:text-lg md:font-semibold md:normal-case lg:text-xl"
          >
            {segments[currentSegmentIndex].text}
          </span>
        )}
      </div>
    </div>
  )
}

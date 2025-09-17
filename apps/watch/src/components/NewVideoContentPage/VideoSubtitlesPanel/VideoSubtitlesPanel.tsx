import { useQuery } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useMemo, useState } from 'react'

import { ResultOf, VariablesOf } from '@core/shared/gql'

import { useVideo } from '../../../libs/videoContext'
import { useWatch } from '../../../libs/watchContext'
import { GET_SUBTITLES } from '../../../libs/watchContext/useSubtitleUpdate/useSubtitleUpdate'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../Select'

interface SubtitleCue {
  start: number
  end: number
  text: string
}

type GetSubtitlesQuery = ResultOf<typeof GET_SUBTITLES>
type GetSubtitlesVariables = VariablesOf<typeof GET_SUBTITLES>

type SubtitleOption = NonNullable<
  NonNullable<NonNullable<GetSubtitlesQuery['video']>['variant']>['subtitle']
>[number]

function timeStringToSeconds(value: string): number {
  const sanitized = value.replace(',', '.').trim()
  const parts = sanitized.split(':')

  if (parts.length === 0 || parts.some((part) => part.length === 0)) return NaN

  let hours = 0
  let minutes = 0
  let seconds = 0

  if (parts.length === 3) {
    hours = Number(parts[0])
    minutes = Number(parts[1])
    seconds = Number(parts[2])
  } else if (parts.length === 2) {
    minutes = Number(parts[0])
    seconds = Number(parts[1])
  } else if (parts.length === 1) {
    seconds = Number(parts[0])
  } else {
    return NaN
  }

  if ([hours, minutes, seconds].some((part) => Number.isNaN(part))) return NaN

  return hours * 3600 + minutes * 60 + seconds
}

function formatTimestamp(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  const paddedMinutes =
    hours > 0 ? String(minutes).padStart(2, '0') : String(minutes)
  const paddedSeconds = String(remainingSeconds).padStart(2, '0')

  return hours > 0
    ? `${hours}:${paddedMinutes}:${paddedSeconds}`
    : `${minutes}:${paddedSeconds}`
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function parseWebVtt(content: string): SubtitleCue[] {
  const cleaned = content.replace(/^\uFEFF/, '').replace(/\r/g, '')
  const sections = cleaned.split(/\n\s*\n/)
  const cues: SubtitleCue[] = []

  sections.forEach((section) => {
    const trimmedSection = section.trim()

    if (
      trimmedSection.length === 0 ||
      trimmedSection.startsWith('WEBVTT') ||
      trimmedSection.startsWith('NOTE') ||
      trimmedSection.startsWith('STYLE') ||
      trimmedSection.startsWith('REGION')
    )
      return

    const lines = trimmedSection.split('\n')
    const timingIndex = lines.findIndex((line) => line.includes('-->'))

    if (timingIndex === -1) return

    const timingLine = lines[timingIndex]
    const [rawStart, rawEndWithSettings] = timingLine.split('-->')

    if (rawStart == null || rawEndWithSettings == null) return

    const start = timeStringToSeconds(rawStart)
    const end = timeStringToSeconds(
      rawEndWithSettings.trim().split(/\s+/)[0] ?? ''
    )

    if (!Number.isFinite(start) || !Number.isFinite(end)) return

    const textLines = lines.slice(timingIndex + 1)
    const text = textLines
      .map((line) => line.replace(/<[^>]+>/g, '').trim())
      .filter(Boolean)
      .map(decodeHtmlEntities)
      .join(' ')

    if (text.length === 0) return

    cues.push({ start, end, text })
  })

  return cues
}

export function VideoSubtitlesPanel(): ReactElement | null {
  const { t } = useTranslation('apps-watch')
  const { variant } = useVideo()
  const {
    state: { subtitleLanguageId }
  } = useWatch()

  const subtitleCount = variant?.subtitleCount ?? 0
  const variantSlug = variant?.slug

  if (variantSlug == null || subtitleCount < 1) return null

  const {
    data,
    loading: queryLoading,
    error: queryError
  } = useQuery<GetSubtitlesQuery, GetSubtitlesVariables>(GET_SUBTITLES, {
    variables: { id: variantSlug },
    skip: variantSlug == null,
    fetchPolicy: 'cache-first'
  })

  const subtitleOptions = useMemo(() => {
    const subtitles = data?.video?.variant?.subtitle

    if (subtitles == null) return []

    return subtitles.filter(
      (subtitle): subtitle is SubtitleOption =>
        subtitle?.language?.id != null &&
        subtitle.value != null &&
        subtitle.value !== ''
    )
  }, [data])

  const [activeLanguageId, setActiveLanguageId] = useState<string | undefined>(
    subtitleLanguageId ?? undefined
  )
  const [transcripts, setTranscripts] = useState<Record<string, SubtitleCue[]>>(
    {}
  )
  const [loadingTranscript, setLoadingTranscript] = useState(false)
  const [transcriptError, setTranscriptError] = useState(false)

  useEffect(() => {
    if (subtitleOptions.length === 0) {
      setActiveLanguageId(undefined)
      return
    }

    const contextLanguageAvailable =
      subtitleLanguageId != null &&
      subtitleOptions.some(
        (option) => option.language?.id === subtitleLanguageId
      )

    if (contextLanguageAvailable) {
      setActiveLanguageId((current) =>
        current === subtitleLanguageId ? current : subtitleLanguageId
      )
      return
    }

    setActiveLanguageId((current) => {
      if (
        current != null &&
        subtitleOptions.some((option) => option.language?.id === current)
      ) {
        return current
      }
      return subtitleOptions[0]?.language?.id
    })
  }, [subtitleLanguageId, subtitleOptions])

  const selectedSubtitle = useMemo(
    () =>
      subtitleOptions.find(
        (option) => option.language?.id === activeLanguageId
      ) ?? subtitleOptions[0],
    [activeLanguageId, subtitleOptions]
  )

  useEffect(() => {
    const languageId = selectedSubtitle?.language?.id
    const url = selectedSubtitle?.value

    if (languageId == null || url == null || url === '') {
      setTranscriptError(false)
      return
    }

    setTranscriptError(false)

    if (transcripts[languageId] != null) return

    let isActive = true
    setLoadingTranscript(true)

    void (async () => {
      try {
        const response = await fetch(url)

        if (!response.ok) throw new Error('Failed to load subtitles')

        const text = await response.text()

        if (!isActive) return

        const cues = parseWebVtt(text)

        setTranscripts((previous) => ({ ...previous, [languageId]: cues }))
      } catch (error) {
        if (isActive) setTranscriptError(true)
      } finally {
        if (isActive) setLoadingTranscript(false)
      }
    })()

    return () => {
      isActive = false
    }
  }, [selectedSubtitle, transcripts])

  const selectedLanguageName = selectedSubtitle?.language?.name?.[0]?.value
  const cues =
    activeLanguageId != null ? transcripts[activeLanguageId] : undefined
  const isLoading = queryLoading || loadingTranscript

  return (
    <section
      data-testid="VideoSubtitlesPanel"
      className="flex flex-col gap-6"
      aria-labelledby="video-subtitles-heading"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <h3
          id="video-subtitles-heading"
          className="text-sm xl:text-base 2xl:text-lg font-semibold tracking-wider uppercase text-red-100/70"
        >
          {t('Subtitles')}
        </h3>
        {activeLanguageId != null && subtitleOptions.length > 0 && (
          <Select value={activeLanguageId} onValueChange={setActiveLanguageId}>
            <SelectTrigger
              size="sm"
              data-testid="SubtitleLanguageSelectTrigger"
              aria-label={t('Subtitle language')}
              className="bg-white/10 border border-white/10 text-white font-semibold uppercase tracking-wider"
            >
              <SelectValue>
                <span className="text-xs xl:text-sm">
                  {selectedLanguageName ?? t('Subtitle language')}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {subtitleOptions.map((option) => (
                <SelectItem
                  key={option.language?.id ?? option.value}
                  value={option.language?.id ?? ''}
                >
                  {option.language?.name?.[0]?.value ??
                    option.language?.id ??
                    ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="rounded-3xl bg-white/5 p-6 backdrop-blur">
        {queryError || transcriptError ? (
          <p className="text-sm text-red-100">
            {t('Unable to load subtitles.')}
          </p>
        ) : isLoading ? (
          <p className="text-sm text-white/70">{t('Loading subtitles...')}</p>
        ) : subtitleOptions.length === 0 ? (
          <p className="text-sm text-white/70">
            {t('No subtitles available for this video.')}
          </p>
        ) : cues != null && cues.length > 0 ? (
          <ol
            className="flex max-h-96 flex-col gap-4 overflow-y-auto pr-2"
            data-testid="VideoSubtitlesList"
          >
            {cues.map((cue) => (
              <li key={`${cue.start}-${cue.end}`} className="flex gap-4">
                <span className="min-w-[60px] text-xs font-semibold uppercase tracking-widest text-white/60">
                  {formatTimestamp(cue.start)}
                </span>
                <p className="text-sm leading-relaxed text-white/90">
                  {cue.text}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-white/70">
            {t('No subtitles available for this language.')}
          </p>
        )}
      </div>
    </section>
  )
}

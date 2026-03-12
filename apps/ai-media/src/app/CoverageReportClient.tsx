'use client'

import {
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  FilterX,
  Languages,
  RefreshCw,
  Sparkles,
  XCircle
} from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { LanguageGeoSelector } from './LanguageGeoSelector'

type CoverageStatus = 'human' | 'ai' | 'none'

type CoverageFilter = 'all' | CoverageStatus

type ReportType = 'subtitles' | 'voiceover' | 'meta'

type MetaCompleteness = {
  tags: boolean
  description: boolean
  title: boolean
  questions: boolean
  bibleQuotes: boolean
  completed: number
  total: number
}

type ClientVideo = {
  id: string
  title: string
  subtitleStatus: CoverageStatus
  voiceoverStatus: CoverageStatus
  metaStatus: CoverageStatus
  meta: MetaCompleteness
  thumbnailUrl: string | null
  watchUrl: string | null
}

type ClientCollection = {
  id: string
  title: string
  label: string
  labelDisplay: string
  publishedAt: string | null
  videos: ClientVideo[]
}

type LanguageOption = {
  id: string
  englishLabel: string
  nativeLabel: string
}

interface CoverageReportClientProps {
  gatewayConfigured: boolean
  errorMessage: string | null
  collections: ClientCollection[]
  selectedLanguageIds: string[]
  languageOptions: LanguageOption[]
}

type Mode = 'explore' | 'select'

type TranslationScope = 'missing' | 'all'

type HoveredVideoDetails = {
  video: ClientVideo
  collectionTitle: string
  status: CoverageStatus
}

const SESSION_MODE_KEY = 'ai-media-coverage-mode'
const SESSION_REPORT_KEY = 'ai-media-coverage-report'
const COLLECTION_CACHE_PREFIX = 'ai-media-collections'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000
const COLLECTIONS_PER_BATCH = 200

type CollectionsCacheMeta = {
  dataKey?: string
  lastUpdated: number
  expiresAt: number
}

/**
 * Builds a versioned cache key for a language payload.
 */
function buildCollectionCacheKey(languageId: string, timestamp: number): string {
  return `${COLLECTION_CACHE_PREFIX}-${languageId}-${timestamp}`
}

/**
 * Reads cached collections for a language if available and not expired.
 */
function readCachedCollections(languageId: string): ClientCollection[] | null {
  if (typeof window === 'undefined') return null
  try {
    const metaKey = `${COLLECTION_CACHE_PREFIX}-${languageId}`
    const rawMeta = window.sessionStorage.getItem(metaKey)
    if (!rawMeta) return null
    const meta = JSON.parse(rawMeta) as CollectionsCacheMeta
    if (!meta?.dataKey || !meta?.expiresAt) return null
    if (Date.now() > meta.expiresAt) {
      window.sessionStorage.removeItem(meta.dataKey)
      window.sessionStorage.removeItem(metaKey)
      return null
    }
    const rawData = window.sessionStorage.getItem(meta.dataKey)
    if (!rawData) return null
    const data = JSON.parse(rawData) as ClientCollection[]
    return Array.isArray(data) ? data : null
  } catch (error) {
    console.warn('Unable to read cached collections', error)
    return null
  }
}

/**
 * Reads cache metadata for a language if present.
 */
function readCacheMeta(languageId: string): CollectionsCacheMeta | null {
  if (typeof window === 'undefined') return null
  try {
    const metaKey = `${COLLECTION_CACHE_PREFIX}-${languageId}`
    const rawMeta = window.sessionStorage.getItem(metaKey)
    if (!rawMeta) return null
    const meta = JSON.parse(rawMeta) as CollectionsCacheMeta
    if (!meta?.expiresAt) return null
    return meta
  } catch (error) {
    console.warn('Unable to read cache metadata', error)
    return null
  }
}

/**
 * Writes collections to a language-specific cache entry with a 24h expiry.
 */
function writeCachedCollections(
  languageId: string,
  collections: ClientCollection[]
): CollectionsCacheMeta | null {
  if (typeof window === 'undefined') return
  try {
    const timestamp = Date.now()
    const dataKey = buildCollectionCacheKey(languageId, timestamp)
    const metaKey = `${COLLECTION_CACHE_PREFIX}-${languageId}`
    const meta: CollectionsCacheMeta = {
      dataKey,
      lastUpdated: timestamp,
      expiresAt: timestamp + CACHE_TTL_MS
    }
    window.sessionStorage.setItem(dataKey, JSON.stringify(collections))
    window.sessionStorage.setItem(metaKey, JSON.stringify(meta))
    return meta
  } catch (error) {
    console.warn('Unable to write cached collections', error)
    return null
  }
}

/**
 * Clears cached collections for a language.
 */
function clearCachedCollections(languageId: string): void {
  if (typeof window === 'undefined') return
  try {
    const metaKey = `${COLLECTION_CACHE_PREFIX}-${languageId}`
    const rawMeta = window.sessionStorage.getItem(metaKey)
    if (rawMeta) {
      const meta = JSON.parse(rawMeta) as CollectionsCacheMeta
      if (meta?.dataKey) {
        window.sessionStorage.removeItem(meta.dataKey)
      }
      window.sessionStorage.removeItem(metaKey)
    }
  } catch (error) {
    console.warn('Unable to clear cached collections', error)
  }
}

/**
 * Formats a duration in milliseconds into a short human-readable string.
 */
function formatDuration(ms: number): string {
  if (ms <= 0) return 'now'
  const totalMinutes = Math.ceil(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

/**
 * Formats a timestamp into a short "x ago" string.
 */
function formatTimeAgo(timestamp: number, now: number): string {
  const diff = Math.max(0, now - timestamp)
  const totalMinutes = Math.floor(diff / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) {
    return `${hours}h ${minutes}m ago`
  }
  if (totalMinutes > 0) {
    return `${totalMinutes}m ago`
  }
  return 'just now'
}

const REPORT_CONFIG: Record<
  ReportType,
  {
    label: string
    description: string
    ariaLabel: string
    hintExplore: string
    hintSelect?: string
    segmentLabels: Record<CoverageStatus, string>
    statusLabels: Record<CoverageStatus, string>
    legendLabels: Record<CoverageStatus, string>
  }
> = {
  subtitles: {
    label: 'Subtitles',
    description: 'Subtitle coverage for the selected language.',
    ariaLabel: 'Subtitle coverage',
    hintExplore: 'Explore subtitle coverage across video collections.',
    hintSelect: 'Select videos for translation.',
    segmentLabels: {
      human: 'Verified',
      ai: 'AI',
      none: 'None'
    },
    statusLabels: {
      human: 'Verified subtitles',
      ai: 'AI subtitles',
      none: 'None'
    },
    legendLabels: {
      human: 'Verified subtitles',
      ai: 'AI subtitles',
      none: 'None'
    }
  },
  voiceover: {
    label: 'Audio',
    description: 'Audio coverage for the selected language.',
    ariaLabel: 'Audio coverage',
    hintExplore: 'Explore audio coverage across video collections.',
    segmentLabels: {
      human: 'Verified',
      ai: 'AI',
      none: 'None'
    },
    statusLabels: {
      human: 'Verified audio',
      ai: 'AI voiceover',
      none: 'None'
    },
    legendLabels: {
      human: 'Verified audio',
      ai: 'AI voiceover',
      none: 'None'
    }
  },
  meta: {
    label: 'Meta',
    description: 'Metadata completeness for each video.',
    ariaLabel: 'Metadata coverage',
    hintExplore: 'Explore metadata completeness across video collections.',
    segmentLabels: {
      human: 'Complete',
      ai: 'Partial',
      none: 'None'
    },
    statusLabels: {
      human: 'Complete meta',
      ai: 'Partial meta',
      none: 'None'
    },
    legendLabels: {
      human: 'Complete meta',
      ai: 'Partial meta',
      none: 'None'
    }
  }
}

function useSessionMode(initial: Mode): [Mode, (value: Mode) => void] {
  const [mode, setMode] = useState<Mode>(initial)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.sessionStorage.getItem(SESSION_MODE_KEY)
      if (stored === 'explore' || stored === 'select') {
        setMode(stored)
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  const updateMode = useCallback((value: Mode) => {
    setMode(value)
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.setItem(SESSION_MODE_KEY, value)
    } catch {
      // ignore storage errors
    }
  }, [])

  return [mode, updateMode]
}

function useSessionReportType(
  initial: ReportType
): [ReportType, (value: ReportType) => void] {
  const [reportType, setReportType] = useState<ReportType>(initial)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.sessionStorage.getItem(SESSION_REPORT_KEY)
      if (stored === 'subtitles' || stored === 'voiceover' || stored === 'meta') {
        setReportType(stored)
      }
    } catch {
      // ignore storage errors
    }
  }, [])

  const updateReportType = useCallback((value: ReportType) => {
    setReportType(value)
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.setItem(SESSION_REPORT_KEY, value)
    } catch {
      // ignore storage errors
    }
  }, [])

  return [reportType, updateReportType]
}

function formatPercent(count: number, total: number): number {
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

function CoverageBar({
  counts,
  activeFilter,
  onFilter,
  onSelectStatus,
  mode,
  labels,
  ariaLabel
}: {
  counts: { human: number; ai: number; none: number }
  activeFilter: CoverageFilter
  onFilter: (filter: CoverageFilter) => void
  onSelectStatus?: (status: CoverageStatus) => void
  mode: Mode
  labels: Record<CoverageStatus, string>
  ariaLabel: string
}) {
  const total = counts.human + counts.ai + counts.none
  const segments: Array<{
    key: CoverageStatus
    label: string
    percent: number
    className: string
  }> = [
    {
      key: 'human',
      label: labels.human,
      percent: formatPercent(counts.human, total),
      className: 'stat-segment--human'
    },
    {
      key: 'ai',
      label: labels.ai,
      percent: formatPercent(counts.ai, total),
      className: 'stat-segment--ai'
    },
    {
      key: 'none',
      label: labels.none,
      percent: Math.max(0, 100 - formatPercent(counts.human, total) - formatPercent(counts.ai, total)),
      className: 'stat-segment--none'
    }
  ]

  const isExplore = mode === 'explore'
  const isInteractive = Boolean(onSelectStatus) || isExplore

  const handleSegmentClick = (status: CoverageStatus) => {
    if (isExplore) {
      onFilter(status)
      return
    }
    onSelectStatus?.(status)
  }

  const helperText = isExplore
    ? 'Click a segment to filter.'
    : 'Click a segment to filter.'

  return (
    <div className={`coverage-bar${isInteractive ? ' is-interactive' : ''}`}>
      <p className="coverage-hint">{helperText}</p>
      <div className="stat-bar" aria-label={ariaLabel}>
        {segments.map((segment) => (
          <button
            key={segment.key}
            type="button"
            className={`stat-segment ${segment.className}${
              activeFilter === segment.key ? ' is-active' : ''
            }`}
            style={{ width: `${segment.percent}%` }}
            title={`${segment.label} videos: ${counts[segment.key]}`}
            aria-pressed={activeFilter === segment.key}
            onClick={() => handleSegmentClick(segment.key)}
            disabled={!isInteractive}
          />
        ))}
      </div>
      <div className="stat-legend">
        {segments.map((segment) => (
          <button
            key={segment.key}
            type="button"
            className={`stat-legend-item stat-legend-item--${segment.key}${
              activeFilter === segment.key ? ' is-active' : ''
            }`}
            onClick={() => handleSegmentClick(segment.key)}
            disabled={!isInteractive}
          >
            {segment.label} {segment.percent}%
          </button>
        ))}
      </div>
    </div>
  )
}

function ReportTypeSelector({
  value,
  onChange
}: {
  value: ReportType
  onChange: (value: ReportType) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const shellRef = useRef<HTMLSpanElement | null>(null)
  const report = REPORT_CONFIG[value]
  const options = useMemo(
    () => Object.keys(REPORT_CONFIG) as ReportType[],
    []
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (!shellRef.current) return
      if (!shellRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <span className="control-select-shell" ref={shellRef}>
      <button
        type="button"
        className="control-value"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className="control-select-text">{report.label}</span>
        <span className="control-chevron" aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="control-dropdown" role="listbox" aria-label="Report type">
          {options.map((option) => {
            const optionConfig = REPORT_CONFIG[option]
            return (
              <button
                key={option}
                type="button"
                className={`control-option${
                  option === value ? ' is-selected' : ''
                }`}
                onClick={() => {
                  onChange(option)
                  setIsOpen(false)
                }}
                role="option"
                aria-selected={option === value}
              >
                <span className="control-option-english">
                  {optionConfig.label}
                </span>
                <span className="control-option-native">
                  {optionConfig.description}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </span>
  )
}

function ModeToggle({
  mode,
  onChange
}: {
  mode: Mode
  onChange: (mode: Mode) => void
}) {
  return (
    <div className="mode-toggle" role="group" aria-label="Interaction mode">
      <div className="mode-toggle-buttons">
        <button
          type="button"
          className={`mode-toggle-button${mode === 'explore' ? ' is-active' : ''}`}
          onClick={() => onChange('explore')}
          aria-pressed={mode === 'explore'}
        >
          <Eye className="icon" aria-hidden="true" />
          Explore
        </button>
        <button
          type="button"
          className={`mode-toggle-button${mode === 'select' ? ' is-active' : ''}`}
          onClick={() => onChange('select')}
          aria-pressed={mode === 'select'}
        >
          <CheckSquare className="icon" aria-hidden="true" />
          Translate
        </button>
      </div>
    </div>
  )
}

function Checkbox({
  checked,
  indeterminate,
  onChange,
  label,
  className
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
  label?: string
  className?: string
}) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(indeterminate)
    }
  }, [indeterminate])

  return (
    <label
      className={`checkbox${className ? ` ${className}` : ''}`}
      onClick={(event) => event.stopPropagation()}
    >
      <input
        ref={inputRef}
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span className="checkbox-box" aria-hidden="true" />
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  )
}

function getFittingLanguageCount(
  labels: string[],
  maxWidth: number,
  textFont: string
): number {
  if (labels.length <= 1) return labels.length
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) return labels.length

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) return labels.length

  context.font = textFont

  const measureText = (value: string) => context.measureText(value).width
  const pillPadding = 22
  const gapBeforePill = 8

  let usedWidth = 0
  let visibleCount = 0

  for (let index = 0; index < labels.length; index += 1) {
    const nextChunk = index === 0 ? labels[index] : `, ${labels[index]}`
    const nextChunkWidth = measureText(nextChunk)
    const remaining = labels.length - (index + 1)
    const morePillWidth =
      remaining > 0
        ? gapBeforePill + measureText(`+${remaining} more`) + pillPadding
        : 0

    if (usedWidth + nextChunkWidth + morePillWidth <= maxWidth || index === 0) {
      usedWidth += nextChunkWidth
      visibleCount = index + 1
      continue
    }
    break
  }

  return Math.max(1, visibleCount)
}

function TargetLanguageSummary({ labels }: { labels: string[] }) {
  const valuesRef = useRef<HTMLDivElement | null>(null)
  const [availableWidth, setAvailableWidth] = useState(0)
  const [textFont, setTextFont] = useState('')

  useEffect(() => {
    const element = valuesRef.current
    if (!element) return

    const updateMeasurements = () => {
      const computedStyle = window.getComputedStyle(element)
      setAvailableWidth(element.clientWidth)
      setTextFont(
        `${computedStyle.fontStyle} ${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`
      )
    }

    updateMeasurements()

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => updateMeasurements())
        : null

    resizeObserver?.observe(element)
    window.addEventListener('resize', updateMeasurements)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener('resize', updateMeasurements)
    }
  }, [])

  const visibleCount = useMemo(
    () => getFittingLanguageCount(labels, availableWidth, textFont),
    [labels, availableWidth, textFont]
  )
  const visibleLabels = labels.slice(0, visibleCount)
  const hiddenCount = Math.max(0, labels.length - visibleCount)

  return (
    <div className="translation-target translation-target--languages">
      <span className="translation-target-prefix">Target languages:</span>
      <div className="translation-target-values" ref={valuesRef}>
        <span className="translation-target-list">{visibleLabels.join(', ')}</span>
        {hiddenCount > 0 ? (
          <span className="translation-target-more">+{hiddenCount} more</span>
        ) : null}
      </div>
    </div>
  )
}

function SelectableVideoTile({
  mode,
  video,
  status,
  statusLabel,
  isSelected,
  onToggle,
  onHoverStart,
  onHoverEnd
}: {
  mode: Mode
  video: ClientVideo
  status: CoverageStatus
  statusLabel: string
  isSelected: boolean
  onToggle: () => void
  onHoverStart: () => void
  onHoverEnd: () => void
}) {
  const actionLabel =
    mode === 'explore'
      ? video.watchUrl
        ? 'Open video'
        : 'No action'
      : 'Select for translation'
  const title = `${actionLabel}: ${video.title} — ${statusLabel}`

  if (mode === 'explore') {
    if (video.watchUrl) {
      return (
        <a
          className={`tile tile--video tile--${status} tile--explore tile--link`}
          href={video.watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={title}
          onMouseEnter={onHoverStart}
          onMouseLeave={onHoverEnd}
          onFocus={onHoverStart}
          onBlur={onHoverEnd}
        >
          <span className="tile-checkbox" aria-hidden="true">
            <span className="tile-checkbox-box" />
          </span>
        </a>
      )
    }
    return (
      <span
        className={`tile tile--video tile--${status} tile--explore`}
        title={title}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onFocus={onHoverStart}
        onBlur={onHoverEnd}
      >
        <span className="tile-checkbox" aria-hidden="true">
          <span className="tile-checkbox-box" />
        </span>
      </span>
    )
  }

  return (
    <button
      type="button"
      className={`tile tile--video tile--${status} tile--select${
        isSelected ? ' is-selected' : ''
      }`}
      title={title}
      aria-pressed={isSelected}
      aria-label={`Select ${video.title}`}
      onClick={onToggle}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onFocus={onHoverStart}
      onBlur={onHoverEnd}
    >
      <span className="tile-checkbox" aria-hidden="true">
        <span className="tile-checkbox-box" aria-hidden="true" />
      </span>
      {isSelected && <Check className="tile-check-icon" aria-hidden="true" />}
    </button>
  )
}

function TranslationActionBar({
  selectedCount,
  languageLabels,
  scope,
  hoveredVideo,
  statusLabels,
  isInteractive,
  onScopeChange,
  onClear,
  onTranslate
}: {
  selectedCount: number
  languageLabels: string[]
  scope: TranslationScope
  hoveredVideo: HoveredVideoDetails | null
  statusLabels: Record<CoverageStatus, string>
  isInteractive: boolean
  onScopeChange: (scope: TranslationScope) => void
  onClear: () => void
  onTranslate: () => void
}) {
  const statusLabel = hoveredVideo ? statusLabels[hoveredVideo.status] : null

  return (
    <div
      className={`translation-bar${hoveredVideo ? ' is-detail' : ''}${
        isInteractive ? '' : ' is-explore'
      }`}
      role="status"
      aria-live="polite"
    >
      {isInteractive && (
        <div className="translation-view translation-view--selection">
          <div className="translation-summary">
            <div className="translation-count">
              {selectedCount} video{selectedCount === 1 ? '' : 's'} selected
            </div>
            <TargetLanguageSummary labels={languageLabels} />
          </div>
          <div className="translation-controls">
            <div className="translation-scope" role="group" aria-label="Translation scope">
              <button
                type="button"
                className={`translation-scope-button${
                  scope === 'missing' ? ' is-active' : ''
                }`}
                onClick={() => onScopeChange('missing')}
              >
                <FilterX className="icon" aria-hidden="true" />
                Translate missing only
              </button>
              <button
                type="button"
                className={`translation-scope-button${
                  scope === 'all' ? ' is-active' : ''
                }`}
                onClick={() => onScopeChange('all')}
              >
                <Sparkles className="icon" aria-hidden="true" />
                Translate all
              </button>
            </div>
            <button
              type="button"
              className="translation-primary"
              onClick={onTranslate}
            >
              <Languages className="icon" aria-hidden="true" />
              Translate Now
            </button>
            <button
              type="button"
              className="translation-secondary"
              onClick={onClear}
            >
              <XCircle className="icon" aria-hidden="true" />
              Cancel / Clear selection
            </button>
          </div>
        </div>
      )}
      <div className="translation-view translation-view--detail">
        {hoveredVideo ? (
          <div className="detail-media">
            {hoveredVideo.video.thumbnailUrl ? (
              <img
                src={hoveredVideo.video.thumbnailUrl}
                alt=""
                className="detail-thumb"
              />
            ) : (
              <div className="detail-thumb detail-thumb--empty" aria-hidden="true" />
            )}
            <div className="detail-info">
              <div className="translation-summary">
                <div className="translation-count">{hoveredVideo.video.title}</div>
                <div className="translation-target">{hoveredVideo.collectionTitle}</div>
              </div>
              <div className="translation-controls translation-controls--detail">
                <span
                  className={`detail-status detail-status--${hoveredVideo.status}`}
                >
                  {statusLabel ?? ''}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="translation-empty">
            Hover any item to see its details.
          </div>
        )}
      </div>
    </div>
  )
}

function MetaSummary({ meta }: { meta: MetaCompleteness }) {
  const fields = [
    { key: 'tags', label: 'Tags', present: meta.tags },
    { key: 'description', label: 'Description', present: meta.description },
    { key: 'title', label: 'Title', present: meta.title },
    { key: 'questions', label: 'Questions', present: meta.questions },
    { key: 'bibleQuotes', label: 'Bible quotes', present: meta.bibleQuotes }
  ]

  return (
    <div className="meta-summary" aria-label="Meta completeness">
      <span className="meta-score">
        Meta {meta.completed}/{meta.total}
      </span>
      {fields.map((field) => (
        <span
          key={field.key}
          className={`meta-pill${field.present ? ' is-complete' : ' is-missing'}`}
        >
          {field.label}
        </span>
      ))}
    </div>
  )
}

type CollectionCardProps = {
  collection: ClientCollection
  reportType: ReportType
  reportConfig: (typeof REPORT_CONFIG)[ReportType]
  interactionMode: Mode
  isSelectMode: boolean
  selectedSet: Set<string>
  collectionFilter: CoverageFilter
  isExpanded: boolean
  onToggleExpanded: (collectionId: string) => void
  onToggleCollection: (collection: ClientCollection) => void
  onFilterCollection: (collectionId: string, filter: CoverageFilter) => void
  onToggleVideo: (videoId: string) => void
  onSelectByStatusInCollection: (
    collection: ClientCollection,
    status: CoverageStatus
  ) => void
  onHoverVideo: (details: HoveredVideoDetails | null) => void
}

const CollectionCard = memo(function CollectionCard({
  collection,
  reportType,
  reportConfig,
  interactionMode,
  isSelectMode,
  selectedSet,
  collectionFilter,
  isExpanded,
  onToggleExpanded,
  onToggleCollection,
  onFilterCollection,
  onToggleVideo,
  onSelectByStatusInCollection,
  onHoverVideo
}: CollectionCardProps) {
  const getReportStatus = useCallback(
    (video: ClientVideo): CoverageStatus => {
      if (reportType === 'voiceover') return video.voiceoverStatus
      if (reportType === 'meta') return video.metaStatus
      return video.subtitleStatus
    },
    [reportType]
  )

  const total = collection.videos.length

  const counts = useMemo(() => {
    return collection.videos.reduce(
      (acc, video) => {
        acc[getReportStatus(video)] += 1
        return acc
      },
      { human: 0, ai: 0, none: 0 }
    )
  }, [collection.videos, getReportStatus])

  const filteredCollectionVideos = useMemo(() => {
    if (collectionFilter === 'all') return collection.videos
    return collection.videos.filter(
      (video) => getReportStatus(video) === collectionFilter
    )
  }, [collection.videos, collectionFilter, getReportStatus])

  const sortedVideos = useMemo(() => {
    return [...filteredCollectionVideos].sort((a, b) => {
      const order = { human: 0, ai: 1, none: 2 }
      return order[getReportStatus(a)] - order[getReportStatus(b)]
    })
  }, [filteredCollectionVideos, getReportStatus])

  const collectionSelectedCount = useMemo(
    () => collection.videos.filter((video) => selectedSet.has(video.id)).length,
    [collection.videos, selectedSet]
  )
  const collectionAllSelected =
    collection.videos.length > 0 &&
    collectionSelectedCount === collection.videos.length

  return (
    <section
      className="collection-card"
      key={collection.id}
      tabIndex={0}
      role="button"
      aria-expanded={isExpanded}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onToggleExpanded(collection.id)
        }
      }}
      onClick={(event) => {
        const target = event.target as HTMLElement
        if (target.closest('a, button, input, select, textarea')) return
        if (target.closest('.tile')) return
        onToggleExpanded(collection.id)
      }}
    >
      <div className="collection-header">
        <div className="collection-title-row">
          <div
            className="collection-title-block"
            role={isSelectMode ? 'button' : undefined}
            tabIndex={isSelectMode ? 0 : undefined}
            onClick={(event) => {
              if (!isSelectMode) return
              const target = event.target as HTMLElement
              if (target.closest('.checkbox')) return
              event.stopPropagation()
              onToggleCollection(collection)
            }}
            onKeyDown={(event) => {
              if (!isSelectMode) return
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                event.stopPropagation()
                onToggleCollection(collection)
              }
            }}
          >
            <div className="collection-title-line">
              <h2 className="collection-title">{collection.title}</h2>
              <span
                className={`collection-label collection-label--${collection.label}`}
                aria-label={`Group type: ${collection.labelDisplay}`}
              >
                {collection.labelDisplay}
              </span>
              {isSelectMode && (
                <Checkbox
                  checked={collectionAllSelected}
                  indeterminate={
                    collectionSelectedCount > 0 && !collectionAllSelected
                  }
                  onChange={() => onToggleCollection(collection)}
                  label=""
                  className="collection-checkbox"
                />
              )}
            </div>
            <div className="collection-meta-row">
              <p className="collection-meta">
                {total} video{total === 1 ? '' : 's'}
              </p>
            </div>
          </div>
        </div>
        <div className="collection-stats">
          <CoverageBar
            counts={counts}
            activeFilter={interactionMode === 'explore' ? collectionFilter : 'all'}
            onFilter={(nextFilter) => onFilterCollection(collection.id, nextFilter)}
            onSelectStatus={
              isSelectMode
                ? (status) => onSelectByStatusInCollection(collection, status)
                : undefined
            }
            mode={interactionMode}
            labels={reportConfig.segmentLabels}
            ariaLabel={reportConfig.ariaLabel}
          />
        </div>
      </div>
      <div className={`collection-divider${isExpanded ? ' is-open' : ''}`}>
        <button
          type="button"
          className="collection-toggle"
          onClick={(event) => {
            event.stopPropagation()
            onToggleExpanded(collection.id)
          }}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="icon" aria-hidden="true" />
              Hide details
            </>
          ) : (
            <>
              <ChevronDown className="icon" aria-hidden="true" />
              Show details
            </>
          )}
        </button>
      </div>
      <div className={`collection-details${isExpanded ? ' is-open' : ''}`}>
        {filteredCollectionVideos.map((video) => {
          const status = getReportStatus(video)
          const statusLabel = reportConfig.statusLabels[status]
          const tileStatusLabel =
            reportType === 'meta'
              ? `${statusLabel} (${video.meta.completed}/${video.meta.total})`
              : statusLabel
          const tileActionLabel = isSelectMode
            ? 'Select for translation'
            : video.watchUrl
              ? 'Open video'
              : 'No action'

          return (
            <div className="collection-detail-row" key={video.id}>
              {isSelectMode ? (
                <button
                  type="button"
                  className={`tile tile--video tile--${status} tile--select detail-tile${
                    selectedSet.has(video.id) ? ' is-selected' : ''
                  }`}
                  onClick={() => onToggleVideo(video.id)}
                  onMouseEnter={() =>
                    onHoverVideo({
                      video,
                      collectionTitle: collection.title,
                      status
                    })
                  }
                  onMouseLeave={() => onHoverVideo(null)}
                  onFocus={() =>
                    onHoverVideo({
                      video,
                      collectionTitle: collection.title,
                      status
                    })
                  }
                  onBlur={() => onHoverVideo(null)}
                  aria-pressed={selectedSet.has(video.id)}
                  aria-label={`Select ${video.title}`}
                  title={`${tileActionLabel}: ${video.title} — ${tileStatusLabel}`}
                >
                  <span className="tile-checkbox" aria-hidden="true">
                    <span className="tile-checkbox-box" aria-hidden="true" />
                  </span>
                  {selectedSet.has(video.id) && (
                    <Check className="tile-check-icon" aria-hidden="true" />
                  )}
                </button>
              ) : (
                <span
                  className={`tile tile--${status} detail-tile`}
                  aria-hidden="true"
                  title={`${tileActionLabel}: ${video.title} — ${tileStatusLabel}`}
                  onMouseEnter={() =>
                    onHoverVideo({
                      video,
                      collectionTitle: collection.title,
                      status
                    })
                  }
                  onMouseLeave={() => onHoverVideo(null)}
                  onFocus={() =>
                    onHoverVideo({
                      video,
                      collectionTitle: collection.title,
                      status
                    })
                  }
                  onBlur={() => onHoverVideo(null)}
                />
              )}
              <div className="detail-content">
                {video.watchUrl ? (
                  <a
                    href={video.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-link"
                  >
                    <span>{video.title}</span>
                    <ExternalLink className="detail-link-icon" aria-hidden="true" />
                  </a>
                ) : (
                  <span>{video.title}</span>
                )}
                {reportType === 'meta' && <MetaSummary meta={video.meta} />}
              </div>
            </div>
          )
        })}
      </div>
      <div
        className={`collection-tiles${
          isSelectMode ? ' collection-tiles--select' : ''
        }${isExpanded ? ' is-hidden' : ''}`}
      >
        {sortedVideos.map((video) => {
          const status = getReportStatus(video)
          const statusLabel = reportConfig.statusLabels[status]
          const tileStatusLabel =
            reportType === 'meta'
              ? `${statusLabel} (${video.meta.completed}/${video.meta.total})`
              : statusLabel

          return (
            <SelectableVideoTile
              key={video.id}
              mode={interactionMode}
              video={video}
              status={status}
              statusLabel={tileStatusLabel}
              isSelected={selectedSet.has(video.id)}
              onToggle={() => onToggleVideo(video.id)}
              onHoverStart={() =>
                onHoverVideo({
                  video,
                  collectionTitle: collection.title,
                  status
                })
              }
              onHoverEnd={() => onHoverVideo(null)}
            />
          )
        })}
        {filteredCollectionVideos.length === 0 && (
          <p className="collection-empty">No videos in this collection.</p>
        )}
      </div>
    </section>
  )
})

export function CoverageReportClient({
  gatewayConfigured,
  errorMessage,
  collections,
  selectedLanguageIds,
  languageOptions
}: CoverageReportClientProps) {
  const [reportType, setReportType] = useSessionReportType('subtitles')
  const [mode, setMode] = useSessionMode('explore')
  const [filter, setFilter] = useState<CoverageFilter>('all')
  const [cachedCollections, setCachedCollections] =
    useState<ClientCollection[]>(collections)
  const [cacheMeta, setCacheMeta] = useState<CollectionsCacheMeta | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [translationScope, setTranslationScope] = useState<TranslationScope>('missing')
  const [hoveredVideo, setHoveredVideo] = useState<HoveredVideoDetails | null>(
    null
  )
  const [expandedCollections, setExpandedCollections] = useState<string[]>([])
  const [collectionFilters, setCollectionFilters] = useState<
    Record<string, CoverageFilter>
  >({})
  const [visibleCount, setVisibleCount] = useState(COLLECTIONS_PER_BATCH)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const loadMoreTimeoutRef = useRef<number | null>(null)
  const languageKey = selectedLanguageIds.join(',')
  const previousLanguageRef = useRef(languageKey)

  const reportConfig = REPORT_CONFIG[reportType]
  const isSubtitleReport = reportType === 'subtitles'
  const isSelectMode = isSubtitleReport && mode === 'select'
  const interactionMode: Mode = isSelectMode ? 'select' : 'explore'

  useEffect(() => {
    const previousLanguageId = previousLanguageRef.current
    if (previousLanguageId !== languageKey) {
      clearCachedCollections(previousLanguageId)
      setCacheMeta(null)
      previousLanguageRef.current = languageKey
    }
  }, [languageKey])

  useEffect(() => {
    const cached = readCachedCollections(languageKey)
    const meta = readCacheMeta(languageKey)
    if (cached) {
      if (collections.length > cached.length) {
        setCachedCollections(collections)
        const nextMeta = writeCachedCollections(languageKey, collections)
        setCacheMeta(
          nextMeta ?? {
            lastUpdated: Date.now(),
            expiresAt: Date.now() + CACHE_TTL_MS
          }
        )
      } else {
        setCachedCollections(cached)
        setCacheMeta(
          meta ?? {
            lastUpdated: Date.now(),
            expiresAt: Date.now() + CACHE_TTL_MS
          }
        )
      }
      return
    }
    setCachedCollections(collections)
    const nextMeta = writeCachedCollections(languageKey, collections)
    setCacheMeta(
      nextMeta ?? {
        lastUpdated: Date.now(),
        expiresAt: Date.now() + CACHE_TTL_MS
      }
    )
  }, [collections, languageKey])

  useEffect(() => {
    return () => {
      if (loadMoreTimeoutRef.current) {
        window.clearTimeout(loadMoreTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (!cacheMeta?.expiresAt) return
    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 60000)
    return () => {
      window.clearInterval(interval)
    }
  }, [cacheMeta?.expiresAt])

  useEffect(() => {
    if (!isSelectMode && selectedIds.length > 0) {
      setSelectedIds([])
    }
    if (!isSubtitleReport && mode !== 'explore') {
      setMode('explore')
    }
  }, [isSelectMode, isSubtitleReport, mode, selectedIds.length, setMode])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const getReportStatus = (video: ClientVideo): CoverageStatus => {
    if (reportType === 'voiceover') return video.voiceoverStatus
    if (reportType === 'meta') return video.metaStatus
    return video.subtitleStatus
  }

  const selectedLabels = useMemo(() => {
    return selectedLanguageIds
      .map(
        (id) =>
          languageOptions.find((option) => option.id === id)?.englishLabel ?? id
      )
      .filter(Boolean)
  }, [languageOptions, selectedLanguageIds])
  const targetLanguageLabels =
    selectedLabels.length === 0
      ? [languageOptions[0]?.englishLabel ?? 'Unknown']
      : selectedLabels

  const overallCounts = useMemo(() => {
    return cachedCollections.reduce(
      (acc, collection) => {
        for (const video of collection.videos) {
          acc[getReportStatus(video)] += 1
        }
        return acc
      },
      { human: 0, ai: 0, none: 0 }
    )
  }, [cachedCollections, reportType])

  const effectiveFilter = interactionMode === 'explore' ? filter : 'all'

  const visibleCollections = useMemo(() => {
    if (effectiveFilter === 'all') return cachedCollections
    return cachedCollections
      .map((collection) => ({
        ...collection,
        videos: collection.videos.filter(
          (video) => getReportStatus(video) === effectiveFilter
        )
      }))
      .filter((collection) => collection.videos.length > 0)
  }, [cachedCollections, effectiveFilter, reportType])

  useEffect(() => {
    setVisibleCount(
      Math.min(COLLECTIONS_PER_BATCH, Math.max(visibleCollections.length, 0))
    )
  }, [effectiveFilter, reportType, visibleCollections.length])

  const pagedCollections = useMemo(
    () => visibleCollections.slice(0, visibleCount),
    [visibleCollections, visibleCount]
  )

  const statusIdMap = useMemo(() => {
    return cachedCollections.reduce(
      (acc, collection) => {
        for (const video of collection.videos) {
          acc[video.subtitleStatus].push(video.id)
        }
        return acc
      },
      { human: [] as string[], ai: [] as string[], none: [] as string[] }
    )
  }, [cachedCollections])

  const handleToggleVideo = useCallback((videoId: string) => {
    setSelectedIds((prev) =>
      prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId]
    )
  }, [])

  const handleToggleCollection = useCallback((collection: ClientCollection) => {
    const collectionIds = collection.videos.map((video) => video.id)
    const allSelected = collectionIds.every((id) => selectedSet.has(id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !collectionIds.includes(id)))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...collectionIds])))
    }
  }, [selectedSet])

  const handleSelectByStatus = useCallback((status: CoverageStatus) => {
    const statusIds = statusIdMap[status]
    const allSelected = statusIds.length > 0 && statusIds.every((id) => selectedSet.has(id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !statusIds.includes(id)))
      return
    }
    setSelectedIds((prev) => Array.from(new Set([...prev, ...statusIds])))
  }, [selectedSet, statusIdMap])

  const handleSelectByStatusInCollection = useCallback((
    collection: ClientCollection,
    status: CoverageStatus
  ) => {
    const statusIds = collection.videos
      .filter((video) => video.subtitleStatus === status)
      .map((video) => video.id)
    const allSelected =
      statusIds.length > 0 && statusIds.every((id) => selectedSet.has(id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !statusIds.includes(id)))
      return
    }
    setSelectedIds((prev) => Array.from(new Set([...prev, ...statusIds])))
  }, [selectedSet])

  const handleFilterCollection = useCallback((
    collectionId: string,
    nextFilter: CoverageFilter
  ) => {
    setCollectionFilters((prev) => ({
      ...prev,
      [collectionId]: nextFilter
    }))
  }, [])

  const handleClearSelection = useCallback(() => {
    setSelectedIds([])
  }, [])

  const handleTranslate = useCallback(() => {
    console.info('Translate videos', {
      selectedIds,
      translationScope,
      languageIds: selectedLanguageIds
    })
  }, [selectedIds, selectedLanguageIds, translationScope])

  const toggleExpanded = useCallback((collectionId: string) => {
    setExpandedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    )
  }, [])

  const handleHoverVideo = useCallback(
    (details: HoveredVideoDetails | null) => {
      setHoveredVideo(details)
    },
    []
  )

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore) return
    setIsLoadingMore(true)
    loadMoreTimeoutRef.current = window.setTimeout(() => {
      setVisibleCount((prev) =>
        Math.min(prev + COLLECTIONS_PER_BATCH, visibleCollections.length)
      )
      setIsLoadingMore(false)
    }, 240)
  }, [isLoadingMore, visibleCollections.length])

  const handleClearCache = useCallback(() => {
    clearCachedCollections(languageKey)
    setCacheMeta(null)
    setCachedCollections(collections)
  }, [collections, languageKey])

  const totalCollections = visibleCollections.length
  const shownCollections = Math.min(visibleCount, totalCollections)
  const canLoadMore = shownCollections < totalCollections
  const progressPercent =
    totalCollections > 0
      ? Math.round((shownCollections / totalCollections) * 100)
      : 0
  const nextRefreshIn = cacheMeta?.expiresAt
    ? formatDuration(cacheMeta.expiresAt - now)
    : 'unknown'
  const lastUpdatedLabel = cacheMeta?.lastUpdated
    ? formatTimeAgo(cacheMeta.lastUpdated, now)
    : 'unknown'

  return (
    <div className="report-shell">
      <header className="report-header">
        <div className="header-brand">
          <img
            src="/jesusfilm-sign.svg"
            alt="Jesus Film Project"
            className="header-logo"
          />
        </div>
        <div className="header-content">
          <div className="header-selectors">
            <span className="control-label control-label--title">Coverage Report</span>
            <div className="header-selectors-row">
              <div className="report-control report-control--text">
                <ReportTypeSelector value={reportType} onChange={setReportType} />
              </div>
            </div>
          </div>
        </div>
        <div className="header-diagram">
          <CoverageBar
            counts={overallCounts}
            activeFilter={interactionMode === 'explore' ? filter : 'all'}
            onFilter={setFilter}
            onSelectStatus={isSelectMode ? handleSelectByStatus : undefined}
            mode={interactionMode}
            labels={reportConfig.segmentLabels}
            ariaLabel={reportConfig.ariaLabel}
          />
        </div>
      </header>

      <section className="language-panel-section">
        <LanguageGeoSelector
          value={selectedLanguageIds}
          options={languageOptions}
        />
      </section>

      {gatewayConfigured && !errorMessage && (
        <section className="collection-progress-row" role="status" aria-live="polite">
          <div className="collection-progress">
            <div className="collection-progress-text">
              Showing {shownCollections} of {totalCollections} collections
            </div>
            <div
              className="collection-progress-bar"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Collections loading progress"
            >
              <span style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <div className="collection-cache-meta">
            <span>Last updated: {lastUpdatedLabel}</span>
            <span className="collection-cache-refresh">
              Next refresh in: {nextRefreshIn}
              <button
                type="button"
                className="collection-cache-clear"
                onClick={handleClearCache}
                aria-label="Refresh now"
                title="Refresh now"
              >
                <RefreshCw className="icon" aria-hidden="true" />
                Refresh now
              </button>
            </span>
          </div>
        </section>
      )}

      <section className="mode-panel">
        {isSubtitleReport && <ModeToggle mode={mode} onChange={setMode} />}
        <p className="mode-hint">
          {isSubtitleReport
            ? isSelectMode
              ? reportConfig.hintSelect ?? ''
              : reportConfig.hintExplore
            : reportConfig.hintExplore}
        </p>
        {interactionMode === 'explore' && filter !== 'all' && (
          <div className="filter-pill" role="status">
            Filtering: {reportConfig.statusLabels[filter]}
            <button type="button" onClick={() => setFilter('all')}>
              <FilterX className="icon" aria-hidden="true" />
              Clear filter
            </button>
          </div>
        )}
        {isSubtitleReport && (
          <div className="selection-actions">
            <TranslationActionBar
              selectedCount={selectedIds.length}
              languageLabels={targetLanguageLabels}
              scope={translationScope}
              hoveredVideo={hoveredVideo}
              statusLabels={reportConfig.statusLabels}
              isInteractive={isSelectMode}
              onScopeChange={setTranslationScope}
              onClear={handleClearSelection}
              onTranslate={handleTranslate}
            />
          </div>
        )}
      </section>

      {!gatewayConfigured ? (
        <div className="report-error">
          Set <code>NEXT_PUBLIC_GATEWAY_URL</code> to load collections.
        </div>
      ) : errorMessage ? (
        <div className="report-error">{errorMessage}</div>
      ) : (
        <div className="collections">
          {pagedCollections.map((collection) => {
            const collectionFilter = collectionFilters[collection.id] ?? 'all'
            const isExpanded = expandedCollections.includes(collection.id)

            return (
              <CollectionCard
                key={collection.id}
                collection={collection}
                reportType={reportType}
                reportConfig={reportConfig}
                interactionMode={interactionMode}
                isSelectMode={isSelectMode}
                selectedSet={selectedSet}
                collectionFilter={collectionFilter}
                isExpanded={isExpanded}
                onToggleExpanded={toggleExpanded}
                onToggleCollection={handleToggleCollection}
                onFilterCollection={handleFilterCollection}
                onToggleVideo={handleToggleVideo}
                onSelectByStatusInCollection={handleSelectByStatusInCollection}
                onHoverVideo={handleHoverVideo}
              />
            )
          })}
          {totalCollections === 0 && (
            <div className="collection-empty">No videos match this filter.</div>
          )}
          {totalCollections > 0 && (
            <div className="collection-load-more">
              <button
                type="button"
                className="load-more-button"
                onClick={handleLoadMore}
                disabled={!canLoadMore || isLoadingMore}
                aria-label="Load more collections"
                aria-busy={isLoadingMore}
              >
                {isLoadingMore && <span className="load-more-spinner" aria-hidden="true" />}
                {canLoadMore ? 'Load More Collections' : 'All collections loaded'}
              </button>
              <div className="collection-load-meta">
                {shownCollections} of {totalCollections} loaded
              </div>
            </div>
          )}
        </div>
      )}

      {isSubtitleReport && (
        <TranslationActionBar
          selectedCount={selectedIds.length}
          languageLabels={targetLanguageLabels}
          scope={translationScope}
          hoveredVideo={hoveredVideo}
          statusLabels={reportConfig.statusLabels}
          isInteractive={isSelectMode}
          onScopeChange={setTranslationScope}
          onClear={handleClearSelection}
          onTranslate={handleTranslate}
        />
      )}

    </div>
  )
}

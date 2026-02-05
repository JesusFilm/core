'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  Eraser,
  Eye,
  ExternalLink,
  FilterX,
  Languages,
  Sparkles,
  XCircle
} from 'lucide-react'

import { LanguageSelector } from './LanguageSelector'

type SubtitleStatus = 'human' | 'ai' | 'none'

type CoverageFilter = 'all' | SubtitleStatus

type ClientVideo = {
  id: string
  title: string
  status: SubtitleStatus
  watchUrl: string | null
}

type ClientCollection = {
  id: string
  title: string
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
  selectedLanguageId: string
  languageOptions: LanguageOption[]
}

type Mode = 'explore' | 'select'

type TranslationScope = 'missing' | 'all'

type HoveredVideoDetails = {
  video: ClientVideo
  collectionTitle: string
}

const SESSION_MODE_KEY = 'ai-media-coverage-mode'

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

  const updateMode = (value: Mode) => {
    setMode(value)
    if (typeof window === 'undefined') return
    try {
      window.sessionStorage.setItem(SESSION_MODE_KEY, value)
    } catch {
      // ignore storage errors
    }
  }

  return [mode, updateMode]
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
  mode
}: {
  counts: { human: number; ai: number; none: number }
  activeFilter: CoverageFilter
  onFilter: (filter: CoverageFilter) => void
  onSelectStatus?: (status: SubtitleStatus) => void
  mode: Mode
}) {
  const total = counts.human + counts.ai + counts.none
  const segments: Array<{
    key: SubtitleStatus
    label: string
    percent: number
    className: string
  }> = [
    {
      key: 'human',
      label: 'Human',
      percent: formatPercent(counts.human, total),
      className: 'stat-segment--human'
    },
    {
      key: 'ai',
      label: 'AI',
      percent: formatPercent(counts.ai, total),
      className: 'stat-segment--ai'
    },
    {
      key: 'none',
      label: 'No',
      percent: Math.max(0, 100 - formatPercent(counts.human, total) - formatPercent(counts.ai, total)),
      className: 'stat-segment--none'
    }
  ]

  const isExplore = mode === 'explore'
  const isInteractive = Boolean(onSelectStatus) || isExplore

  const handleSegmentClick = (status: SubtitleStatus) => {
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
      <div className="stat-bar" aria-label="Subtitle coverage">
        {segments.map((segment) => (
          <button
            key={segment.key}
            type="button"
            className={`stat-segment ${segment.className}${
              activeFilter === segment.key ? ' is-active' : ''
            }`}
            style={{ width: `${segment.percent}%` }}
            title={`${segment.label} translated: ${counts[segment.key]}`}
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

function SelectableVideoTile({
  mode,
  video,
  isSelected,
  onToggle,
  onHoverStart,
  onHoverEnd
}: {
  mode: Mode
  video: ClientVideo
  isSelected: boolean
  onToggle: () => void
  onHoverStart: () => void
  onHoverEnd: () => void
}) {
  const title = `${video.title} — ${video.status}`

  if (mode === 'explore') {
    if (video.watchUrl) {
      return (
        <a
          className={`tile tile--video tile--${video.status} tile--explore tile--link`}
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
        className={`tile tile--video tile--${video.status} tile--explore`}
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
      className={`tile tile--video tile--${video.status} tile--select${
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
  languageLabel,
  scope,
  hoveredVideo,
  onScopeChange,
  onClear,
  onTranslate
}: {
  selectedCount: number
  languageLabel: string
  scope: TranslationScope
  hoveredVideo: HoveredVideoDetails | null
  onScopeChange: (scope: TranslationScope) => void
  onClear: () => void
  onTranslate: () => void
}) {
  const statusLabel =
    hoveredVideo?.video.status === 'human'
      ? 'Human subtitles'
      : hoveredVideo?.video.status === 'ai'
        ? 'AI subtitles'
        : 'No subtitles'

  return (
    <div
      className={`translation-bar${hoveredVideo ? ' is-detail' : ''}`}
      role="status"
      aria-live="polite"
    >
      <div className="translation-view translation-view--selection">
        <div className="translation-summary">
          <div className="translation-count">
            {selectedCount} video{selectedCount === 1 ? '' : 's'} selected
          </div>
          <div className="translation-target">Target language: {languageLabel}</div>
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
            Translate {selectedCount} videos to {languageLabel}
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
      <div className="translation-view translation-view--detail">
        <div className="translation-summary">
          <div className="translation-count">{hoveredVideo?.video.title ?? ''}</div>
          <div className="translation-target">{hoveredVideo?.collectionTitle ?? ''}</div>
        </div>
        <div className="translation-controls translation-controls--detail">
          <span
            className={`detail-status${
              hoveredVideo ? ` detail-status--${hoveredVideo.video.status}` : ''
            }`}
          >
            {statusLabel}
          </span>
          {hoveredVideo?.video.watchUrl ? (
            <a
              className="detail-link detail-link--panel"
              href={hoveredVideo.video.watchUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="detail-link-icon" aria-hidden="true" />
              Watch video
            </a>
          ) : (
            <span className="detail-muted">No watch link available</span>
          )}
        </div>
      </div>
    </div>
  )
}

export function CoverageReportClient({
  gatewayConfigured,
  errorMessage,
  collections,
  selectedLanguageId,
  languageOptions
}: CoverageReportClientProps) {
  const [mode, setMode] = useSessionMode('explore')
  const [filter, setFilter] = useState<CoverageFilter>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [translationScope, setTranslationScope] = useState<TranslationScope>('missing')
  const [hoveredVideo, setHoveredVideo] = useState<HoveredVideoDetails | null>(
    null
  )
  const [expandedCollections, setExpandedCollections] = useState<string[]>([])
  const [collectionFilters, setCollectionFilters] = useState<
    Record<string, CoverageFilter>
  >({})

  useEffect(() => {
    if (mode === 'explore') {
      setSelectedIds([])
    }
  }, [mode])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])

  const languageLabel =
    languageOptions.find((option) => option.id === selectedLanguageId)
      ?.englishLabel ??
    languageOptions[0]?.englishLabel ??
    selectedLanguageId

  const overallCounts = useMemo(() => {
    return collections.reduce(
      (acc, collection) => {
        for (const video of collection.videos) {
          acc[video.status] += 1
        }
        return acc
      },
      { human: 0, ai: 0, none: 0 }
    )
  }, [collections])

  const effectiveFilter = mode === 'explore' ? filter : 'all'

  const visibleCollections = useMemo(() => {
    if (effectiveFilter === 'all') return collections
    return collections
      .map((collection) => ({
        ...collection,
        videos: collection.videos.filter(
          (video) => video.status === effectiveFilter
        )
      }))
      .filter((collection) => collection.videos.length > 0)
  }, [collections, effectiveFilter])

  const allVideoIds = useMemo(
    () => collections.flatMap((collection) => collection.videos.map((video) => video.id)),
    [collections]
  )

  const allMissingIds = useMemo(
    () =>
      collections.flatMap((collection) =>
        collection.videos
          .filter((video) => video.status === 'none')
          .map((video) => video.id)
      ),
    [collections]
  )

  const statusIdMap = useMemo(() => {
    return collections.reduce(
      (acc, collection) => {
        for (const video of collection.videos) {
          acc[video.status].push(video.id)
        }
        return acc
      },
      { human: [] as string[], ai: [] as string[], none: [] as string[] }
    )
  }, [collections])

  const handleToggleVideo = (videoId: string) => {
    setSelectedIds((prev) =>
      prev.includes(videoId) ? prev.filter((id) => id !== videoId) : [...prev, videoId]
    )
  }

  const handleToggleCollection = (collection: ClientCollection) => {
    const collectionIds = collection.videos.map((video) => video.id)
    const allSelected = collectionIds.every((id) => selectedSet.has(id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !collectionIds.includes(id)))
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...collectionIds])))
    }
  }

  const handleSelectAllMissing = () => {
    setSelectedIds(Array.from(new Set([...selectedIds, ...allMissingIds])))
  }

  const handleSelectByStatus = (status: SubtitleStatus) => {
    const statusIds = statusIdMap[status]
    const allSelected = statusIds.length > 0 && statusIds.every((id) => selectedSet.has(id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !statusIds.includes(id)))
      return
    }
    setSelectedIds((prev) => Array.from(new Set([...prev, ...statusIds])))
  }

  const handleSelectByStatusInCollection = (
    collection: ClientCollection,
    status: SubtitleStatus
  ) => {
    const statusIds = collection.videos
      .filter((video) => video.status === status)
      .map((video) => video.id)
    const allSelected =
      statusIds.length > 0 && statusIds.every((id) => selectedSet.has(id))
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !statusIds.includes(id)))
      return
    }
    setSelectedIds((prev) => Array.from(new Set([...prev, ...statusIds])))
  }

  const handleFilterCollection = (
    collectionId: string,
    nextFilter: CoverageFilter
  ) => {
    setCollectionFilters((prev) => ({
      ...prev,
      [collectionId]: nextFilter
    }))
  }

  const handleClearSelection = () => {
    setSelectedIds([])
  }

  const handleTranslate = () => {
    console.info('Translate videos', {
      selectedIds,
      translationScope,
      languageId: selectedLanguageId
    })
  }

  const toggleExpanded = (collectionId: string) => {
    setExpandedCollections((prev) =>
      prev.includes(collectionId)
        ? prev.filter((id) => id !== collectionId)
        : [...prev, collectionId]
    )
  }

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
                <button className="control-value control-caret" type="button">
                  Subtitles
                </button>
              </div>
              <span className="header-divider" aria-hidden="true">
                /
              </span>
              <div className="report-control report-control--text">
                <span className="control-label">Language</span>
                <LanguageSelector
                  value={selectedLanguageId}
                  options={languageOptions}
                  className="control-value"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="header-diagram">
          <CoverageBar
            counts={overallCounts}
            activeFilter={mode === 'explore' ? filter : 'all'}
            onFilter={setFilter}
            onSelectStatus={mode === 'select' ? handleSelectByStatus : undefined}
            mode={mode}
          />
        </div>
      </header>

      <section className="mode-panel">
        <ModeToggle mode={mode} onChange={setMode} />
        <p className="mode-hint">
          {mode === 'explore'
            ? 'Explore subtitles coverage across video collections.'
            : 'Select videos for translation.'}
        </p>
        {mode === 'explore' && filter !== 'all' && (
          <div className="filter-pill" role="status">
            Filtering: {filter === 'none' ? 'No subtitles' : filter}
            <button type="button" onClick={() => setFilter('all')}>
              <FilterX className="icon" aria-hidden="true" />
              Clear filter
            </button>
          </div>
        )}
        {mode === 'select' && (
          <div className="selection-actions">
            <TranslationActionBar
              selectedCount={selectedIds.length}
              languageLabel={languageLabel}
              scope={translationScope}
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
          {visibleCollections.map((collection) => {
            const total = collection.videos.length
            const counts = collection.videos.reduce(
              (acc, video) => {
                acc[video.status] += 1
                return acc
              },
              { human: 0, ai: 0, none: 0 }
            )
            const collectionFilter = collectionFilters[collection.id] ?? 'all'
            const filteredCollectionVideos =
              collectionFilter === 'all'
                ? collection.videos
                : collection.videos.filter((video) => video.status === collectionFilter)
            const sortedVideos = [...filteredCollectionVideos].sort((a, b) => {
              const order = { human: 0, ai: 1, none: 2 }
              return order[a.status] - order[b.status]
            })
            const isExpanded = expandedCollections.includes(collection.id)
            const collectionSelectedCount = collection.videos.filter((video) =>
              selectedSet.has(video.id)
            ).length
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
                    toggleExpanded(collection.id)
                  }
                }}
                onClick={(event) => {
                  const target = event.target as HTMLElement
                  if (target.closest('a, button, input, select, textarea')) return
                  if (target.closest('.tile')) return
                  toggleExpanded(collection.id)
                }}
              >
                <div className="collection-header">
                  <div className="collection-title-row">
                    <div
                      className="collection-title-block"
                      role={mode === 'select' ? 'button' : undefined}
                      tabIndex={mode === 'select' ? 0 : undefined}
                      onClick={(event) => {
                        if (mode !== 'select') return
                        const target = event.target as HTMLElement
                        if (target.closest('.checkbox')) return
                        event.stopPropagation()
                        handleToggleCollection(collection)
                      }}
                      onKeyDown={(event) => {
                        if (mode !== 'select') return
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault()
                          event.stopPropagation()
                          handleToggleCollection(collection)
                        }
                      }}
                    >
                      <div className="collection-title-line">
                        <h2 className="collection-title">{collection.title}</h2>
                        {mode === 'select' && (
                          <Checkbox
                            checked={collectionAllSelected}
                            indeterminate={
                              collectionSelectedCount > 0 && !collectionAllSelected
                            }
                            onChange={() => handleToggleCollection(collection)}
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
                      activeFilter={mode === 'explore' ? collectionFilter : 'all'}
                      onFilter={(nextFilter) =>
                        handleFilterCollection(collection.id, nextFilter)
                      }
                      onSelectStatus={
                        mode === 'select'
                          ? (status) => handleSelectByStatusInCollection(collection, status)
                          : undefined
                      }
                      mode={mode}
                    />
                  </div>
                </div>
                <div
                  className={`collection-divider${isExpanded ? ' is-open' : ''}`}
                >
                  <button
                    type="button"
                    className="collection-toggle"
                    onClick={(event) => {
                      event.stopPropagation()
                      toggleExpanded(collection.id)
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
                <div
                  className={`collection-details${
                    isExpanded ? ' is-open' : ''
                  }`}
                >
                  {filteredCollectionVideos.map((video) => (
                    <div className="collection-detail-row" key={video.id}>
                      {mode === 'select' ? (
                        <button
                          type="button"
                          className={`tile tile--video tile--${video.status} tile--select detail-tile${
                            selectedSet.has(video.id) ? ' is-selected' : ''
                          }`}
                          onClick={() => handleToggleVideo(video.id)}
                          onMouseEnter={() =>
                            setHoveredVideo({
                              video,
                              collectionTitle: collection.title
                            })
                          }
                          onMouseLeave={() => setHoveredVideo(null)}
                          onFocus={() =>
                            setHoveredVideo({
                              video,
                              collectionTitle: collection.title
                            })
                          }
                          onBlur={() => setHoveredVideo(null)}
                          aria-pressed={selectedSet.has(video.id)}
                          aria-label={`Select ${video.title}`}
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
                          className={`tile tile--${video.status} detail-tile`}
                          aria-hidden="true"
                          onMouseEnter={() =>
                            setHoveredVideo({
                              video,
                              collectionTitle: collection.title
                            })
                          }
                          onMouseLeave={() => setHoveredVideo(null)}
                          onFocus={() =>
                            setHoveredVideo({
                              video,
                              collectionTitle: collection.title
                            })
                          }
                          onBlur={() => setHoveredVideo(null)}
                        />
                      )}
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
                    </div>
                  ))}
                </div>
                <div
                  className={`collection-tiles${
                    mode === 'select' ? ' collection-tiles--select' : ''
                  }${isExpanded ? ' is-hidden' : ''}`}
                >
                  {sortedVideos.map((video) => (
                    <SelectableVideoTile
                      key={video.id}
                      mode={mode}
                      video={video}
                      isSelected={selectedSet.has(video.id)}
                      onToggle={() => handleToggleVideo(video.id)}
                      onHoverStart={() =>
                        setHoveredVideo({ video, collectionTitle: collection.title })
                      }
                      onHoverEnd={() => setHoveredVideo(null)}
                    />
                  ))}
                  {filteredCollectionVideos.length === 0 && (
                    <p className="collection-empty">No videos in this collection.</p>
                  )}
                </div>
              </section>
            )
          })}
          {visibleCollections.length === 0 && (
            <div className="collection-empty">No videos match this filter.</div>
          )}
        </div>
      )}

      <TranslationActionBar
        selectedCount={selectedIds.length}
        languageLabel={languageLabel}
        scope={translationScope}
        hoveredVideo={hoveredVideo}
        onScopeChange={setTranslationScope}
        onClear={handleClearSelection}
        onTranslate={handleTranslate}
      />

      <section className="legend">
        <h3>Legend - Single video blocks</h3>
        <div className="legend-grid">
          <div className="legend-item">
            <span className="tile tile--human" />
            <span>Human subtitles</span>
          </div>
          <div className="legend-item">
            <span className="tile tile--ai" />
            <span>AI subtitles</span>
          </div>
          <div className="legend-item">
            <span className="tile tile--none" />
            <span>No subtitles</span>
          </div>
        </div>
      </section>
    </div>
  )
}

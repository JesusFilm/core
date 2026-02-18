import { CoverageFilter, SubtitleStatus } from './coverageTypes'

function formatPercent(count: number, total: number): number {
  if (total === 0) return 0
  return Math.round((count / total) * 100)
}

export function CoverageBar({
  counts,
  activeFilter,
  onFilter,
  onSelectStatus,
  mode,
  forceHover
}: {
  counts: { human: number; ai: number; none: number }
  activeFilter: CoverageFilter
  onFilter: (filter: CoverageFilter) => void
  onSelectStatus?: (status: SubtitleStatus) => void
  mode: 'explore' | 'select'
  forceHover?: boolean
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
      label: 'Edited',
      percent: formatPercent(counts.human, total),
      className: 'stat-segment--human'
    },
    {
      key: 'ai',
      label: 'Auto',
      percent: formatPercent(counts.ai, total),
      className: 'stat-segment--ai'
    },
    {
      key: 'none',
      label: 'None',
      percent: Math.max(
        0,
        100 - formatPercent(counts.human, total) - formatPercent(counts.ai, total)
      ),
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
    <div
      className={`coverage-bar${isInteractive ? ' is-interactive' : ''}${
        forceHover ? ' is-hovered' : ''
      }`}
    >
      <div className="stat-bar" aria-label="Subtitle coverage">
        {segments.map((segment) => (
          <button
            key={segment.key}
            type="button"
            className={`stat-segment ${segment.className}$${
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
      <div className="coverage-legend-shell">
        <p className="coverage-hint">{helperText}</p>
        <div className="stat-legend">
          {segments.map((segment) => (
            <button
              key={segment.key}
              type="button"
              className={`stat-legend-item stat-legend-item--${segment.key}$${
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
    </div>
  )
}

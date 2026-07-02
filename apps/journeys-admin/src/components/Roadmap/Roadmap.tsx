import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { Fragment, ReactElement } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export interface RoadmapItem {
  title: string
  order: number
  category: string
  size: string
  subRow: number
  spanToEnd: boolean
  status: string | null
  effort: string | null
  content: string
}

interface RoadmapProps {
  items: RoadmapItem[]
}

interface Section {
  id: string
  label: string
  // Number of stacked sub-rows inside the section (AI has a second row for the
  // ongoing tuning work). Items pick a sub-row via `subRow`.
  rows: number
}

// Sections, top to bottom. Each item sits in its section and keeps its `order`
// as its column, so column positions stay aligned across sections.
const SECTIONS: Section[] = [
  { id: 'bug', label: 'Bugs & Maintenance', rows: 1 },
  { id: 'feature', label: 'Feature development', rows: 2 },
  { id: 'ai', label: 'AI', rows: 2 }
]

// Three distinct background layers, lightest to darkest:
// the page (title + description), the roadmap area (where tickets sit), and
// the section row strips the cards rest on.
const PAGE_BG = '#FFFFFF'
const ROADMAP_BG = '#E7E7EC'
const ROW_BG = '#F4F4F7'

// Soft edge on the right of the sticky section headers, so cards visibly pass
// under them instead of fading into nothing while scrolling.
const LANE_DIVIDER = '#DEDEE3'

// Card width scales with how big the task is. Each column is sized to the card
// that occupies that `order`, so wider tasks get wider columns.
const SIZE_WIDTHS: Record<string, number> = {
  small: 160,
  medium: 220,
  large: 290
}
const DEFAULT_WIDTH = SIZE_WIDTHS.medium

// The "future" zone after the concrete tickets — extra columns the ongoing
// spanning work (Feature Improve/Create bars, AI tuning) runs off into.
const FUTURE_COLUMNS = 2
const FUTURE_COLUMN_WIDTH = SIZE_WIDTHS.large

const LANE_LABEL_WIDTH = 110

// Floor so short tickets don't look stunted — roughly the height of the
// "Urgent bug fixes" ticket. Cards stretch within their row, so this lifts any
// row whose tallest card falls below it.
const CARD_MIN_HEIGHT = 120

function RoadmapCard({
  item,
  row
}: {
  item: RoadmapItem
  row: number
}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const inProgress = item.status === 'In progress'

  return (
    <Paper
      variant="outlined"
      sx={{
        gridColumn: item.spanToEnd ? `${item.order + 1} / -1` : item.order + 1,
        gridRow: row,
        position: 'relative',
        zIndex: 1,
        p: 1.5,
        borderRadius: 2,
        minHeight: CARD_MIN_HEIGHT,
        display: 'flex',
        flexDirection: 'column',
        // Ongoing tickets trail off to the right: drop the right edge and fade
        // the card into the lane so they read as continuing, not ending.
        ...(item.spanToEnd && {
          borderRightWidth: 0,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 72,
            background: `linear-gradient(to right, ${PAGE_BG}00, ${ROW_BG})`,
            pointerEvents: 'none'
          }
        })
      }}
    >
      <Stack spacing={0.75} sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} alignItems="center">
          {inProgress && (
            <Box
              role="img"
              aria-label={t('In progress')}
              sx={{
                flexShrink: 0,
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'success.main'
              }}
            />
          )}
          <Typography
            component="h3"
            sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.25 }}
          >
            {item.title}
          </Typography>
        </Stack>
        <Box
          sx={{
            color: 'text.secondary',
            fontSize: 11,
            lineHeight: 1.4,
            '& p': { m: 0, mb: 0.75 },
            '& ul': { listStyle: 'none', m: 0, p: 0 },
            '& li': {
              position: 'relative',
              pl: 1.5,
              mb: 0.5,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: '0.5em',
                width: 4,
                height: 4,
                borderRadius: '50%',
                bgcolor: 'text.disabled'
              }
            },
            '& a': { color: 'primary.main' }
          }}
        >
          <Markdown remarkPlugins={[remarkGfm]}>{item.content}</Markdown>
        </Box>
      </Stack>
    </Paper>
  )
}

export function Roadmap({ items }: RoadmapProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const ordered = [...items].sort((a, b) => a.order - b.order)
  // Spanning cards (e.g. the ongoing AI-tuning bar) sit across existing columns
  // and don't define a column of their own.
  const columnItems = ordered.filter((item) => !item.spanToEnd)
  const lastConcreteOrder = columnItems.reduce(
    (max, item) => Math.max(max, item.order),
    0
  )
  const columnCount = lastConcreteOrder + FUTURE_COLUMNS
  const widthByOrder = new Map(
    columnItems.map((item) => [
      item.order,
      SIZE_WIDTHS[item.size] ?? DEFAULT_WIDTH
    ])
  )
  const columnWidths = Array.from({ length: columnCount }, (_, index) => {
    const order = index + 1
    const width =
      widthByOrder.get(order) ??
      (order > lastConcreteOrder ? FUTURE_COLUMN_WIDTH : DEFAULT_WIDTH)
    return `${width}px`
  }).join(' ')

  // Lay sections out top to bottom, each occupying `rows` stacked grid rows.
  let nextRow = 1
  const placedSections = SECTIONS.map((section) => {
    const startRow = nextRow
    nextRow += section.rows
    return { ...section, startRow }
  })

  return (
    <Box component="section" sx={{ bgcolor: PAGE_BG, minHeight: '100vh' }}>
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 10 } }}>
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <Typography variant="overline" color="primary">
            {t('NextSteps')}
          </Typography>
          <Typography variant="h2" component="h1">
            {t('Product Roadmap')}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 'sm' }}
          >
            {t(
              'What we are focused on, roughly in priority order. Timeframes are rough and subject to change.'
            )}
          </Typography>
        </Stack>
      </Container>
      <Box sx={{ bgcolor: ROADMAP_BG, py: { xs: 5, md: 7 } }}>
        <Box sx={{ overflowX: 'auto', pb: 1 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: `${LANE_LABEL_WIDTH}px ${columnWidths}`,
              columnGap: 1.5,
              rowGap: 3,
              alignItems: 'stretch',
              width: 'min-content',
              // Inset lives on the grid margin (which scrolls), not the scroll
              // container's padding. At rest this gives the left edge; once you
              // scroll right the margin slides away and the sticky section
              // headers reach the true page edge, so nothing shows to their left.
              mx: { xs: 2, md: 4 }
            }}
          >
            {placedSections.map((section) => {
              const rowSpan = `${section.startRow} / span ${section.rows}`
              return (
                <Fragment key={section.id}>
                  <Box
                    aria-hidden
                    sx={{
                      gridColumn: '1 / -1',
                      gridRow: rowSpan,
                      position: 'relative',
                      zIndex: 0,
                      bgcolor: ROW_BG,
                      borderRadius: 2
                    }}
                  />
                  <Box
                    sx={{
                      gridColumn: 1,
                      gridRow: rowSpan,
                      position: 'sticky',
                      left: 0,
                      zIndex: 2,
                      display: 'flex',
                      alignItems: 'center',
                      px: 1.5,
                      bgcolor: ROW_BG,
                      borderTopLeftRadius: 8,
                      borderBottomLeftRadius: 8,
                      borderRight: `1px solid ${LANE_DIVIDER}`,
                      boxShadow: '4px 0 6px -5px rgba(0, 0, 0, 0.12)'
                    }}
                  >
                    <Typography
                      component="h2"
                      sx={{
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        color: 'text.secondary'
                      }}
                    >
                      {t(section.label)}
                    </Typography>
                  </Box>
                  {ordered
                    .filter((item) => item.category === section.id)
                    .map((item) => (
                      <RoadmapCard
                        key={item.title}
                        item={item}
                        row={section.startRow + item.subRow}
                      />
                    ))}
                </Fragment>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

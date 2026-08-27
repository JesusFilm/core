import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next/pages'
import { Fragment, KeyboardEvent, ReactElement, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import X2Icon from '@core/shared/ui/icons/X2'

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
  detail: string | null
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

// Markdown body styling, shared by the card summary and the detail dialog so
// the two read as the same document at different sizes.
function markdownSx(fontSize: number) {
  return {
    color: 'text.secondary',
    fontSize,
    lineHeight: 1.5,
    '& p': { m: 0, mb: 0.75 },
    '& h2': { fontSize: fontSize + 2, fontWeight: 700, mt: 2, mb: 0.75 },
    '& h3': { fontSize: fontSize + 1, fontWeight: 700, mt: 1.5, mb: 0.5 },
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
    '& strong': { color: 'text.primary' },
    '& blockquote': {
      m: 0,
      mb: 1,
      pl: 1.5,
      borderLeft: 2,
      borderColor: 'divider',
      color: 'text.primary'
    },
    '& a': { color: 'primary.main' }
  } as const
}

function RoadmapCard({
  item,
  row,
  onOpen
}: {
  item: RoadmapItem
  row: number
  onOpen: (item: RoadmapItem) => void
}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  // Only tickets with a detail section are openable; the rest stay inert so a
  // click doesn't promise more than the card already shows.
  const openable = item.detail != null

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onOpen(item)
  }
  // Only finished and active work carries a dot; Next and Later read as plain
  // cards. `t` is called per-branch so the keys stay statically extractable.
  const statusDot =
    item.status === 'Done'
      ? { color: 'success.main', label: t('Done') }
      : item.status === 'In progress'
        ? { color: 'warning.main', label: t('In progress') }
        : null

  return (
    <Paper
      variant="outlined"
      {...(openable && {
        role: 'button',
        tabIndex: 0,
        'aria-label': t('Open details for {{title}}', { title: item.title }),
        onClick: () => onOpen(item),
        onKeyDown: handleKeyDown
      })}
      sx={{
        gridColumn: item.spanToEnd ? `${item.order + 1} / -1` : item.order + 1,
        ...(openable && {
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'border-color 120ms, box-shadow 120ms',
          '&:hover, &:focus-visible': {
            borderColor: 'primary.main',
            boxShadow: 1
          }
        }),
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
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          {statusDot != null && (
            <Box
              role="img"
              aria-label={statusDot.label}
              sx={{
                flexShrink: 0,
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: statusDot.color
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
        <Box sx={markdownSx(11)}>
          <Markdown remarkPlugins={[remarkGfm]}>{item.content}</Markdown>
        </Box>
      </Stack>
    </Paper>
  )
}

function RoadmapDialog({
  item,
  onClose
}: {
  item: RoadmapItem | null
  onClose: () => void
}): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  return (
    <Dialog
      open={item != null}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="roadmap-dialog-title"
    >
      {item != null && (
        <>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'flex-start', p: 3, pb: 1 }}
          >
            <Typography
              id="roadmap-dialog-title"
              component="h2"
              sx={{ flexGrow: 1, fontSize: 20, fontWeight: 700 }}
            >
              {item.title}
            </Typography>
            <IconButton
              onClick={onClose}
              aria-label={t('Close')}
              sx={{ mt: -1, mr: -1 }}
            >
              <X2Icon />
            </IconButton>
          </Stack>
          <DialogContent sx={{ pt: 0 }}>
            <Box sx={markdownSx(14)}>
              <Markdown remarkPlugins={[remarkGfm]}>
                {item.detail ?? ''}
              </Markdown>
            </Box>
          </DialogContent>
        </>
      )}
    </Dialog>
  )
}

export function Roadmap({ items }: RoadmapProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [openItem, setOpenItem] = useState<RoadmapItem | null>(null)

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
                        onOpen={setOpenItem}
                      />
                    ))}
                </Fragment>
              )
            })}
          </Box>
        </Box>
      </Box>
      <RoadmapDialog item={openItem} onClose={() => setOpenItem(null)} />
    </Box>
  )
}

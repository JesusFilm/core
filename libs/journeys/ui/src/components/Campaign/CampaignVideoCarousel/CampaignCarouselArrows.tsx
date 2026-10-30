import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { useTranslation } from 'next-i18next/pages'
import {
  MouseEvent,
  ReactElement,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import ChevronLeft from '@core/shared/ui/icons/ChevronLeft'
import ChevronRight from '@core/shared/ui/icons/ChevronRight'

import { scrollBehavior } from '../libs/scrollBehavior'

/** Sub-pixel scroll positions would otherwise leave the end arrow enabled. */
const SCROLL_EDGE_TOLERANCE_PX = 1

/** A whole number of card strides that fits the row, or its width when the stride is unknown. */
function pageStep(row: HTMLElement): number {
  const [first, second] = Array.from(row.children) as HTMLElement[]
  if (first == null || second == null) return row.clientWidth
  const stride = Math.abs(second.offsetLeft - first.offsetLeft)
  if (stride <= 0) return row.clientWidth
  return Math.max(1, Math.floor(row.clientWidth / stride)) * stride
}

interface CarouselScroll {
  rowRef: RefObject<HTMLDivElement | null>
  canScrollPrevious: boolean
  canScrollNext: boolean
  scrollPrevious: () => void
  scrollNext: () => void
}

/**
 * Scroll state of a carousel row: whether it can still scroll either way, and
 * a page step in each direction. A page is as many whole cards as fit the row,
 * so the clipped card that was the scroll hint becomes the first card after
 * Next. Reading direction follows the theme, as `scrollLeft` runs negative in
 * RTL.
 */
export function useCarouselScroll(cardCount: number): CarouselScroll {
  const rowRef = useRef<HTMLDivElement>(null)
  const { direction } = useTheme()
  const [canScrollPrevious, setCanScrollPrevious] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const updateEdges = useCallback((): void => {
    const row = rowRef.current
    if (row == null) return
    const offset = Math.abs(row.scrollLeft)
    setCanScrollPrevious(offset > SCROLL_EDGE_TOLERANCE_PX)
    setCanScrollNext(
      offset + row.clientWidth < row.scrollWidth - SCROLL_EDGE_TOLERANCE_PX
    )
  }, [])

  useEffect(() => {
    const row = rowRef.current
    if (row == null) return
    updateEdges()
    row.addEventListener('scroll', updateEdges, { passive: true })
    if (typeof ResizeObserver === 'undefined')
      return () => row.removeEventListener('scroll', updateEdges)
    const observer = new ResizeObserver(updateEdges)
    observer.observe(row)
    return () => {
      row.removeEventListener('scroll', updateEdges)
      observer.disconnect()
    }
  }, [cardCount, updateEdges])

  function scrollPage(towardEnd: boolean): void {
    const row = rowRef.current
    if (row == null) return
    const step = pageStep(row)
    const towardRight = towardEnd === (direction !== 'rtl')
    row.scrollBy({
      left: towardRight ? step : -step,
      behavior: scrollBehavior()
    })
  }

  return {
    rowRef,
    canScrollPrevious,
    canScrollNext,
    scrollPrevious: () => scrollPage(false),
    scrollNext: () => scrollPage(true)
  }
}

interface CampaignCarouselArrowsProps {
  canScrollPrevious: boolean
  canScrollNext: boolean
  onPrevious: () => void
  onNext: () => void
}

const arrowSx = {
  width: 40,
  height: 40,
  minWidth: 0,
  p: 0,
  color: 'var(--campaign-band-text)',
  borderColor: 'var(--campaign-band-border)',
  '&:hover': { borderColor: 'var(--campaign-band-text)' },
  '&[aria-disabled="true"]': {
    color: 'var(--campaign-band-text)',
    borderColor: 'var(--campaign-band-border)',
    backgroundColor: 'transparent',
    cursor: 'default',
    opacity: 0.4
  }
} as const

/**
 * Previous / next buttons of a carousel row. They take the band's text colour
 * and the theme's button corners, and are hidden below `md`, where swiping
 * stays the way to scroll. At an edge an arrow is `aria-disabled` rather than
 * `disabled`, so keyboard focus stays on it instead of dropping to the page.
 */
export function CampaignCarouselArrows({
  canScrollPrevious,
  canScrollNext,
  onPrevious,
  onNext
}: CampaignCarouselArrowsProps): ReactElement {
  const { t } = useTranslation('libs-journeys-ui')
  const { direction, breakpoints } = useTheme()
  const rtl = direction === 'rtl'

  function stopPropagation(event: MouseEvent<HTMLElement>): void {
    event.stopPropagation()
  }

  return (
    <Stack
      direction="row"
      spacing={1}
      data-testid="CampaignCarouselArrows"
      onClick={stopPropagation}
      sx={{
        justifyContent: 'flex-end',
        [breakpoints.down('md')]: { display: 'none' }
      }}
    >
      <Button
        variant="outlined"
        aria-label={t('Previous videos')}
        aria-disabled={!canScrollPrevious}
        onClick={canScrollPrevious ? onPrevious : undefined}
        sx={arrowSx}
      >
        {rtl ? <ChevronRight /> : <ChevronLeft />}
      </Button>
      <Button
        variant="outlined"
        aria-label={t('Next videos')}
        aria-disabled={!canScrollNext}
        onClick={canScrollNext ? onNext : undefined}
        sx={arrowSx}
      >
        {rtl ? <ChevronLeft /> : <ChevronRight />}
      </Button>
    </Stack>
  )
}

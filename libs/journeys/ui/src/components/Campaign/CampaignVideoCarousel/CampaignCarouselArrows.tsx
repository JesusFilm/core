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

/** Sub-pixel scroll positions would otherwise leave the end arrow enabled. */
const SCROLL_EDGE_TOLERANCE_PX = 1

interface CarouselScroll {
  rowRef: RefObject<HTMLDivElement | null>
  canScrollPrevious: boolean
  canScrollNext: boolean
  scrollPrevious: () => void
  scrollNext: () => void
}

/**
 * Scroll state of a carousel row: whether it can still scroll either way, and
 * a page step (one viewport width of the row) in each direction. Reading
 * direction follows the theme, as `scrollLeft` runs negative in RTL.
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
    const towardRight = towardEnd === (direction !== 'rtl')
    row.scrollBy({
      left: towardRight ? row.clientWidth : -row.clientWidth,
      behavior: 'smooth'
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
  '&.Mui-disabled': {
    color: 'var(--campaign-band-text)',
    borderColor: 'var(--campaign-band-border)',
    opacity: 0.4
  }
} as const

/**
 * Previous / next buttons of a carousel row. They take the band's text colour
 * and the theme's button corners, and are hidden below `md`, where swiping
 * stays the way to scroll.
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
        disabled={!canScrollPrevious}
        onClick={onPrevious}
        sx={arrowSx}
      >
        {rtl ? <ChevronRight /> : <ChevronLeft />}
      </Button>
      <Button
        variant="outlined"
        aria-label={t('Next videos')}
        disabled={!canScrollNext}
        onClick={onNext}
        sx={arrowSx}
      >
        {rtl ? <ChevronLeft /> : <ChevronRight />}
      </Button>
    </Stack>
  )
}

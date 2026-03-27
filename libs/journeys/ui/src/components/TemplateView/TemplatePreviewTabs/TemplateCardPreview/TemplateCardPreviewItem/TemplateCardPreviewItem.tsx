import Box from '@mui/material/Box'
import { ReactElement, useEffect, useRef } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeName } from '@core/shared/ui/themes'

import { ThemeMode } from '../../../../../../__generated__/globalTypes'
import { TreeBlock } from '../../../../../libs/block'
import { useJourney } from '../../../../../libs/JourneyProvider'
import { getJourneyRTL } from '../../../../../libs/rtl'
import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_StepBlock as StepBlock
} from '../../../../../libs/useJourneyQuery/__generated__/GetJourney'
import { BlockRenderer } from '../../../../BlockRenderer'
import { CardWrapper } from '../../../../CardWrapper'
import { FramePortal } from '../../../../FramePortal'
import { StepFields } from '../../../../Step/__generated__/StepFields'
import { StepFooter } from '../../../../StepFooter'
import { StepHeader } from '../../../../StepHeader'
import { VideoWrapper } from '../../../../VideoWrapper'
import {
  SELECTED_SCALE,
  type TemplateCardPreviewVariant,
  VARIANT_CONFIGS
} from '../templateCardPreviewConfig'

export interface TemplateCardPreviewItemProps {
  step: TreeBlock<StepBlock>
  variant: TemplateCardPreviewVariant
  onClick?: (step: TreeBlock<StepBlock>) => void
  selectedStep?: TreeBlock<StepBlock> | null
  steps?: Array<TreeBlock<StepFields>> | null
}

/**
 * Renders a single template step as a preview card inside a FramePortal.
 * Applies variant-based sizing, optional selection scale, and theme/RTL from the journey.
 * Invokes onClick when the card is clicked.
 * Renders StepHeader and StepFooter overlaid on the card using the provided steps list.
 *
 * @returns A clickable card box containing the step content in a scaled frame.
 */
export function TemplateCardPreviewItem({
  step,
  variant,
  onClick,
  selectedStep,
  steps
}: TemplateCardPreviewItemProps): ReactElement {
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)
  const cardBlock = step.children.find(
    (child) => child.__typename === 'CardBlock'
  ) as TreeBlock<CardBlock>

  const config = VARIANT_CONFIGS[variant]
  const {
    cardWidth,
    cardHeight,
    framePortal,
    cardSx,
    opacity,
    selectedBoxShadow
  } = config
  const isSelected = selectedStep?.id === step.id

  const isGuestPreview = variant === 'guestPreview'

  const baseTransform = {
    xs: `scale(${framePortal.scale.xs})`,
    sm: `scale(${framePortal.scale.sm})`
  }

  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isGuestPreview) return
    const overlay = overlayRef.current
    if (overlay == null) return

    let cachedScrollable: Element | null = null

    function getIframeDoc(): Document | null {
      const iframe = overlay?.parentElement?.querySelector('iframe')
      return iframe?.contentDocument ?? null
    }

    function getScrollable(): Element | null {
      if (cachedScrollable != null) return cachedScrollable
      const doc = getIframeDoc()
      if (doc == null) return null
      const found = Array.from(doc.querySelectorAll('*')).find((el) => {
        const style = doc.defaultView?.getComputedStyle(el)
        return (
          style != null &&
          (style.overflowY === 'scroll' || style.overflowY === 'auto') &&
          el.scrollHeight > el.clientHeight
        )
      })
      cachedScrollable = found ?? null
      return cachedScrollable
    }

    function handleWheel(e: WheelEvent): void {
      const scrollable = getScrollable()
      if (scrollable != null) {
        let deltaY = e.deltaY
        if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) deltaY *= 16
        scrollable.scrollBy({ top: deltaY, behavior: 'auto' })
      }
    }

    const SCROLL_SPEED = 0.7
    const FRICTION = 0.95
    const MIN_VELOCITY = 0.5

    let touchStartY = 0
    let velocity = 0
    let lastTouchTime = 0
    let momentumFrame = 0

    function stopMomentum(): void {
      if (momentumFrame !== 0) {
        cancelAnimationFrame(momentumFrame)
        momentumFrame = 0
      }
    }

    function startMomentum(scrollable: Element): void {
      stopMomentum()

      function tick(): void {
        velocity *= FRICTION
        if (Math.abs(velocity) < MIN_VELOCITY) {
          momentumFrame = 0
          return
        }

        const atTop = scrollable.scrollTop <= 0 && velocity < 0
        const atBottom =
          scrollable.scrollTop + scrollable.clientHeight >=
            scrollable.scrollHeight && velocity > 0

        if (atTop || atBottom) {
          momentumFrame = 0
          return
        }

        scrollable.scrollBy({ top: velocity, behavior: 'auto' })
        momentumFrame = requestAnimationFrame(tick)
      }

      momentumFrame = requestAnimationFrame(tick)
    }

    function handleTouchStart(e: TouchEvent): void {
      stopMomentum()
      touchStartY = e.touches[0].clientY
      velocity = 0
      lastTouchTime = Date.now()
    }

    function handleTouchMove(e: TouchEvent): void {
      const scrollable = getScrollable()
      if (scrollable == null) return

      const touchY = e.touches[0].clientY
      const deltaY = (touchStartY - touchY) * SCROLL_SPEED
      touchStartY = touchY

      const now = Date.now()
      const dt = now - lastTouchTime
      if (dt > 0) velocity = (deltaY / dt) * 16
      lastTouchTime = now

      const atTop = scrollable.scrollTop <= 0 && deltaY < 0
      const atBottom =
        scrollable.scrollTop + scrollable.clientHeight >=
          scrollable.scrollHeight && deltaY > 0

      if (!atTop && !atBottom) {
        e.preventDefault()
        scrollable.scrollBy({ top: deltaY, behavior: 'auto' })
      }
    }

    function handleTouchEnd(): void {
      const scrollable = getScrollable()
      if (scrollable != null && Math.abs(velocity) > MIN_VELOCITY) {
        startMomentum(scrollable)
      }
    }

    overlay.addEventListener('wheel', handleWheel, { passive: true })
    overlay.addEventListener('touchstart', handleTouchStart, {
      passive: true
    })
    overlay.addEventListener('touchmove', handleTouchMove, { passive: false })
    overlay.addEventListener('touchend', handleTouchEnd, { passive: true })
    return () => {
      stopMomentum()
      overlay.removeEventListener('wheel', handleWheel)
      overlay.removeEventListener('touchstart', handleTouchStart)
      overlay.removeEventListener('touchmove', handleTouchMove)
      overlay.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isGuestPreview])

  const framePortalContent = (
    <FramePortal
      sx={{
        width: framePortal.width,
        height: framePortal.height,
        ...(!isGuestPreview && {
          borderRadius: framePortal.borderRadius
        })
      }}
      dir={rtl ? 'rtl' : 'ltr'}
    >
      <ThemeProvider
        themeName={ThemeName.journeyUi}
        themeMode={cardBlock?.themeMode ?? ThemeMode.dark}
        rtl={rtl}
        locale={locale}
      >
        <Box
          sx={{
            position: 'relative',
            height: '100%',
            borderRadius: framePortal.borderRadius,
            ...(isGuestPreview && {
              overflow: 'hidden',
              '--card-border-radius':
                typeof framePortal.borderRadius === 'number'
                  ? `${framePortal.borderRadius * 4}px`
                  : framePortal.borderRadius
            })
          }}
        >
          {config.showStepHeaderFooter && (
            <StepHeader
              steps={steps}
              selectedStep={step as unknown as TreeBlock<StepFields>}
              sx={isGuestPreview ? { mt: 2, px: 3 } : undefined}
            />
          )}
          <ThemeProvider
            themeName={cardBlock?.themeName ?? ThemeName.base}
            themeMode={cardBlock?.themeMode ?? ThemeMode.dark}
            rtl={rtl}
            locale={locale}
            nested
          >
            <BlockRenderer
              block={step}
              wrappers={{
                VideoWrapper,
                CardWrapper
              }}
            />
          </ThemeProvider>
          {config.showStepHeaderFooter && (
            <StepFooter
              selectedStep={step as unknown as TreeBlock<StepFields>}
            />
          )}
        </Box>
      </ThemeProvider>
    </FramePortal>
  )

  return (
    <Box
      sx={{
        ...cardSx,
        width: cardWidth,
        height: cardHeight,
        transform: isSelected ? `scale(${SELECTED_SCALE})` : 'scale(1)',
        transition: isSelected
          ? 'transform 0.3s ease, opacity 0.3s ease, box-shadow 0.3s ease'
          : 'box-shadow 0.3s ease',
        boxShadow:
          isSelected && selectedBoxShadow != null ? selectedBoxShadow : 'none',
        opacity: opacity != null && !isSelected ? opacity : 1
      }}
      onClick={() => onClick?.(step)}
      data-testid="TemplateCardPreviewItem"
    >
      <Box
        sx={{
          transform: baseTransform,
          transformOrigin: 'top left',
          borderRadius: framePortal.borderRadius,
          ...(isGuestPreview && { overflow: 'hidden' })
        }}
      >
        {isGuestPreview ? (
          <>
            <Box
              ref={overlayRef}
              sx={{
                position: 'absolute',
                display: 'block',
                width: framePortal.width,
                height: framePortal.height,
                zIndex: 2,
                cursor: 'grab',
                borderRadius: framePortal.borderRadius,
                touchAction: 'none'
              }}
            />
            <Box
              sx={{
                width: framePortal.width,
                height: framePortal.height,
                borderRadius: framePortal.borderRadius,
                overflow: 'hidden'
              }}
            >
              {framePortalContent}
            </Box>
          </>
        ) : (
          <>
            <Box
              sx={{
                position: 'absolute',
                display: 'block',
                width: framePortal.width,
                height: framePortal.height,
                zIndex: 2,
                cursor: 'grab',
                borderRadius: framePortal.borderRadius
              }}
            />
            {framePortalContent}
          </>
        )}
      </Box>
    </Box>
  )
}

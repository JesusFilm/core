import Box from '@mui/material/Box'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  ThemeMode,
  ThemeName
} from '../../../../../../__generated__/globalTypes'
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
}

const DEFAULT_LOGICAL_WIDTH = 485
const DEFAULT_LOGICAL_HEIGHT = 738

/**
 * Renders a single template step as a preview card inside a FramePortal.
 * Applies variant-based sizing, optional selection scale, and theme/RTL from the journey.
 * For variants with useFluidSizing, card dimensions are driven by the Swiper slide
 * container and the inner journey content is scaled dynamically via ResizeObserver.
 * Invokes onClick when the card is clicked.
 *
 * @returns A clickable card box containing the step content in a scaled frame.
 */
export function TemplateCardPreviewItem({
  step,
  variant,
  onClick,
  selectedStep
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
    useFluidSizing,
    framePortalLogicalSize
  } = config
  const isSelected = selectedStep?.id === step.id

  const logicalWidth = framePortalLogicalSize?.width ?? DEFAULT_LOGICAL_WIDTH
  const logicalHeight = framePortalLogicalSize?.height ?? DEFAULT_LOGICAL_HEIGHT

  const cardRef = useRef<HTMLDivElement>(null)
  const [fluidScale, setFluidScale] = useState(0)

  const handleResize = useCallback(
    (entries: ResizeObserverEntry[]) => {
      const entry = entries[0]
      if (entry == null) return
      const { width, height } = entry.contentRect
      if (width === 0 || height === 0) return
      setFluidScale(Math.min(width / logicalWidth, height / logicalHeight))
    },
    [logicalWidth, logicalHeight]
  )

  useEffect(() => {
    if (!useFluidSizing || cardRef.current == null) return

    const observer = new ResizeObserver(handleResize)
    observer.observe(cardRef.current)

    return () => {
      observer.disconnect()
    }
  }, [useFluidSizing, handleResize])

  if (useFluidSizing) {
    return (
      <Box
        ref={cardRef}
        sx={{
          ...cardSx,
          width: '100%',
          height: '100%',
          opacity: fluidScale === 0 ? 0 : 1
        }}
        onClick={() => onClick?.(step)}
        data-testid="TemplateCardPreviewItem"
      >
        {/* Spacer covers the full card to intercept pointer events */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            cursor: 'grab',
            borderRadius: framePortal.borderRadius
          }}
        />
        {/* Inner wrapper stays at logical size; transform scales it to fit the card */}
        <Box
          sx={{
            transform: `scale(${fluidScale})`,
            transformOrigin: 'top left',
            borderRadius: framePortal.borderRadius,
            width: logicalWidth,
            height: logicalHeight
          }}
        >
          <FramePortal
            sx={{
              width: logicalWidth,
              height: logicalHeight,
              borderRadius: framePortal.borderRadius
            }}
            dir={rtl ? 'rtl' : 'ltr'}
          >
            <ThemeProvider
              themeName={cardBlock?.themeName ?? ThemeName.base}
              themeMode={cardBlock?.themeMode ?? ThemeMode.dark}
              rtl={rtl}
              locale={locale}
            >
              <Box
                sx={{
                  height: '100%',
                  borderRadius: framePortal.borderRadius
                }}
              >
                <BlockRenderer
                  block={step}
                  wrappers={{
                    VideoWrapper,
                    CardWrapper
                  }}
                />
              </Box>
            </ThemeProvider>
          </FramePortal>
        </Box>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        ...cardSx,
        width: isSelected
          ? {
              xs: cardWidth.xs * SELECTED_SCALE,
              sm: cardWidth.sm * SELECTED_SCALE
            }
          : cardWidth,
        height: isSelected
          ? {
              xs: cardHeight.xs * SELECTED_SCALE,
              sm: cardHeight.sm * SELECTED_SCALE
            }
          : cardHeight,
        boxShadow: isSelected
          ? `0px 1px 8px 0px rgba(0, 0, 0, 0.2),
             0px 3px 3px 0px rgba(0, 0, 0, 0.12),
             0px 3px 4px 0px rgba(0, 0, 0, 0.14)`
          : 'none'
      }}
      onClick={() => onClick?.(step)}
      data-testid="TemplateCardPreviewItem"
    >
      <Box
        sx={{
          transform: framePortal.transform,
          transformOrigin: 'top left',
          borderRadius: framePortal.borderRadius
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            display: 'block',
            width: isSelected
              ? {
                  xs: framePortal.width.xs * SELECTED_SCALE,
                  sm: framePortal.width.sm * SELECTED_SCALE
                }
              : framePortal.width,
            height: isSelected
              ? {
                  xs: framePortal.height.xs * SELECTED_SCALE,
                  sm: framePortal.height.sm * SELECTED_SCALE
                }
              : framePortal.height,
            zIndex: 2,
            cursor: 'grab',
            borderRadius: framePortal.borderRadius
          }}
        />
        <FramePortal
          sx={{
            width: isSelected
              ? {
                  xs: framePortal.width.xs * SELECTED_SCALE,
                  sm: framePortal.width.sm * SELECTED_SCALE
                }
              : framePortal.width,
            height: isSelected
              ? {
                  xs: framePortal.height.xs * SELECTED_SCALE,
                  sm: framePortal.height.sm * SELECTED_SCALE
                }
              : framePortal.height,
            borderRadius: framePortal.borderRadius
          }}
          dir={rtl ? 'rtl' : 'ltr'}
        >
          <ThemeProvider
            themeName={cardBlock?.themeName ?? ThemeName.base}
            themeMode={cardBlock?.themeMode ?? ThemeMode.dark}
            rtl={rtl}
            locale={locale}
          >
            <Box
              sx={{
                height: '100%',
                borderRadius: framePortal.borderRadius
              }}
            >
              <BlockRenderer
                block={step}
                wrappers={{
                  VideoWrapper,
                  CardWrapper
                }}
              />
            </Box>
          </ThemeProvider>
        </FramePortal>
      </Box>
    </Box>
  )
}

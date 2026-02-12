import Box from '@mui/material/Box'
import { ReactElement } from 'react'

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

/**
 * Renders a single template step as a preview card inside a FramePortal.
 * Applies variant-based sizing, optional selection scale, and theme/RTL from the journey.
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
  const { cardWidth, cardHeight, framePortal, cardSx } = config
  const isSelected = selectedStep?.id === step.id

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
          : 'none',
      }}
      onClick={() => onClick?.(step)}
      data-testid="TemplateCardPreviewItem"
    >
      <Box
        sx={{
          transform: framePortal.transform,
          transformOrigin: 'top left', 
          borderRadius: framePortal.borderRadius, 
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
            borderRadius: framePortal.borderRadius,
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
            borderRadius: framePortal.borderRadius,
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
                borderRadius: framePortal.borderRadius,
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

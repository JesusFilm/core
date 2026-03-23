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
import { StepFooter } from '../../../../StepFooter'
import { StepHeader } from '../../../../StepHeader'
import { StepFields } from '../../../../Step/__generated__/StepFields'
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

  const baseTransform = {
    xs: `scale(${framePortal.scale.xs})`,
    sm: `scale(${framePortal.scale.sm})`
  }

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
          borderRadius: framePortal.borderRadius
        }}
      >
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
        <FramePortal
          sx={{
            width: framePortal.width,
            height: framePortal.height,
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
                position: 'relative',
                height: '100%',
                borderRadius: framePortal.borderRadius
              }}
            >
              {config.showStepHeaderFooter && (
                <StepHeader
                  steps={steps}
                  selectedStep={step as unknown as TreeBlock<StepFields>}
                />
              )}
              <BlockRenderer
                block={step}
                wrappers={{
                  VideoWrapper,
                  CardWrapper
                }}
              />
              {config.showStepHeaderFooter && (
                <StepFooter
                  selectedStep={step as unknown as TreeBlock<StepFields>}
                />
              )}
            </Box>
          </ThemeProvider>
        </FramePortal>
      </Box>
    </Box>
  )
}

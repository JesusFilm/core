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
  VARIANT_CONFIGS,
  type TemplateCardPreviewVariant
} from '../templateCardPreviewConfig'

export interface TemplateCardPreviewItemProps {
  step: TreeBlock<StepBlock>
  variant: TemplateCardPreviewVariant
  onClick?: (step: TreeBlock<StepBlock>) => void
  selectedStep?: TreeBlock<StepBlock> | null
}

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
          ? { xs: cardWidth.xs * SELECTED_SCALE, sm: cardWidth.sm * SELECTED_SCALE }
          : cardWidth,
        height: isSelected
          ? { xs: cardHeight.xs * SELECTED_SCALE, sm: cardHeight.sm * SELECTED_SCALE }
          : cardHeight,
        borderRadius: framePortal.borderRadius
      }}
      onClick={() => onClick?.(step)}
      data-testid="TemplateCardPreviewItem"
    >
      <Box
        sx={{
          transform: framePortal.transform,
          transformOrigin: 'top left'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            display: 'block',
            width: framePortal.width,
            height: framePortal.height,
            zIndex: 2,
            cursor: 'grab'
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
                borderRadius: 4
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

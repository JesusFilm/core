import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
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
import { InformationButton } from '../../../../StepHeader/InformationButton'
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
  stepIndex?: number
  stepsCount?: number
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
  selectedStep,
  stepIndex,
  stepsCount
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
            {stepIndex != null && stepsCount != null && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    width: '100%',
                    zIndex: 1
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    sx={{
                      position: 'absolute',
                      top: 13,
                      width: '100%'
                    }}
                  >
                    {Array.from({ length: stepsCount }).map((_, i) => {
                      const distance = Math.abs(i - stepIndex)
                      const size =
                        distance === 0
                          ? 8
                          : distance === 1
                            ? 6
                            : distance === 2
                              ? 4
                              : 3
                      const opacity =
                        distance === 0
                          ? 1
                          : distance === 1
                            ? 0.6
                            : distance === 2
                              ? 0.4
                              : 0.25
                      return (
                        <Box
                          key={i}
                          sx={{
                            width: size,
                            height: size,
                            borderRadius: '50%',
                            mx: '3px',
                            backgroundColor: 'primary.main',
                            opacity,
                            transition: 'width 0.2s, height 0.2s, opacity 0.2s'
                          }}
                        />
                      )
                    })}
                  </Stack>
                  <InformationButton sx={{ px: 6, float: 'right' }} />
                </Box>
              )}
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
            {journey?.title != null && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 1,
                  pl: 4,
                  pr: 6,
                  py: 2
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: 'primary.main',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    fontSize: '7px',
                    lineHeight: 1.4,
                    letterSpacing: '0.5px'
                  }}
                >
                  {journey.title}
                </Typography>
              </Box>
            )}
          </ThemeProvider>
        </FramePortal>
      </Box>
    </Box>
  )
}

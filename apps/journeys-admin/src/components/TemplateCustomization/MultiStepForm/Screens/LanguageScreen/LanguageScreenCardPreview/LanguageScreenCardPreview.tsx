import { ReactElement, useMemo } from 'react'

import Box from '@mui/material/Box'

import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { CardWrapper } from '@core/journeys/ui/CardWrapper'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TreeBlock } from '@core/journeys/ui/block'
import { getStepTheme } from '@core/journeys/ui/getStepTheme'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { transformer } from '@core/journeys/ui/transformer'
import { VideoWrapper } from '@core/journeys/ui/VideoWrapper'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider/ThemeProvider'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from 'libs/journeys/ui/__generated__/globalTypes'
import { StepFields } from '@core/journeys/ui/Step/__generated__/StepFields'

export function LanguageScreenCardPreview(): ReactElement {
  const { journey } = useJourney()
  const { rtl, locale } = getJourneyRTL(journey)

  const steps = useMemo(
    () =>
      journey != null
        ? (transformer(journey.blocks ?? []) as Array<TreeBlock<StepBlock>>)
        : undefined,
    [journey]
  )

  const firstStep = useMemo(
    () =>
      (steps?.find(
        (block) => block.__typename === 'StepBlock' && block.parentOrder === 0
      ) as TreeBlock<StepFields> | undefined) ?? undefined,
    [steps]
  )

  const cardBlock = useMemo(
    () =>
      (firstStep?.children.find(
        (child) => child.__typename === 'CardBlock'
      ) as unknown as TreeBlock<CardBlock> | undefined) ?? undefined,
    [firstStep]
  )

  const theme = useMemo(
    () => (firstStep != null ? getStepTheme(firstStep, journey) : null),
    [firstStep, journey]
  )

  const journeyTheme = journey?.journeyTheme
  const fontFamilies = useMemo(() => {
    if (journeyTheme == null) return

    return {
      headerFont: journeyTheme?.headerFont ?? '',
      bodyFont: journeyTheme?.bodyFont ?? '',
      labelFont: journeyTheme?.labelFont ?? ''
    }
  }, [journeyTheme])

  const wrappers = useMemo(
    () => ({
      VideoWrapper,
      CardWrapper
    }),
    []
  )

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          width: { xs: 194, sm: 267 },
          height: { xs: 295, sm: 404 },
          backgroundColor: 'background.default',
          borderRadius: 3,
          mx: 'auto'
        }}
      >
        <Box
          sx={{
            transform: { xs: 'scale(0.4)', sm: 'scale(0.6)' },
            transformOrigin: 'top left'
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              display: 'block',
              width: { xs: 485, sm: 445 },
              height: { xs: 738, sm: 673 },
              zIndex: 2
            }}
          />
          <FramePortal
            sx={{
              width: { xs: 485, sm: 445 },
              height: { xs: 738, sm: 673 }
            }}
            dir={rtl ? 'rtl' : 'ltr'}
          >
            <ThemeProvider
              themeName={
                cardBlock?.themeName ?? theme?.themeName ?? ThemeName.base
              }
              themeMode={
                cardBlock?.themeMode ?? theme?.themeMode ?? ThemeMode.dark
              }
              fontFamilies={fontFamilies}
              rtl={rtl}
              locale={locale}
            >
              <Box
                sx={{
                  height: '100%',
                  borderRadius: 4
                }}
              >
                <BlockRenderer block={firstStep} wrappers={wrappers} />
              </Box>
            </ThemeProvider>
          </FramePortal>
        </Box>
      </Box>
    </Box>
  )
}

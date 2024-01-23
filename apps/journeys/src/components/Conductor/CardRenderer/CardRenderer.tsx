import Box from '@mui/material/Box'
import { ReactElement, useEffect, useState } from 'react'

import { TreeBlock, useBlocks } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { ThemeMode, ThemeName } from '@core/shared/ui/themes'

import { StepFields } from '../../../../__generated__/StepFields'

interface CardRendererProps {
  themeName: ThemeName
  themeMode: ThemeMode
}

export function CardRenderer({
  themeName,
  themeMode
}: CardRendererProps): ReactElement {
  const { blockHistory, getNextBlock } = useBlocks()
  const { journey } = useJourney()
  const { locale, rtl } = getJourneyRTL(journey)

  const getCurrentActiveBlock = (): TreeBlock<StepFields> =>
    blockHistory[blockHistory.length - 1] as TreeBlock<StepFields>
  const getPreviousBlock = (): TreeBlock<StepFields> =>
    blockHistory[blockHistory.length - 2] as TreeBlock<StepFields>

  const activeBlock = getCurrentActiveBlock()

  const previousBlock = getPreviousBlock()

  const nextBlock = getNextBlock({ activeBlock })

  const Wrapper = ({ children }): ReactElement => (
    <Box sx={{ border: '1px solid white' }}>{children}</Box>
  )

  return (
    <ThemeProvider
      themeName={themeName}
      themeMode={themeMode}
      locale={locale}
      rtl={rtl}
      nested
    >
      <Wrapper>
        <BlockRenderer block={previousBlock} />
      </Wrapper>

      <Wrapper>
        <BlockRenderer block={activeBlock} />
      </Wrapper>

      <Wrapper>
        <BlockRenderer block={nextBlock} />
      </Wrapper>
    </ThemeProvider>
  )
}

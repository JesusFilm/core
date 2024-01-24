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
  const [activeBlock, setActiveBlock] = useState<TreeBlock<StepFields>>()
  const [previousBlock, setPreviousBlock] = useState<TreeBlock<StepFields>>()
  const [nextBlock, setNextBlock] = useState<TreeBlock<StepFields>>()

  const getCurrentActiveBlock = (): TreeBlock<StepFields> =>
    blockHistory[blockHistory.length - 1] as TreeBlock<StepFields>
  const getPreviousBlock = (): TreeBlock<StepFields> =>
    blockHistory[blockHistory.length - 2] as TreeBlock<StepFields>

  useEffect(() => {
    const currentBlock = getCurrentActiveBlock()

    if (previousBlock != null && previousBlock.id === currentBlock.id) {
      setActiveBlock(previousBlock)
      setPreviousBlock(getPreviousBlock())
      setNextBlock(activeBlock)
    } else if (nextBlock != null && nextBlock.id === currentBlock.id) {
      setActiveBlock(nextBlock)
      setPreviousBlock(activeBlock)
      setNextBlock(getNextBlock({ activeBlock: nextBlock }))
    } else {
      setActiveBlock(currentBlock)
      setPreviousBlock(getPreviousBlock())
      setNextBlock(getNextBlock({ activeBlock: currentBlock }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockHistory])

  return (
    <ThemeProvider
      themeName={themeName}
      themeMode={themeMode}
      locale={locale}
      rtl={rtl}
      nested
    >
      <Box sx={{ width: 0, height: 0 }}>
        <BlockRenderer block={previousBlock} />
      </Box>

      <BlockRenderer block={activeBlock} />

      <Box sx={{ width: 0, height: 0 }}>
        <BlockRenderer block={nextBlock} />
      </Box>
    </ThemeProvider>
  )
}

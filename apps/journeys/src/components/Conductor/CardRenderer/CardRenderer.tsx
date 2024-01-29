import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import { ReactElement } from 'react'

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
  const { blockHistory, treeBlocks, getNextBlock } = useBlocks()
  const { journey } = useJourney()
  const { locale, rtl } = getJourneyRTL(journey)

  const getCurrentActiveBlock = (): TreeBlock<StepFields> =>
    blockHistory[blockHistory.length - 1] as TreeBlock<StepFields>
  const getPreviousBlock = (): TreeBlock<StepFields> =>
    blockHistory[blockHistory.length - 2] as TreeBlock<StepFields>

  const currentBlock = getCurrentActiveBlock()
  const previousBlock = getPreviousBlock()
  const nextBlock = getNextBlock({ activeBlock: currentBlock })

  return (
    <ThemeProvider
      themeName={themeName}
      themeMode={themeMode}
      locale={locale}
      rtl={rtl}
      nested
    >
      {treeBlocks.map((block) => {
        return (
          <Fade key={block.id} in={block.id === currentBlock.id}>
            {block.id === currentBlock.id ||
            block.id === nextBlock?.id ||
            block.id === previousBlock?.id ? (
              <Box
                sx={{
                  height: block.id === currentBlock.id ? 'inherit' : 0,
                  width: block.id === currentBlock.id ? 'inherit' : 0
                }}
              >
                <BlockRenderer block={block} />
              </Box>
            ) : (
              <></>
            )}
          </Fade>
        )
      })}
    </ThemeProvider>
  )
}

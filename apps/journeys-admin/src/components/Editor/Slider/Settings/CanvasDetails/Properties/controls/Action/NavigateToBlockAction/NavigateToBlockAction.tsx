import Box from '@mui/material/Box'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import { transformer } from '@core/journeys/ui/transformer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName
} from '../../../../../../../../../../__generated__/globalTypes'
import { FramePortal } from '../../../../../../../../FramePortal'

const CARD_WIDTH = 340

export function NavigateToBlockAction(): ReactElement {
  const {
    state: { steps, selectedBlock }
  } = useEditor()
  const { journey } = useJourney()
  const currentBlock = selectedBlock as
    | TreeBlock<ButtonBlock>
    | TreeBlock<VideoBlock>
    | undefined

  const currentActionStep =
    steps?.find(
      ({ id }) =>
        currentBlock?.action?.__typename === 'NavigateToBlockAction' &&
        id === currentBlock?.action?.blockId
    ) ?? undefined

  return (
    <Box
      sx={{
        transform: 'scale(0.25)',
        transformOrigin: 'top left'
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          display: 'block',
          width: 380,
          height: 560,
          zIndex: 2,
          cursor: 'pointer'
        }}
      />
      <FramePortal width={380} height={560}>
        <ThemeProvider
          themeName={journey?.themeName ?? ThemeName.base}
          themeMode={journey?.themeMode ?? ThemeMode.dark}
          // rtl={rtl}
          // locale={locale}
        >
          <Box sx={{ p: 4, height: '100%', borderRadius: 4 }}>
            <BlockRenderer
              block={selectedBlock}
              wrappers={{
                ImageWrapper: NullWrapper,
                VideoWrapper: NullWrapper
              }}
            />
          </Box>
        </ThemeProvider>
      </FramePortal>
    </Box>
  )
}

function NullWrapper({ children }): ReactElement {
  return <fieldset disabled>{children}</fieldset>
}

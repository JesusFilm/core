import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import {
  ThemeName,
  ThemeMode
} from '../../../../../../__generated__/globalTypes'
import { FramePortal } from '../../../../FramePortal'

// const CARD_WIDTH = 360

export function EmbedCardPreview(): ReactElement {
  const { journey } = useJourney()
  const block = transformer(journey?.blocks as TreeBlock[])?.[0]
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  return (
    <Box
      sx={{
        transform: smUp ? 'scale(0.5)' : 'scale(0.8)',
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        transformOrigin: smUp ? '15% top' : null
      }}
    >
      {/* <Box
        sx={{
          backgroundColor: '#DCDDE5',
          width: CARD_WIDTH - 50,
          height: 10,
          borderRadius: '16px 16px 0 0',
          ml: 6
        }}
      />
      <Box
        sx={{
          backgroundColor: '#AAACBB',
          width: CARD_WIDTH - 25,
          height: 10,
          borderRadius: '16px 16px 0 0',
          ml: 3
        }}
      /> */}
      <FramePortal height={520}>
        <ThemeProvider
          themeName={journey?.themeName ?? ThemeName.base}
          themeMode={journey?.themeMode ?? ThemeMode.light}
        >
          {block != null && (
            <BlockRenderer
              block={block}
              wrappers={{
                ImageWrapper: NullWrapper,
                VideoWrapper: NullWrapper
              }}
            />
          )}
        </ThemeProvider>
      </FramePortal>
    </Box>
  )
}

function NullWrapper({ children }): ReactElement {
  return <fieldset disabled>{children}</fieldset>
}

import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { transformer } from '@core/journeys/ui/transformer'
import { FramePortal } from '../../../../FramePortal'
import {
  ThemeName,
  ThemeMode
} from '../../../../../../__generated__/globalTypes'

export function EmbedCardPreview(): ReactElement {
  const { journey } = useJourney()
  const block = transformer(journey?.blocks as TreeBlock[])?.[0]

  return (
    <Box>
      <FramePortal width={250} height={'100%'}>
        <ThemeProvider
          themeName={journey?.themeName ?? ThemeName.base}
          themeMode={journey?.themeMode ?? ThemeMode.light}
        >
          <BlockRenderer
            block={block}
            wrappers={{
              ImageWrapper: NullWrapper,
              VideoWrapper: NullWrapper
            }}
          />
        </ThemeProvider>
      </FramePortal>
    </Box>
  )
}

function NullWrapper({ children }): ReactElement {
  return <fieldset disabled>{children}</fieldset>
}

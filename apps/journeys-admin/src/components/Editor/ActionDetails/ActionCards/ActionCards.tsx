import { ReactElement } from 'react'
import Box from '@mui/material/Box'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { getJourneyRTL } from '@core/journeys/ui/rtl'
import type { TreeBlock } from '@core/journeys/ui/block'
import { transformer } from '@core/journeys/ui/transformer'
import Typography from '@mui/material/Typography'
import { FramePortal } from '../../../FramePortal'
import { ThemeMode, ThemeName } from '../../../../../__generated__/globalTypes'

interface ActionCardsProps {
  url: string
  parentBlockId: string
}

export function ActionCards({
  url,
  parentBlockId
}: ActionCardsProps): ReactElement {
  const { journey } = useJourney()
  const { rtl } = getJourneyRTL(journey)
  const blocks = transformer(journey?.blocks as TreeBlock[])
  const smUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))

  // TODO:
  // Write a function that gets the cards that are related to the url
  // render the name of the component that the URL is being used
  // render the label of the compomnent that the URL is being used

  return (
    <>
      <Typography>It appears on following cards and elements: </Typography>
      {blocks?.map((block) => (
        <Box
          key={block.id}
          sx={{
            width: 104,
            position: 'relative',
            height: 154,
            mb: 2,
            overflow: 'hidden',
            borderRadius: 3,
            outline: '1px solid #DEDFE0',
            outlineOffset: '-4px'
          }}
        >
          {block != null && (
            <Box
              sx={{
                transform: 'scale(0.25)',
                transformOrigin: '12% 3%'
              }}
            >
              <FramePortal width={340} height={520} dir={rtl ? 'rtl' : 'ltr'}>
                <ThemeProvider
                  themeName={journey?.themeName ?? ThemeName.base}
                  themeMode={journey?.themeMode ?? ThemeMode.light}
                >
                  <Box sx={{ height: '100%' }}>
                    <BlockRenderer
                      block={block}
                      wrappers={{
                        ImageWrapper: NullWrapper,
                        VideoWrapper: NullWrapper
                      }}
                    />
                  </Box>
                </ThemeProvider>
              </FramePortal>
            </Box>
          )}
        </Box>
      ))}
    </>
  )
}

function NullWrapper({ children }): ReactElement {
  return <fieldset disabled>{children}</fieldset>
}

// can you write a chain array function that returns the object in an array that contains this parent block id

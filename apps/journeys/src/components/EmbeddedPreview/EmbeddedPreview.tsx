import { ReactElement, useRef } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'

// Used to resolve dynamic viewport height on Safari
import Div100vh from 'react-div-100vh'
import { Footer } from '../Footer'
import useFullscreenStatus from '../../libs/useFullscreenStatus/useFullscreenStatus'
import { Conductor } from '../Conductor'

export interface EmbeddedPreviewProps {
  blocks: TreeBlock[]
}

export function EmbeddedPreview({
  blocks
}: EmbeddedPreviewProps): ReactElement {
  const maximizableElement = useRef(null)
  const theme = useTheme()

  let isFullscreen: boolean, setIsFullscreen
  try {
    ;[isFullscreen, setIsFullscreen] = useFullscreenStatus(maximizableElement)
  } catch {
    isFullscreen = false
  }

  return (
    <>
      <Div100vh>
        <button onClick={() => setIsFullscreen(!isFullscreen)}>
          Fullscreen
        </button>
        <Stack
          sx={{
            justifyContent: 'center',
            height: '100%',
            flexDirection: { lg: 'column-reverse' }
          }}
        >
          <Box
            sx={{
              pt: { sm: 0, xs: 6 },
              flexGrow: 1,
              display: 'flex',
              [theme.breakpoints.only('sm')]: {
                maxHeight: '460px'
              },
              [theme.breakpoints.up('md')]: {
                maxHeight: '480px'
              }
            }}
          >
            {!isFullscreen && (
              <BlockRenderer
                block={blocks?.[0]}
                wrappers={{
                  ImageWrapper: NullWrapper,
                  VideoWrapper: NullWrapper
                }}
              />
            )}

            <div ref={maximizableElement}>
              {isFullscreen && <Conductor blocks={blocks} />}
            </div>
          </Box>
        </Stack>
      </Div100vh>
      <Box
        sx={{
          px: 2,
          pb: 2
        }}
      >
        <Footer />
      </Box>
    </>
  )
}

function NullWrapper({ children }): ReactElement {
  return <fieldset disabled>{children}</fieldset>
}

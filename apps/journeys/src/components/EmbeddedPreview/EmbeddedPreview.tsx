import { ReactElement, useEffect, useRef } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { useRouter } from 'next/router'
import IconButton from '@mui/material/IconButton'
import Close from '@mui/icons-material/Close'

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
  let isFullscreen: boolean, setIsFullscreen
  try {
    ;[isFullscreen, setIsFullscreen] = useFullscreenStatus(maximizableElement)
  } catch {
    isFullscreen = false
  }

  // use router internally on this component as it does not function properly when passed as prop
  const router = useRouter()
  const once = useRef(false)

  useEffect(() => {
    if (!once.current && router?.query?.autoexpand === 'true') {
      setIsFullscreen(true)
      once.current = true
    }
  })

  return (
    <>
      <Div100vh data-testid="embedded-preview">
        <Stack
          sx={{
            justifyContent: 'center',
            height: '100%'
          }}
        >
          <Box
            sx={{
              p: 8,
              flexGrow: 1,
              display: 'flex',
              cursor: 'pointer'
            }}
            onClick={() => setIsFullscreen(true)}
          >
            {!isFullscreen && (
              <BlockRenderer
                data-testid="embedded-preview-block-renderer"
                block={blocks?.[0]}
                wrappers={{
                  ImageWrapper: NullWrapper,
                  VideoWrapper: NullWrapper
                }}
              />
            )}
          </Box>
          <Box
            ref={maximizableElement}
            sx={{
              backgroundColor: (theme) => theme.palette.background.default
            }}
          >
            {isFullscreen && (
              <>
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    color: (theme) => theme.palette.text.primary
                  }}
                  onClick={() => setIsFullscreen(false)}
                >
                  <Close />
                </IconButton>
                <Conductor blocks={blocks} />
              </>
            )}
          </Box>

          <Box
            sx={{
              px: 8,
              pb: 2
            }}
          >
            <Footer />
          </Box>
        </Stack>
      </Div100vh>
    </>
  )
}

function NullWrapper({ children }): ReactElement {
  return <fieldset disabled>{children}</fieldset>
}

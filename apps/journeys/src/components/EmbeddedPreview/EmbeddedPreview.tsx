import Close from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import isFunction from 'lodash/isFunction'
import { ReactElement, useEffect, useState } from 'react'
import { use100vh } from 'react-div-100vh'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { JourneyProvider, useJourney } from '@core/journeys/ui/JourneyProvider'
import { StepFooter } from '@core/journeys/ui/StepFooter'

import { Conductor } from '../Conductor'

import { ButtonWrapper } from './ButtonWrapper/ButtonWrapper'
import { RadioOptionWrapper } from './RadioOptionWrapper/RadioOptionWrapper'
import { VideoWrapper } from './VideoWrapper/VideoWrapper'

interface EmbeddedPreviewProps {
  blocks: TreeBlock[]
}

export function EmbeddedPreview({
  blocks
}: EmbeddedPreviewProps): ReactElement {
  const { journey, variant } = useJourney()

  const viewportHeight = use100vh()
  const [isFullWindow, setIsFullWindow] = useState(false)

  useEffect(() => {
    function onFullscreenChange(): void {
      setIsFullWindow(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () =>
      document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  async function requestFullscreen(): Promise<void> {
    const elem = document.documentElement

    /* View in fullscreen */
    if (isFunction(elem.requestFullscreen)) {
      await elem.requestFullscreen()
      setIsFullWindow(true)
    } else if (isFunction(elem.webkitRequestFullscreen)) {
      /* Safari */
      await elem.webkitRequestFullscreen()
      setIsFullWindow(true)
    } else if (isFunction(elem.msRequestFullscreen)) {
      /* IE11 */
      await elem.msRequestFullscreen()
      setIsFullWindow(true)
    }
  }

  async function exitFullscreen(): Promise<void> {
    /* View in fullscreen */
    if (isFunction(document.exitFullscreen)) {
      await document.exitFullscreen()
      setIsFullWindow(false)
    } else if (isFunction(document.mozCancelFullScreen)) {
      await document.mozCancelFullScreen()
      setIsFullWindow(false)
    } else if (isFunction(document.webkitExitFullscreen)) {
      await document.webkitExitFullscreen()
      setIsFullWindow(false)
    } else if (isFunction(document.msExitFullscreen)) {
      await document.msExitFullscreen()
      setIsFullWindow(false)
    }
  }

  const ClickableCard = (): ReactElement => (
    <Box
      sx={{
        p: 8,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        zindex: 10,
        height: '100%'
      }}
      onClick={requestFullscreen}
    >
      <Box
        sx={{
          mx: 'auto',
          mb: 0,
          height: 6.5,
          width: '82.5%',
          backgroundColor: '#AAACBB',
          borderRadius: '16px 16px 0 0',
          opacity: 0.3
        }}
      />
      <Box
        sx={{
          mx: 'auto',
          mb: 0,
          height: 6.5,
          width: '90%',
          backgroundColor: '#AAACBB',
          borderRadius: '16px 16px 0 0',
          opacity: 0.6
        }}
      />
      <Box
        sx={{
          height: '100%',
          width: '100%',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <BlockRenderer
          data-testid="embedded-preview-block-renderer"
          block={blocks?.[0]}
          wrappers={{
            ButtonWrapper,
            RadioOptionWrapper,
            VideoWrapper
          }}
        />
        <StepFooter />
      </Box>
    </Box>
  )

  return (
    <>
      <style jsx global>{`
        body {
          background: transparent;
        }
      `}</style>
      <style jsx>{`
        .MuiPaper-elevation {
          box-shadow: none !important;
        }
      `}</style>
      <Box
        data-testid="EmbeddedPreview"
        sx={{
          height: viewportHeight ?? '100vh',
          minHeight: '-webkit-fill-available'
        }}
      >
        {!isFullWindow && <ClickableCard />}
        <Box
          id="embed-fullscreen-container"
          sx={{
            backgroundColor: 'background.default',
            overflow: 'hidden'
          }}
        >
          {isFullWindow && (
            <>
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: variant === 'default' ? 'env(safe-area-inset-left)' : 0,
                  zIndex: 1000,
                  color: 'text.primary'
                }}
                onClick={exitFullscreen}
              >
                <Close />
              </IconButton>
              <JourneyProvider value={{ journey, variant: 'default' }}>
                <Conductor blocks={blocks} />
              </JourneyProvider>
            </>
          )}
        </Box>
      </Box>
    </>
  )
}

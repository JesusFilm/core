import Close from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import isFunction from 'lodash/isFunction'
import { ReactElement, useEffect, useState } from 'react'
import { use100vh } from 'react-div-100vh'

import { JourneyRenderer } from '../JourneyRenderer'

import { ClickableCard } from './ClickableCard'

interface EmbeddedPreviewProps {
  disableFullscreen?: boolean
}

export function EmbeddedPreview({
  disableFullscreen
}: EmbeddedPreviewProps): ReactElement {
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
    // eslint-disable-next-line @typescript-eslint/unbound-method
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
    // eslint-disable-next-line @typescript-eslint/unbound-method
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
        <ClickableCard
          onClick={requestFullscreen}
          fullscreen={isFullWindow}
          disableFullscreen={disableFullscreen}
        >
          {isFullWindow && (
            <IconButton
              data-testid="CloseIconButton"
              sx={{
                position: 'absolute',
                top: 0,
                left: 'env(safe-area-inset-left)',
                zIndex: 1000,
                color: 'text.primary'
              }}
              onClick={exitFullscreen}
            >
              <Close />
            </IconButton>
          )}
          <JourneyRenderer />
        </ClickableCard>
      </Box>
    </>
  )
}

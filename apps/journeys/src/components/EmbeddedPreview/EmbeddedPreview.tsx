import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
import { FramePortal } from '@core/journeys/ui/FramePortal'
import { useRouter } from 'next/router'
import IconButton from '@mui/material/IconButton'
import Close from '@mui/icons-material/Close'

// Used to resolve dynamic viewport height on Safari
import Div100vh from 'react-div-100vh'
import useFullscreenStatus from '../../libs/useFullscreenStatus/useFullscreenStatus'
import { Conductor } from '../Conductor'

import { ButtonWrapper } from './ButtonWrapper/ButtonWrapper'
import { VideoWrapper } from './VideoWrapper/VideoWrapper'
import { RadioOptionWrapper } from './RadioOptionWrapper/RadioOptionWrapper'

interface EmbeddedPreviewProps {
  blocks: TreeBlock[]
  rtl?: boolean
}

export function EmbeddedPreview({
  blocks,
  rtl = false
}: EmbeddedPreviewProps): ReactElement {
  const maximizableElement = useRef(null)
  const [allowFullscreen, setAllowFullscreen] = useState(true)
  let isFullscreen: boolean, setIsFullscreen
  // Safari / iPhone fullscreen check
  const [isFullContainer, setIsFullContainer] = useState(false)
  let canFullscreen = true
  try {
    // Chrome / Firefox fullscreen check
    ;[isFullscreen, setIsFullscreen] = useFullscreenStatus(maximizableElement)
  } catch {
    isFullscreen = false
    canFullscreen = false
  }

  const maximizeView = useCallback(
    (value: boolean) => {
      if (canFullscreen) {
        setIsFullscreen(value)
        // TODO: Remove this check once allow="fullscreen" works with Safari 16+
      } else {
        setIsFullContainer(value)
        window.parent.postMessage(value, '*')
      }
    },
    [canFullscreen, setIsFullscreen, setIsFullContainer]
  )

  // use router internally on this component as it does not function properly when passed as prop
  /* Supports params: 
      "padding" - removes padding around clickable card
      "rtl" - enables right to left embed display
  **/

  const router = useRouter()
  const once = useRef(false)

  const handleClick = useCallback((): void => {
    if (allowFullscreen) maximizeView(true)
  }, [allowFullscreen, maximizeView])

  useEffect(() => {
    if (!once.current) {
      if (router?.query?.preview === 'true') {
        setAllowFullscreen(false)
        once.current = true
      }
      if (router?.query?.autoexpand === 'true') {
        handleClick()
        once.current = true
      }
    }
  }, [setAllowFullscreen, handleClick, router?.query])

  const ClickableCard = (): ReactElement => (
    <Box
      sx={{
        p:
          router.query.padding == null || router.query.padding === 'true'
            ? 8
            : 0.75,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        cursor: allowFullscreen ? 'pointer' : 'default',
        zindex: 10,
        height: '100%'
      }}
      onClick={() => handleClick()}
    >
      <Box
        sx={{
          mx: 'auto',
          mb: 0,
          height: 6.5,
          width: '82.5%',
          backgroundColor: 'rgba(220,222,229)',
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
          backgroundColor: 'rgba(170,172,287)',
          borderRadius: '16px 16px 0 0',
          opacity: 0.3
        }}
      />
      <Box
        sx={{
          height: '100%',
          width: '100%',
          borderRadius: '16px',
          border: '1px solid rgba(186, 186, 187, 0.5)'
        }}
      >
        <BlockRenderer
          data-testid="embedded-preview-block-renderer"
          block={blocks?.[0]}
          wrappers={{
            ButtonWrapper,
            ImageWrapper: NullWrapper,
            RadioOptionWrapper,
            VideoWrapper
          }}
        />
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
      <Div100vh data-testid="embedded-preview" style={{ overflow: 'hidden' }}>
        {!(isFullscreen || isFullContainer) && (
          <FramePortal width="100%" height="100%" dir={rtl ? 'rtl' : 'ltr'}>
            <ClickableCard />
          </FramePortal>
        )}
        <Box
          ref={maximizableElement}
          sx={{
            backgroundColor: 'background.default',
            overflow: 'hidden'
          }}
        >
          {(isFullscreen || isFullContainer) && (
            <>
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  zIndex: 1000,
                  color: 'text.primary'
                }}
                onClick={() => {
                  maximizeView(false)
                }}
              >
                <Close />
              </IconButton>
              <Conductor blocks={blocks} />
            </>
          )}
        </Box>
      </Div100vh>
    </>
  )
}

function NullWrapper({ children }): ReactElement {
  return <fieldset disabled>{children}</fieldset>
}

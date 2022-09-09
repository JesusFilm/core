import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
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

export interface EmbeddedPreviewProps {
  blocks: TreeBlock[]
}

export function EmbeddedPreview({
  blocks
}: EmbeddedPreviewProps): ReactElement {
  const maximizableElement = useRef(null)
  const [allowFullscreen, setAllowFullscreen] = useState(true)
  let isFullscreen: boolean, setIsFullscreen
  const [isFullContainer, setIsFullContainer] = useState(false)
  let canFullscreen = true
  try {
    ;[isFullscreen, setIsFullscreen] = useFullscreenStatus(maximizableElement)
  } catch {
    isFullscreen = false
    canFullscreen = false
  }
  const [previousContainerDimensions, setPreviousContainerDimensions] =
    useState({
      width: 0,
      height: 0
    })

  const maximizeView = useCallback(
    (value: boolean) => {
      if (canFullscreen) {
        setIsFullscreen(value)
      } else {
        setIsFullContainer(value)
        const iframeContainer = window.parent.document.getElementById(
          'jfm-iframe-container'
        )
        if (iframeContainer != null) {
          if (value) {
            setPreviousContainerDimensions({
              width: iframeContainer.offsetWidth,
              height: iframeContainer.offsetHeight
            })
            iframeContainer.style.height = '100vh'
            iframeContainer.style.width = '100vw'
          } else {
            iframeContainer.style.height =
              previousContainerDimensions.height.toString() + 'px'
            iframeContainer.style.width =
              previousContainerDimensions.width.toString() + 'px'
          }
        }
      }
    },
    [
      canFullscreen,
      setIsFullscreen,
      setIsFullContainer,
      previousContainerDimensions
    ]
  )

  // use router internally on this component as it does not function properly when passed as prop
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
        p: 8,
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
            ButtonWrapper: ButtonWrapper,
            ImageWrapper: NullWrapper,
            RadioOptionWrapper: RadioOptionWrapper,
            VideoWrapper: VideoWrapper
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
      <Div100vh data-testid="embedded-preview">
        {!(isFullscreen || isFullContainer) && <ClickableCard />}
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
                  color: (theme) => theme.palette.text.primary
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

import Close from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { useRouter } from 'next/router'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'
import Div100vh from 'react-div-100vh'

import type { TreeBlock } from '@core/journeys/ui/block'
import { BlockRenderer } from '@core/journeys/ui/BlockRenderer'
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
  const maximizableElement = useRef(null)
  const [allowFullWindow, setAllowFullWindow] = useState(true)
  // Use full container / fullWindow mode over fullScreen to avoid video playback issues
  const [isFullWindow, setIsFullWindow] = useState(false)

  const maximizeView = useCallback(
    (value: boolean) => {
      setIsFullWindow(value)
      window.parent.postMessage(value, '*')
    },
    [setIsFullWindow]
  )

  // use router internally on this component as it does not function properly when passed as prop
  const router = useRouter()
  const once = useRef(false)

  const handleClick = useCallback((): void => {
    if (allowFullWindow) maximizeView(true)
  }, [allowFullWindow, maximizeView])

  useEffect(() => {
    if (!once.current) {
      if (router?.query?.preview === 'true') {
        setAllowFullWindow(false)
        once.current = true
      }
      if (router?.query?.autoexpand === 'true') {
        handleClick()
        once.current = true
      }
    }
  }, [setAllowFullWindow, handleClick, router?.query])

  const ClickableCard = (): ReactElement => (
    <Box
      sx={{
        p: 8,
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        cursor: allowFullWindow ? 'pointer' : 'default',
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
      <Div100vh data-testid="embedded-preview">
        {!isFullWindow && <ClickableCard />}
        <Box
          id="embed-fullscreen-container"
          ref={maximizableElement}
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
                  left: 0,
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

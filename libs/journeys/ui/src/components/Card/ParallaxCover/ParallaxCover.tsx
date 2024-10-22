import Box from '@mui/material/Box'
import { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'

import { NextImage } from '@core/shared/ui/NextImage'

import { TreeBlock } from '../../../libs/block'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { OverlayContent } from '../OverlayContent'

interface ParallaxCoverProps {
  backgroundColor: string
  imageBlock: TreeBlock<ImageFields>
  backgroundBlur: string
  children: ReactNode[]
}

export function ParallaxCover({
  backgroundColor,
  imageBlock,
  backgroundBlur,
  children
}: ParallaxCoverProps): ReactElement {
  const contentRef = useRef(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (contentRef.current != null && contentRef.current.offsetHeight != null) {
      setContentHeight(contentRef.current.offsetHeight)
    } else {
      setContentHeight(0)
    }
  }, [contentRef, children])

  return (
    <Box
      sx={{
        width: '100%',
        top: 0,
        height: '100%',
        position: 'absolute'
      }}
    >
      <NextImage
        data-testid="parallax-background-image"
        src={imageBlock.src ?? backgroundBlur}
        alt={imageBlock.alt}
        placeholder="blur"
        blurDataURL={backgroundBlur}
        layout="fill"
        objectFit="cover"
        sx={{
          transform: 'scale(2) translate(0px, -25%)'
        }}
      />
      <Box
        data-testid="parallax-background-blur"
        sx={{
          width: '100%',
          height: '100%',
          WebkitBackdropFilter: 'blur(40px)',
          backdropFilter: 'blur(40px)',
          borderRadius: 'inherit',
          backgroundColor: `${backgroundColor}60`
        }}
      />

      <Box
        data-testid="parallax-wrapper"
        sx={{
          width: '100%',
          top: 0,
          height: '80%', // calc footer height
          position: 'absolute',
          borderRadius: 'inherit',
          overflowY: 'auto',
          overflowX: 'hidden',
          // Hide on Firefox https://caniuse.com/?search=scrollbar-width
          scrollbarWidth: 'none',
          // Hide on all others https://caniuse.com/?search=webkit-scrollbar
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          perspective: '10px',
          WebkitMask: `linear-gradient(transparent 0%, #0000001a 0%, #000000 8%, #000000 90%, #0000001a 98%, transparent 100%)`,
          mask: `linear-gradient(transparent 0%, #0000001a 0%, #000000 8%, #000000 90%, #0000001a 98%, transparent 100%)`
        }}
      >
        <Box
          data-testid="parallax-header"
          sx={{
            position: 'absolute',
            zIndex: -1,
            width: '100%',
            height: `calc(100% - ${contentHeight}px + ${
              contentHeight > 0 ? 100 : 0
            }px)`,
            top: `calc(-${contentHeight > 0 ? contentHeight / 2 : 0}px)`,
            // height: '100%',
            // top: 0,
            // objectFit: 'cover',
            transform: 'translateZ(-10px) scale(2)',
            // transform: 'translateZ(-10px) scale(2) translate(0px, -38%)',
            WebkitMask: `linear-gradient(to top, transparent 0%, ${backgroundColor}14 5%, ${backgroundColor}33 10%, ${backgroundColor}60 15%, ${backgroundColor}b0 20%, ${backgroundColor}e6 25%, ${backgroundColor} 30%)`,
            mask: `linear-gradient(to top, transparent 0%, ${backgroundColor}14 5%, ${backgroundColor}33 10%, ${backgroundColor}60 15%, ${backgroundColor}b0 20%, ${backgroundColor}e6 25%, ${backgroundColor} 30%)`
          }}
        >
          <NextImage
            data-testid="content-background-image"
            src={imageBlock.src ?? backgroundBlur}
            alt={imageBlock.alt}
            placeholder="blur"
            blurDataURL={backgroundBlur}
            layout="fill"
            objectFit="cover"
          />
        </Box>

        <Box
          ref={contentRef}
          data-testid="parallax-content"
          sx={{
            position: 'absolute',
            bottom: 0,
            maxHeight: '40vh',
            width: '100%'
          }}
        >
          <OverlayContent
            hasFullscreenVideo={false}
            sx={{
              // mt: '60%',
              width: { sm: '312px' }
            }}
          >
            {children}
          </OverlayContent>
        </Box>
      </Box>
    </Box>
  )
}

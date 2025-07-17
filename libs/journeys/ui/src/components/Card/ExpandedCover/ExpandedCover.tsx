import Stack from '@mui/material/Stack'
import { ReactElement, ReactNode } from 'react'

import { NextImage } from '@core/shared/ui/NextImage'

import type { TreeBlock } from '../../../libs/block'
import { useJourney } from '../../../libs/JourneyProvider'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { OverlayContent } from '../OverlayContent'

interface ExpandedCoverProps {
  children: ReactNode
  imageBlock?: TreeBlock<ImageFields>
  backgroundColor?: string
  backgroundBlur?: string
  backdropBlur?: number
  hasFullscreenVideo?: boolean
}

export function ExpandedCover({
  children,
  imageBlock,
  backgroundColor,
  backgroundBlur,
  backdropBlur,
  hasFullscreenVideo = false
}: ExpandedCoverProps): ReactElement {
  const { journey, variant } = useJourney()
  const enableVerticalScroll = {
    overflowY: 'scroll',
    // Hide on Firefox https://caniuse.com/?search=scrollbar-width
    scrollbarWidth: 'none',
    // Hide on all others https://caniuse.com/?search=webkit-scrollbar
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  }

  const background =
    backgroundColor != null
      ? imageBlock?.src != null
        ? `${backgroundColor}`
        : backgroundColor
      : 'unset'

  return (
    <>
      {/* Background Image */}
      {backgroundBlur != null && imageBlock != null && (
        <NextImage
          data-testid="CardExpandedImageCover"
          src={imageBlock.src ?? backgroundBlur}
          alt={imageBlock.alt}
          loading="eager"
          placeholder="blur"
          blurDataURL={backgroundBlur}
          layout="fill"
          objectFit="cover"
          objectPosition={`${imageBlock.focalLeft}% ${imageBlock.focalTop}%`}
          sx={{
            transform: `scale(${(imageBlock.scale ?? 100) / 100})`,
            transformOrigin: `${imageBlock.focalLeft}% ${imageBlock.focalTop}%`
          }}
        />
      )}
      <Stack
        data-testid="CardExpandedCover"
        sx={{
          height: '100%',
          WebkitBackdropFilter: `blur(${backdropBlur ?? 20}px)`,
          backdropFilter: `blur(${backdropBlur ?? 20}px)`,
          background,
          borderRadius: 'inherit',
          overflow: 'hidden',
          boxSizing: 'content-box'
        }}
      >
        <Stack
          data-testid="overlay-content-container"
          justifyContent="center"
          sx={{
            flexGrow: 1,
            pt: journey?.website === true ? 0 : { xs: 10, sm: 8 },
            ...enableVerticalScroll
          }}
        >
          <OverlayContent
            hasFullscreenVideo={hasFullscreenVideo}
            sx={{
              mx: 'auto',
              width: {
                xs:
                  variant === 'default'
                    ? 'calc(100% - 32px - env(safe-area-inset-left) - env(safe-area-inset-right))'
                    : 'calc(100% - 32px)',
                sm: 360,
                md: 500
              }
            }}
          >
            {children}
          </OverlayContent>
        </Stack>
      </Stack>
    </>
  )
}

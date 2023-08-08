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
  hasFullscreenVideo?: boolean
}

export function ExpandedCover({
  children,
  imageBlock,
  backgroundColor,
  backgroundBlur,
  hasFullscreenVideo = false
}: ExpandedCoverProps): ReactElement {
  const { variant } = useJourney()
  const enableVerticalScroll = {
    overflowY: 'scroll',
    // Hide on Firefox https://caniuse.com/?search=scrollbar-width
    scrollbarWidth: 'none',
    // Hide on all others https://caniuse.com/?search=webkit-scrollbar
    '&::-webkit-scrollbar': {
      display: 'none'
    }
  }

  return (
    <>
      {/* Background Image */}
      {backgroundBlur != null && imageBlock != null && (
        <NextImage
          data-testid="ExpandedImageCover"
          src={imageBlock.src ?? backgroundBlur}
          alt={imageBlock.alt}
          placeholder="blur"
          blurDataURL={backgroundBlur}
          layout="fill"
          objectFit="cover"
        />
      )}
      <Stack
        data-testid="ExpandedCover"
        sx={{
          height: '100%',
          WebkitBackdropFilter: 'blur(20px)',
          backdropFilter: 'blur(20px)',
          background:
            backgroundColor != null ? `${backgroundColor}4d` : 'unset',
          borderRadius: 'inherit',
          overflow: 'hidden'
        }}
      >
        <Stack
          data-testid="overlay-content-container"
          justifyContent="center"
          sx={{
            flexGrow: 1,
            pt: { xs: 10, lg: 8 },
            pb: { xs: 28, sm: 16, lg: 8 },
            ...enableVerticalScroll
          }}
        >
          <OverlayContent
            hasFullscreenVideo={hasFullscreenVideo}
            sx={{
              margin: 'auto',
              width: {
                xs:
                  variant === 'default'
                    ? 'calc(100% - 48px - env(safe-area-inset-left) - env(safe-area-inset-right))'
                    : 'calc(100% - 48px)',
                lg: 500
              },
              py: { xs: 4 }
            }}
          >
            {children}
          </OverlayContent>
        </Stack>
      </Stack>
    </>
  )
}

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

  const background =
    backgroundColor != null
      ? imageBlock?.src != null
        ? `${backgroundColor}4d`
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
          placeholder="blur"
          blurDataURL={backgroundBlur}
          layout="fill"
          objectFit="cover"
        />
      )}
      <Stack
        data-testid="CardExpandedCover"
        sx={{
          height: '100%',
          WebkitBackdropFilter: 'blur(20px)',
          backdropFilter: 'blur(20px)',
          background,
          borderRadius: 'inherit',
          overflow: 'hidden'
        }}
      >
        <Stack
          data-testid="overlay-content-container"
          justifyContent="center"
          sx={{
            flexGrow: 1,
            pt: { xs: 10, sm: 8 },
            pb: { xs: 28, sm: 16 },
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
                sm: 360,
                md: 500
              },
              pb: 4
            }}
          >
            {children}
          </OverlayContent>
        </Stack>
      </Stack>
    </>
  )
}

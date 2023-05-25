import { ReactElement, ReactNode } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { NextImage } from '@core/shared/ui/NextImage'
import type { TreeBlock } from '../../../libs/block'
import { ImageFields } from '../../Image/__generated__/ImageFields'

interface ExpandedCoverProps {
  children: ReactNode[]
  imageBlock?: TreeBlock<ImageFields>
  backgroundBlur?: string
  isVideoOnlyCard?: boolean
}

export function ExpandedCover({
  children,
  imageBlock,
  backgroundBlur,
  isVideoOnlyCard = false
}: ExpandedCoverProps): ReactElement {
  const enableVerticalScroll = {
    overflowY: 'scroll',
    // Hide on Firefox https://caniuse.com/?search=scrollbar-width
    scrollbarWidth: 'none',
    // Hide on all others https://caniuse.com/?search=webkit-scrollbar
    '&::-webkit-scrollbar': {
      display: 'none'
    },
    // Add spacing to children so centered when scrolling to edge
    '& > *': {
      '&:first-child': { mt: { xs: 6, lg: 12 } },
      '&:last-child': { mb: { xs: 6, lg: 12 } }
    }
  }

  const overflowScrollFadeEffect = isVideoOnlyCard
    ? undefined
    : {
        WebkitMask: `linear-gradient(transparent 0%, #0000001a 4%, #000000 8%, #000000 90%, #0000001a 98%, transparent 100%)`,
        mask: `linear-gradient(transparent 0%, #0000001a 4%, #000000 8%, #000000 90%, #0000001a 98%, transparent 100%)`
      }

  return (
    <>
      {/* Background Image */}
      {backgroundBlur != null && imageBlock != null && (
        <NextImage
          data-testid="ExpandedImageCover"
          src={imageBlock?.src ?? backgroundBlur}
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
            backgroundBlur != null
              ? `linear-gradient(to top, ${backgroundBlur}cc 0%, ${backgroundBlur}38 57%, ${backgroundBlur}00 90%)`
              : 'unset'
        }}
      >
        <Stack
          data-testid="overlay-content-container"
          justifyContent="center"
          sx={{
            flexGrow: 1,
            py: isVideoOnlyCard ? 0 : { xs: 9, lg: 8 },
            ...enableVerticalScroll
          }}
        >
          <Box
            data-testid="overlay-content"
            sx={{
              margin: 'auto',
              width: '100%',
              maxWidth: {
                xs: isVideoOnlyCard ? '100%' : 'calc(100% - 48px)',
                lg: 500
              },
              p: isVideoOnlyCard ? 0 : { xs: 2, lg: 'auto' },
              ...enableVerticalScroll,
              ...overflowScrollFadeEffect
            }}
          >
            {children}
          </Box>
        </Stack>
      </Stack>
    </>
  )
}

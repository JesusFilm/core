import { ReactElement, ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { NextImage } from '@core/shared/ui/NextImage'
import type { TreeBlock } from '../../../libs/block'
import { ImageFields } from '../../Image/__generated__/ImageFields'
import { OverlayContent } from '../OverlayContent'

interface ExpandedCoverProps {
  children: ReactNode
  imageBlock?: TreeBlock<ImageFields>
  backgroundColor?: string
  backgroundBlur?: string
  isVideoOnlyCard?: boolean
}

export function ExpandedCover({
  children,
  imageBlock,
  backgroundColor,
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
            py: isVideoOnlyCard ? 0 : { xs: 9, lg: 8 },
            ...enableVerticalScroll
          }}
        >
          {isVideoOnlyCard ? (
            children
          ) : (
            <OverlayContent
              sx={{
                margin: 'auto',
                width: '100%',
                maxWidth: { xs: 'calc(100% - 48px)', lg: 500 },
                p: { xs: 2, lg: 'auto' },
                mb: { xs: 8, lg: 0 }
              }}
            >
              {children}
            </OverlayContent>
          )}
        </Stack>
      </Stack>
    </>
  )
}

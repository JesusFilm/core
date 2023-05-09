import { ReactElement, ReactNode } from 'react'
import Box from '@mui/material/Box'
import { NextImage } from '@core/shared/ui/NextImage'
import type { TreeBlock } from '../../../libs/block'
import { ImageFields } from '../../Image/__generated__/ImageFields'

interface ExpandedCoverProps {
  children: ReactNode
  imageBlock?: TreeBlock<ImageFields>
  backgroundBlur?: string
}

export function ExpandedCover({
  children,
  imageBlock,
  backgroundBlur
}: ExpandedCoverProps): ReactElement {
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
          style={{ background: '#fff' }}
        />
      )}
      <Box
        data-testid="ExpandedCover"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          display: 'flex',
          padding: (theme) => ({
            xs: theme.spacing(7),
            sm: theme.spacing(7, 10),
            md: theme.spacing(10)
          }),
          justifyContent: 'center',
          WebkitBackdropFilter: 'blur(55px)',
          backdropFilter: 'blur(55px)',
          background:
            backgroundBlur != null
              ? `linear-gradient(360deg, ${backgroundBlur}cc 0%, ${backgroundBlur}38 57%, ${backgroundBlur}00 90%)`
              : 'unset'
        }}
      >
        <Box
          sx={{
            margin: 'auto',
            width: '100%',
            maxWidth: 500,
            zIndex: 1,
            '& > *': {
              '&:first-child': { mt: 0 },
              '&:last-child': { mb: 0 }
            }
          }}
        >
          {children}
        </Box>

        {/* {backgroundBlur != null && (
        <Box
          data-testid="expandedBlurBackground"
          sx={{
            position: 'absolute',
            width: '100%',
            height: '110%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
            backgroundPosition: '0% 0%',
            left: 0,
            top: '-10%',
            zIndex: -1,
            transform: 'scaleY(-1)',
            backgroundBlendMode: 'hard-light',
            backgroundImage: `url(${backgroundBlur}), url(${backgroundBlur})`
          }}
        />
      )} */}
      </Box>
    </>
  )
}

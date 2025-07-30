import Box from '@mui/material/Box'
import Card, { CardProps } from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { ReactElement, useState } from 'react'

import LogoGrayscale from '@core/shared/ui/icons/LogoGrayscale'

import { TreeBlock } from '../../../libs/block'
import { BlockFields } from '../../../libs/block/__generated__/BlockFields'
import { ImageFields } from '../../Image/__generated__/ImageFields'

export const StyledGridRadioOption = styled(Card)<CardProps>(({ theme }) => ({
  borderRadius: 16,
  padding: 12,
  height: '100%',
  minHeight: '80px',
  backgroundColor:
    theme.palette.mode === 'dark'
      ? 'rgba(254, 254, 254, 0.40)'
      : 'rgba(0, 0, 0, 0.15)'
}))

interface GridVariantProps {
  label: string
  pollOptionImageId?: string | null
  selected?: boolean
  disabled?: boolean
  handleClick: (e: React.MouseEvent) => void
  editableLabel?: ReactElement
  children: TreeBlock<BlockFields>[]
}

export function GridVariant({
  label,
  pollOptionImageId,
  selected = false,
  disabled = false,
  handleClick,
  editableLabel,
  children
}: GridVariantProps): ReactElement {
  const [isImageLoading, setIsImageLoading] = useState(true)

  const showLabel = editableLabel != null || (label != null && label != '')

  const imageBlock = children.find(
    (child) => child.id === pollOptionImageId
  ) as TreeBlock<ImageFields>

  return (
    <StyledGridRadioOption
      onClick={handleClick}
      className={selected ? 'selected' : ''}
      sx={{}}
      data-testid="JourneysRadioOption"
    >
      <Stack gap={2}>
        <Box
          sx={{
            width: '100%',
            minWidth: '106px',
            minHeight: '106px',
            maxHeight: '127px',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? '#26262E' : '#6D6F81',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {imageBlock?.src != null ? (
            <>
              {isImageLoading && (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  sx={{ position: 'absolute', top: 0, left: 0 }}
                />
              )}
              <Image
                src={imageBlock.src}
                alt={imageBlock.alt}
                fill
                style={{
                  objectFit: 'cover'
                }}
                onLoadingComplete={() => setIsImageLoading(false)}
                sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 25vw"
              />
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            >
              <LogoGrayscale
                sx={{
                  width: '50px',
                  height: '34px'
                }}
              />
            </Box>
          )}
        </Box>
        {showLabel && (
          <Typography
            variant="body2"
            sx={{
              color: (theme) =>
                theme.palette.mode === 'dark' ? '#1D1D1D' : '#FFFFFF'
            }}
          >
            {editableLabel ?? label}
          </Typography>
        )}
      </Stack>
    </StyledGridRadioOption>
  )
}

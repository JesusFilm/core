import Box from '@mui/material/Box'
import Card, { CardProps } from '@mui/material/Card'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import LogoGrayscale from '@core/shared/ui/icons/LogoGrayscale'
import { NextImage } from '@core/shared/ui/NextImage'

import { TreeBlock } from '../../../libs/block'
import { BlockFields } from '../../../libs/block/__generated__/BlockFields'
import { ImageFields } from '../../Image/__generated__/ImageFields'

const pollCustomTheme = {
  default: {
    light: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderColor: 'rgba(225, 225, 225, 0.3)',
      boxShadow: 'rgba(255, 255, 255, 0.2)'
    },
    dark: {
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      borderColor: 'rgba(150, 150, 150, 0.2)',
      boxShadow: 'rgba(255, 255, 255, 0.3)'
    }
  },
  hover: {
    light: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(255, 255, 255, 0.5)',
      boxShadow: 'rgba(255, 255, 255, 0.3)'
    },
    dark: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderColor: 'rgba(150, 150, 150, 0.5)',
      boxShadow: 'rgba(255, 255, 255, 0.5)'
    }
  },
  selected: {
    light: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      borderColor: 'rgba(0, 0, 0, 0.7)',
      boxShadow: 'rgba(255, 255, 255, 0.3)'
    },
    dark: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: 'rgba(150, 150, 150, 0.7)',
      boxShadow: 'rgba(255, 255, 255, 0.5)'
    }
  },
  disabled: {
    light: {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      borderColor: 'rgba(255, 255, 255, 0.15)',
      boxShadow: null
    },
    dark: {
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      borderColor: 'rgba(150, 150, 150, 0.15)',
      boxShadow: null
    }
  }
}

const textTheme = {
  default: {
    light: {
      color: 'rgba(255, 255, 255, 1)'
    },
    dark: {
      color: 'rgba(29, 29, 29, 1)'
    }
  },
  disabled: {
    light: {
      color: 'rgba(255, 255, 255, 0.7)'
    },
    dark: {
      color: 'rgba(0, 0, 0, 0.5)'
    }
  }
}

export const StyledGridRadioOption = styled(Card)<CardProps>(({ theme }) => ({
  borderRadius: 16,
  padding: 12,
  height: '100%',
  minHeight: '80px',
  border: '1px solid',
  wordBreak: 'break-word',
  transition: theme.transitions.create(
    ['background-color', 'border-color', 'transform', 'box-shadow', 'opacity'],
    {
      duration: theme.transitions.duration.short
    }
  ),

  // Default
  backgroundColor: pollCustomTheme.default[theme.palette.mode].backgroundColor,
  borderColor: pollCustomTheme.default[theme.palette.mode].borderColor,
  boxShadow: pollCustomTheme.default[theme.palette.mode].boxShadow,

  // Hover
  '&:hover': {
    backgroundColor: pollCustomTheme.hover[theme.palette.mode].backgroundColor,
    borderColor: pollCustomTheme.hover[theme.palette.mode].borderColor,
    boxShadow: pollCustomTheme.hover[theme.palette.mode].boxShadow,
    transform: 'translateY(-2px)'
  },

  // Selected
  '&.selected': {
    backgroundColor:
      pollCustomTheme.selected[theme.palette.mode].backgroundColor,
    borderColor: pollCustomTheme.selected[theme.palette.mode].borderColor,
    boxShadow: pollCustomTheme.selected[theme.palette.mode].boxShadow
  },

  // Disabled
  '&.Mui-disabled': {
    backgroundColor:
      pollCustomTheme.disabled[theme.palette.mode].backgroundColor,
    borderColor: pollCustomTheme.disabled[theme.palette.mode].borderColor,
    boxShadow: pollCustomTheme.disabled[theme.palette.mode].boxShadow
  }
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

  const classNames = `${selected ? 'selected' : ''} ${disabled ? 'Mui-disabled' : ''}`

  return (
    <StyledGridRadioOption
      onClick={handleClick}
      className={classNames}
      data-testid="JourneysRadioOptionGrid"
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
              <NextImage
                src={imageBlock.src}
                alt={imageBlock.alt}
                layout="fill"
                objectFit="cover"
                onLoad={() => setIsImageLoading(false)}
                sx={{
                  transform: `scale(${(imageBlock.scale ?? 100) / 100})`,
                  transformOrigin: `${imageBlock.focalLeft}% ${imageBlock.focalTop}%`
                }}
                sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 25vw"
              />
              {disabled && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    zIndex: 1
                  }}
                />
              )}
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
              {disabled && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    zIndex: 1
                  }}
                />
              )}
            </Box>
          )}
        </Box>
        {showLabel && (
          <Typography
            variant="body2"
            sx={{
              color: (theme) =>
                disabled
                  ? textTheme.disabled[theme.palette.mode].color
                  : textTheme.default[theme.palette.mode].color
            }}
          >
            {editableLabel ?? label}
          </Typography>
        )}
      </Stack>
    </StyledGridRadioOption>
  )
}

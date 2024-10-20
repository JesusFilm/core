import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import debounce from 'lodash/debounce'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../../../../../__generated__/globalTypes'

import { GridLines } from './GridLines'
import { calculatePoint } from './utils/calculatePoint'
import { clampPosition } from './utils/clampPosition'

const INITIAL_POSITION = { x: 50, y: 50 }
export const MIN_VALUE = 0
export const MAX_VALUE = 100
export const ROUND_PRECISION = 100
const DEBOUNCE_DELAY = 500

export interface Position {
  x: number
  y: number
}

interface FocalPointProps {
  imageBlock?: ImageBlock | null
  updateImageBlock: (input: ImageBlockUpdateInput) => void
}

export function FocalPoint({
  imageBlock,
  updateImageBlock
}: FocalPointProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')

  const [localPosition, setLocalPosition] = useState<Position>({
    x: imageBlock?.focalLeft ?? INITIAL_POSITION.x,
    y: imageBlock?.focalTop ?? INITIAL_POSITION.y
  })

  const dotRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const debouncedUpdateImageBlock = useCallback(
    debounce((position: Position) => {
      updateImageBlock({
        src: imageBlock?.src,
        alt: imageBlock?.alt,
        blurhash: imageBlock?.blurhash,
        width: imageBlock?.width,
        height: imageBlock?.height,
        focalTop: Math.round(position.y),
        focalLeft: Math.round(position.x)
      })
    }, DEBOUNCE_DELAY),
    [imageBlock, updateImageBlock]
  )

  function updatePoint(point: Position): void {
    const newPosition = clampPosition(point)
    setLocalPosition(newPosition)
    debouncedUpdateImageBlock(newPosition)
  }

  function handleMouseDown(e: React.MouseEvent): void {
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleMouseUp(): void {
    setIsDragging(false)
  }

  function handleMouseMove(e: MouseEvent): void {
    if (isDragging) {
      const point = calculatePoint(e, imageRef)
      if (point != null) updatePoint(point)
    }
  }

  function handleImageClick(e: React.MouseEvent): void {
    const point = calculatePoint(e, imageRef)
    if (point != null) {
      updatePoint(point)
    }
  }

  function handleInputChange(axis: 'x' | 'y', value: string): void {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      updatePoint({
        x: axis === 'x' ? numValue : localPosition.x,
        y: axis === 'y' ? numValue : localPosition.y
      })
    }
  }

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging])

  useEffect(() => {
    if (imageRef.current != null) {
      imageRef.current.style.objectPosition = `${localPosition.x}% ${localPosition.y}%`
    }
  }, [localPosition])

  return (
    <Stack gap={4}>
      <Typography variant="subtitle2">{t('Focal Point')}</Typography>
      <Box
        ref={imageRef}
        sx={{
          height: 300,
          width: '100%',
          display: 'flex',
          cursor: 'pointer',
          userSelect: 'none',
          overflow: 'hidden',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 4,
          border: (theme) => `1px solid ${theme.palette.divider}`
        }}
        onClick={handleImageClick}
      >
        {imageBlock?.src != null ? (
          <>
            <Image
              src={imageBlock.src}
              alt={imageBlock?.alt ?? ''}
              layout="fill"
              objectFit="cover"
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
              }}
            />
            <GridLines />
            <Box
              ref={dotRef}
              sx={{
                width: 30,
                height: 30,
                cursor: 'move',
                borderRadius: '50%',
                position: 'absolute',
                pointerEvents: 'auto',
                top: `${localPosition.y}%`,
                left: `${localPosition.x}%`,
                transform: 'translate(-50%, -50%)',
                backdropFilter: 'blur(4px)',
                border: '2px solid white',
                boxShadow: (theme) => theme.shadows[3]
              }}
              onMouseDown={handleMouseDown}
            />
          </>
        ) : (
          <InsertPhotoRoundedIcon fontSize="large" />
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        {(['x', 'y'] as const).map((axis) => (
          <TextField
            key={axis}
            type="number"
            label={axis === 'x' ? t('Left') : t('Top')}
            value={localPosition[axis].toFixed(0)}
            onChange={(e) => handleInputChange(axis, e.target.value)}
            slotProps={{
              input: { endAdornment: '%' },
              htmlInput: { min: 0, max: 100 }
            }}
            sx={{ width: '45%' }}
          />
        ))}
      </Box>
    </Stack>
  )
}

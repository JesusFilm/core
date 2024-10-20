import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import clamp from 'lodash/clamp'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement, useCallback, useEffect, useRef, useState } from 'react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../../../../../__generated__/globalTypes'

import { GridLines } from './GridLines'

const INITIAL_POSITION = { x: 50, y: 50 }
const MIN_VALUE = 0
const MAX_VALUE = 100
const ROUND_PRECISION = 100

interface Position {
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
  const [shouldUpdate, setShouldUpdate] = useState(false)

  function updatePoint(point: Position): void {
    setLocalPosition({
      x:
        Math.round(clamp(point.x, MIN_VALUE, MAX_VALUE) * ROUND_PRECISION) /
        ROUND_PRECISION,
      y:
        Math.round(clamp(point.y, MIN_VALUE, MAX_VALUE) * ROUND_PRECISION) /
        ROUND_PRECISION
    })
  }

  function calculatePoint(e: React.MouseEvent | MouseEvent): Position | null {
    if (imageRef.current == null) return null
    const boundingRect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - boundingRect.left) / boundingRect.width) * MAX_VALUE
    const y = ((e.clientY - boundingRect.top) / boundingRect.height) * MAX_VALUE
    return { x, y }
  }

  function handleMouseDown(e: React.MouseEvent): void {
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleMouseUp = useCallback((): void => {
    if (isDragging) {
      setIsDragging(false)
      setShouldUpdate(true)
    }
  }, [isDragging])

  const handleMouseMove = useCallback(
    (e: MouseEvent): void => {
      if (isDragging) {
        const point = calculatePoint(e)
        if (point != null) updatePoint(point)
      }
    },
    [isDragging]
  )

  function handleImageClick(e: React.MouseEvent): void {
    const point = calculatePoint(e)
    if (point != null) {
      updatePoint(point)
      setShouldUpdate(true)
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
  }, [handleMouseMove, handleMouseUp])

  useEffect(() => {
    if (imageRef.current != null) {
      imageRef.current.style.objectPosition = `${localPosition.x}% ${localPosition.y}%`
    }

    if (shouldUpdate) {
      updateImageBlock({
        src: imageBlock?.src,
        alt: imageBlock?.alt,
        blurhash: imageBlock?.blurhash,
        width: imageBlock?.width,
        height: imageBlock?.height,
        focalTop: Math.round(localPosition.y),
        focalLeft: Math.round(localPosition.x)
      })
      setShouldUpdate(false)
    }
  }, [shouldUpdate, localPosition, updateImageBlock, imageBlock])

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
            onBlur={() => setShouldUpdate(true)}
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

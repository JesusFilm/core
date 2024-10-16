import InsertPhotoRoundedIcon from '@mui/icons-material/InsertPhotoRounded'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { MouseEvent, ReactElement, useEffect, useRef, useState } from 'react'

import { useFocalPoint } from '@core/journeys/ui/FocalPointProvider'

interface FocalPointProps {
  src: string | null
  alt?: string
}

export function FocalPoint({ src, alt }: FocalPointProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { focalPoint, updateFocalPoint } = useFocalPoint()
  const [isDragging, setIsDragging] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  function handleMouseDown(e: MouseEvent): void {
    e.stopPropagation()
    setIsDragging(true)
  }

  function handleMouseUp(): void {
    setIsDragging(false)
  }

  function handleImageClick(e): void {
    if (imageRef.current == null) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    updateFocalPoint({ x, y })
  }

  function handleMouseMove(e): void {
    if (isDragging && imageRef.current != null) {
      const rect = imageRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      updateFocalPoint({ x, y })
    }
  }

  function handleInputChange(axis: 'x' | 'y', value: string): void {
    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      updateFocalPoint({
        x: axis === 'x' ? numValue : focalPoint.x,
        y: axis === 'y' ? numValue : focalPoint.y
      })
    }
  }

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp)
    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isDragging])

  useEffect(() => {
    if (imageRef.current != null) {
      imageRef.current.style.objectPosition = `${focalPoint.x}% ${focalPoint.y}%`
    }
  }, [focalPoint])

  return (
    <Stack gap={4}>
      <Typography variant="subtitle2">{t('Focal Point')}</Typography>
      <Box
        ref={imageRef}
        sx={{
          borderRadius: 4,
          position: 'relative',
          width: '100%',
          height: 300,
          overflow: 'hidden',
          cursor: 'pointer'
        }}
        onClick={handleImageClick}
      >
        {src != null ? (
          <Image src={src} alt={alt ?? ''} layout="fill" objectFit="cover" />
        ) : (
          <InsertPhotoRoundedIcon fontSize="large" />
        )}
        <Box
          ref={dotRef}
          sx={{
            position: 'absolute',
            top: `${focalPoint.y}%`,
            left: `${focalPoint.x}%`,
            width: 30,
            height: 30,
            borderRadius: '50%',
            backgroundColor: 'white',
            transform: 'translate(-50%, -50%)',
            cursor: 'move',
            border: (theme) => `1px solid ${theme.palette.primary.main}`
          }}
          onMouseDown={handleMouseDown}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <TextField
          label={t('Left')}
          type="number"
          value={focalPoint.x.toFixed(0)}
          onChange={(e) => handleInputChange('x', e.target.value)}
          slotProps={{
            input: { endAdornment: '%' }
          }}
          sx={{ width: '45%' }}
        />
        <TextField
          label={t('Top')}
          type="number"
          value={focalPoint.y.toFixed(0)}
          onChange={(e) => handleInputChange('y', e.target.value)}
          slotProps={{
            input: { endAdornment: '%' }
          }}
          sx={{ width: '45%' }}
        />
      </Box>
    </Stack>
  )
}

import ZoomInIcon from '@mui/icons-material/ZoomIn'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../../../../../__generated__/globalTypes'

interface ZoomImageProps {
  imageBlock?: ImageBlock | null
  updateImageBlock: (input: ImageBlockUpdateInput) => void
}

export function ZoomImage({ imageBlock, updateImageBlock }: ZoomImageProps) {
  const [zoom, setZoom] = useState<number>(
    imageBlock?.scale == null ? 1.0 : imageBlock.scale / 100
  )

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    const val = typeof newValue === 'number' ? newValue : newValue[0]
    setZoom(Math.round(val * 10) / 10)
  }

  const handleSliderChangeCommitted = (
    _: Event,
    newValue: number | number[]
  ) => {
    const val = typeof newValue === 'number' ? newValue : newValue[0]

    updateImageBlock({
      src: imageBlock?.src,
      scale: Math.round(val * 100)
    })
  }

  return (
    <>
      {imageBlock?.src != null && (
        <Stack direction="row" alignItems="center" spacing={3}>
          <ZoomInIcon
            sx={{ color: 'text.secondary', fontSize: 24 }}
            aria-label="Zoom in"
          />
          <Slider
            value={zoom}
            min={1.0}
            max={2.0}
            step={0.1}
            onChange={handleSliderChange}
            onChangeCommitted={handleSliderChangeCommitted}
            sx={{
              flex: 1,
              color: 'primary',
              borderRadius: 4,
              '& .MuiSlider-thumb': {
                width: 14,
                height: 14,
                boxShadow: 2
              },
              '& .MuiSlider-rail': {
                height: 3,
                backgroundColor: 'divider'
              },
              '& .MuiSlider-track': {
                height: 3
              }
            }}
            aria-label="Zoom slider"
            tabIndex={0}
          />
          <Typography
            sx={{
              width: 52,
              height: 31,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              color: 'text.primary',
              backgroundColor: 'background.paper'
            }}
            aria-label="Zoom percentage"
          >
            {zoom.toFixed(1)} ×
          </Typography>
        </Stack>
      )}
    </>
  )
}

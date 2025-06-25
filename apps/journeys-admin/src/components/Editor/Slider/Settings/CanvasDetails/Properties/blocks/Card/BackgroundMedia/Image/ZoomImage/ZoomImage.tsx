import ZoomInIcon from '@mui/icons-material/ZoomIn'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useState } from 'react'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../../../../../__generated__/BlockFields'
import { ImageBlockUpdateInput } from '../../../../../../../../../../../../__generated__/globalTypes'
import { PropertiesSlider } from '../controls'

interface ZoomImageProps {
  imageBlock?: ImageBlock | null
  updateImageBlock: (input: ImageBlockUpdateInput) => void
}

export function ZoomImage({ imageBlock, updateImageBlock }: ZoomImageProps) {
  const [zoom, setZoom] = useState<number>(
    imageBlock?.scale == null ? 1.0 : imageBlock.scale / 100
  )

  useEffect(() => {
    setZoom(imageBlock?.scale == null ? 1.0 : imageBlock.scale / 100)
  }, [imageBlock?.id, imageBlock?.scale])

  const handleSliderChange = (_: Event, newValue: number) => {
    const zoomFactorRounded = Math.round(newValue * 10) / 10
    setZoom(zoomFactorRounded)
  }

  const handleSliderChangeCommitted = (_: Event, newValue: number) => {
    const zoomPercentage = Math.round(newValue * 100)

    updateImageBlock({
      src: imageBlock?.src,
      scale: zoomPercentage
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
          <PropertiesSlider
            value={zoom}
            min={1.0}
            max={2.0}
            step={0.1}
            onChange={handleSliderChange}
            onChangeCommitted={handleSliderChangeCommitted}
            ariaLabel="Zoom slider"
          />
          <Typography
            sx={{
              width: 52,
              height: 32,
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

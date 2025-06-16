import ZoomInIcon from '@mui/icons-material/ZoomIn'
import InputAdornment from '@mui/material/InputAdornment'
import Slider from '@mui/material/Slider'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import debounce from 'lodash/debounce'
import { useCallback, useState } from 'react'

interface ZoomImageProps {
  value?: number // 0-1
  updateImageBlock?: (zoom: number) => void
}

export const ZoomImage = ({ value = 0, updateImageBlock }: ZoomImageProps) => {
  const [zoom, setZoom] = useState<number>(value)

  // Debounced update function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = useCallback(
    debounce((val: number) => {
      updateImageBlock?.(val)
    }, 500),
    [updateImageBlock]
  )

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    const val = typeof newValue === 'number' ? newValue : newValue[0]
    setZoom(val)
    debouncedUpdate(val)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let percent = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10)
    if (isNaN(percent)) percent = 0
    if (percent > 100) percent = 100
    if (percent < 0) percent = 0
    const val = percent / 100
    setZoom(val)
    debouncedUpdate(val)
  }

  return (
    <Stack direction="row" alignItems="center" spacing={3}>
      {/* <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 32 }}> */}
        <ZoomInIcon
          sx={{ color: 'grey.500', fontSize: 24 }}
          aria-label="Zoom in"
        />
      {/* </Box> */}
      <Slider
        value={zoom}
        min={0}
        max={1}
        step={0.01}
        onChange={handleSliderChange}
        sx={{ 
          flex: 1, 
          color: '#B32836', 
          borderRadius: 4,
          '& .MuiSlider-thumb': {
            width: 14,
            height: 14,
            boxShadow: 2,
          },
          '& .MuiSlider-rail': {
            height: 3,
            backgroundColor: '#d9d9d9'
          },
          '& .MuiSlider-track': {
            height: 3,
          },
        }}
        aria-label="Zoom slider"
        tabIndex={0}
      />
      <TextField
        value={Math.round(zoom * 100)}
        onChange={handleInputChange}
        InputProps={{
          endAdornment: (
            <InputAdornment
              position="end"
              sx={{
                ml: -2.5,
                mr: -2.5,
                padding: 0,
                fontSize: 14
              }}
            >
              %
            </InputAdornment>
          ),
          inputProps: {
            min: 0,
            max: 100,
            type: 'number',
            'aria-label': 'Zoom percentage',
            style: { textAlign: 'center', fontSize: 14 }
          }
        }}
        sx={{
          '& .MuiOutlinedInput-root': { 
            borderRadius: 1,
            height: 31, 
            width: 52,
            '& input': {
              color: 'black'
            }
          },
          '& input[type=number]': {
            padding: '6px 8px',
          },
          '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button':
            {
              WebkitAppearance: 'none'
            },
        }}
        variant="outlined"
        size="small"
      />
    </Stack>
  )
}

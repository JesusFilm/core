import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import { ReactElement } from 'react'

import {
  addAlphaToHex,
  getOpacityFromHex,
  stripAlphaFromHex
} from '@core/journeys/ui/Card/utils/colorOpacityUtils'

import { Swatch } from '../Swatch'

interface PaletteColorPickerProps {
  selectedColor: string
  colors: string[]
  onChange: (color: string) => void
}

export function PaletteColorPicker({
  selectedColor,
  colors,
  onChange
}: PaletteColorPickerProps): ReactElement {
  const opacity = getOpacityFromHex(selectedColor) ?? 100

  function isSameColor(color1: string, color2: string): boolean {
    return stripAlphaFromHex(color1) === stripAlphaFromHex(color2)
  }

  return (
    <Grid container spacing={2} sx={{ p: 4 }}>
      {colors.map((color) => {
        return (
          <Box
            key={`palette-${color}`}
            sx={{
              borderRadius: '50%',
              transition: '0.1s outline ease-out',
              position: 'relative',
              outline: (theme) =>
                isSameColor(selectedColor, color)
                  ? `2px solid ${theme.palette.primary.main}`
                  : '2px solid transparent',
              border: '3px solid transparent',
              cursor: 'pointer'
            }}
            onClick={() => {
              onChange(addAlphaToHex(color, opacity))
            }}
          >
            <Swatch id={color} color={color} variant="rounded" />
          </Box>
        )
      })}
    </Grid>
  )
}

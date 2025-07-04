import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { ReactElement } from 'react'

import {
  addAlphaToHex,
  getOpacityFromHex,
  stripAlphaFromHex
} from '@core/journeys/ui/Card/utils/colorOpacityUtils'
import CheckIcon from '@core/shared/ui/icons/Check'

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
    <Grid container spacing={3} sx={{ p: 4 }}>
      {colors.map((color) => {
        const selected = isSameColor(selectedColor, color)
        return (
          <Box
            key={`palette-${color}`}
            sx={{
              borderRadius: '50%',
              position: 'relative',
              cursor: 'pointer'
            }}
            onClick={() => {
              onChange(addAlphaToHex(color, opacity))
            }}
          >
            <Swatch id={color} color={color} variant="rounded" />
            {selected && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckIcon
                  data-testid="CheckIcon"
                  sx={{ fontSize: 45, color: 'background.default' }}
                />
              </Box>
            )}
          </Box>
        )
      })}
    </Grid>
  )
}

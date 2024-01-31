import { ReactElement } from 'react'

import { HorizontalSelect } from '../../../../../../../HorizontalSelect'
import { Swatch } from '../Swatch'

interface PaletteColorPickerProps {
  selectedColor: string
  colors: Array<{ dark: string; light: string }>
  mode: 'dark' | 'light'
  onChange: (color: string) => void
}

export function PaletteColorPicker({
  selectedColor,
  colors,
  mode,
  onChange
}: PaletteColorPickerProps): ReactElement {
  return (
    <HorizontalSelect
      onChange={onChange}
      id={selectedColor}
      testId="PaletteColorPicker"
      sx={{ px: 4, py: 4 }}
    >
      {colors.map((color) => {
        return (
          <Swatch
            id={color[mode]}
            key={`palette-${color[mode]}`}
            color={color[mode]}
          />
        )
      })}
    </HorizontalSelect>
  )
}

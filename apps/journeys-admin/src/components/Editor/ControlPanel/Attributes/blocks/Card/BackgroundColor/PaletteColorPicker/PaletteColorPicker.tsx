import { ReactElement } from 'react'

import { ScrollableSelect } from '../../../../../../../ScrollableSelect';
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
    <ScrollableSelect onChange={onChange} id={selectedColor} sx={{width: '100%', overflowX:'scroll'}}>
      {colors.map((color) => {
        return (
          <Swatch
            id={color[mode]}
            key={`palette-${color[mode]}`}
            color={color[mode]}
          />
        )
      })}
    </ScrollableSelect>
  )
}

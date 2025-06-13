import { ReactElement } from 'react'

import { HorizontalSelect } from '../../../../../../../../../HorizontalSelect'
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
  console.log('colors', colors)
  return (
    <HorizontalSelect
      onChange={onChange}
      id={selectedColor}
      testId="PaletteColorPicker"
      sx={{ p: 4 }}
    >
      {colors.map((color) => {
        return <Swatch id={color} key={`palette-${color}`} color={color} />
      })}
    </HorizontalSelect>
  )
}

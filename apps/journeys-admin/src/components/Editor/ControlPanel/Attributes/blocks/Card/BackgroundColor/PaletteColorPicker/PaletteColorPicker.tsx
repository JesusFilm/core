import { ReactElement } from 'react'
import { HorizontalSelect } from '../../../../../../../HorizontalSelect'
import { Swatch } from '../Swatch'

interface PaletteColorPickerProps {
  selectedColor: string
  colors: string[]
  colorIndex?: number
  onChange: (color: string) => void
}

export function PaletteColorPicker({
  selectedColor,
  colors,
  colorIndex,
  onChange
}: PaletteColorPickerProps): ReactElement {
  return (
    <HorizontalSelect
      onChange={onChange}
      colorIndex={colorIndex}
      id={selectedColor}
    >
      {colors.map((color, index) => {
        return (
          <Swatch
            id={(index + 1).toString()}
            key={`palette-${color}`}
            color={color}
          />
        )
      })}
    </HorizontalSelect>
  )
}

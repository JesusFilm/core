import { ReactElement } from 'react'
import { HorizontalSelect } from '../../../../../../../HorizontalSelect'
import { Swatch } from '../Swatch'

interface PaletteColorPickerProps {
  selectedColor: string
  colors: any
  onChange: (color: string) => void
}

export function PaletteColorPicker({
  selectedColor,
  colors,
  onChange
}: PaletteColorPickerProps): ReactElement {
  const cardColors: string[] = Object.values(colors)

  return (
    <HorizontalSelect onChange={onChange} id={selectedColor}>
      {cardColors.map((color) => {
        return <Swatch id={color} key={`palette-${color}`} color={color} />
      })}
    </HorizontalSelect>
  )
}

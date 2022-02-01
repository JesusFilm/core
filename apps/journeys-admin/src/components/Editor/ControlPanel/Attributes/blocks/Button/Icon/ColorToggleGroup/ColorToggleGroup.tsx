import { ReactElement, useState } from 'react'
import capitalize from 'lodash/capitalize'
import Typography from '@mui/material/Typography'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { StyledToggleButton } from '../../../../../StyledToggleButton'
import { IconColor } from '../../../../../../../../../__generated__/globalTypes'
import { ColorDisplayIcon } from '../../../../../ColorDisplayIcon'

interface ColorToggleGroupProps {
  id: string
  color: IconColor | null
}

export function ColorToggleGroup({
  id,
  color
}: ColorToggleGroupProps): ReactElement {
  const [selected, setSelected] = useState(color ?? IconColor.primary)
  const order = [
    'inherit',
    'primary',
    'secondary',
    'error',
    'action',
    'disabled'
  ]
  const colorSorted = Object.values(IconColor).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )
  function handleChange(
    event: React.MouseEvent<HTMLElement>,
    color: IconColor
  ): void {
    if (color != null) {
      setSelected(color)
    }
  }
  return (
    <>
      <Typography>Color</Typography>
      <ToggleButtonGroup
        orientation="vertical"
        value={selected}
        exclusive
        onChange={handleChange}
        fullWidth
        sx={{ display: 'flex', px: 6, py: 4 }}
        color="primary"
      >
        {colorSorted.map((color) => {
          return (
            <StyledToggleButton
              value={color}
              key={`button-icon-color-${color}`}
              sx={{ justifyContent: 'flex-start' }}
            >
              <ColorDisplayIcon color={color} />
              <Typography variant="subtitle2" sx={{ pl: 2 }}>
                {capitalize(color)}
              </Typography>
            </StyledToggleButton>
          )
        })}
      </ToggleButtonGroup>
    </>
  )
}

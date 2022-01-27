import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { ReactElement, useState } from 'react'
import capitalize from 'lodash/capitalize'
import Typography from '@mui/material/Typography'
import { ButtonColor } from '../../../../../../../../__generated__/globalTypes'
import { StyledToggleButton } from '../../../../StyledToggleButton'
import { ColorDisplayIcon } from '../../../../ColorDisplayIcon'

interface ToggleButtonGroupProps {
  id: string
  color: ButtonColor | null
}

export function Color({ id, color }: ToggleButtonGroupProps): ReactElement {
  const [selected, setSelected] = useState(color ?? 'primary')
  const order = ['inherit', 'primary', 'secondary', 'error']
  const sorted = Object.values(ButtonColor).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )

  async function handleChange(
    event: React.MouseEvent<HTMLElement>,
    color: ButtonColor
  ): Promise<void> {
    if (color != null) {
      setSelected(color)
    }
  }

  return (
    <ToggleButtonGroup
      orientation="vertical"
      value={selected}
      exclusive
      onChange={handleChange}
      fullWidth
      sx={{ display: 'flex', px: 6, py: 4 }}
      color="primary"
    >
      {sorted.map((color) => {
        return (
          <StyledToggleButton
            value={color}
            key={`$typography-color-${color}`}
            sx={{ justifyContent: 'flex-start' }}
          >
            <ColorDisplayIcon color={color} />
            <Typography variant="subtitle2" sx={{ pl: 2 }}>
              {capitalize(color === ButtonColor.inherit ? 'default' : color)}
            </Typography>
          </StyledToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}

import { ReactElement, useState } from 'react'
import capitalize from 'lodash/capitalize'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { TypographyColor } from '../../../../../../../../__generated__/globalTypes'
import { ColorDisplayIcon } from '../../../../ColorDisplayIcon'

interface TextColorProps {
  id: string
  color: TypographyColor | null
}

// add mutaion to update back end data

export function TextColor({ id, color }: TextColorProps): ReactElement {
  const [selected, setSelected] = useState(color ?? 'primary')

  function handleChange(
    event: React.MouseEvent<HTMLElement>,
    color: TypographyColor
  ): void {
    if (color != null) {
      setSelected(color)
    }
  }

  const order = ['primary', 'secondary', 'error']
  const sorted = Object.values(TypographyColor).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )

  return (
    <ToggleButtonGroup
      orientation="vertical"
      value={selected}
      exclusive
      onChange={handleChange}
      fullWidth
      sx={{
        display: 'flex',
        px: 6,
        py: 4
      }}
    >
      {sorted.map((color) => {
        return (
          <ToggleButton
            value={color}
            key={`${id}-align-${color}`}
            sx={{ justifyContent: 'flex-start' }}
          >
            <ColorDisplayIcon color={color} />
            <Typography variant="subtitle2" sx={{ pl: 2 }}>
              {capitalize(color)}
            </Typography>
          </ToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}

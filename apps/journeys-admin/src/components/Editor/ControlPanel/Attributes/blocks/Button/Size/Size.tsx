import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { ReactElement, useState } from 'react'
import capitalize from 'lodash/capitalize'
import Typography from '@mui/material/Typography'
import { ButtonSize } from '../../../../../../../../__generated__/globalTypes'
import { StyledToggleButton } from '../../../../StyledToggleButton'

interface SizeProps {
  id: string
  size: ButtonSize | null
}

export function Size({ id, size }: SizeProps): ReactElement {
  const [selected, setSelected] = useState(size ?? ButtonSize.medium)
  const order = ['small', 'medium', 'large']
  const sorted = Object.values(ButtonSize).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )

  async function handleChange(
    event: React.MouseEvent<HTMLElement>,
    size: ButtonSize
  ): Promise<void> {
    if (size != null) {
      setSelected(size)
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
      {sorted.map((size) => {
        return (
          <StyledToggleButton
            value={size}
            key={`button-size-${size}`}
            sx={{ justifyContent: 'flex-start' }}
          >
            {/* Icon */}
            <Typography variant="subtitle2" sx={{ pl: 2 }}>
              {capitalize(size)}
            </Typography>
          </StyledToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}

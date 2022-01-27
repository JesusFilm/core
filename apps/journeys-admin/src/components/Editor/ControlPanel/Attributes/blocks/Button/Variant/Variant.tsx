import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { ReactElement, useState } from 'react'
import capitalize from 'lodash/capitalize'
import Typography from '@mui/material/Typography'
import { ButtonVariant } from '../../../../../../../../__generated__/globalTypes'
import { StyledToggleButton } from '../../../../StyledToggleButton'

interface VariantProps {
  id: string
  variant: ButtonVariant | null
}

export function Variant({ id, variant }: VariantProps): ReactElement {
  const [selected, setSelected] = useState(variant ?? ButtonVariant.contained)
  const order = ['contained', 'text']
  const sorted = Object.values(ButtonVariant).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )

  async function handleChange(
    event: React.MouseEvent<HTMLElement>,
    variant: ButtonVariant
  ): Promise<void> {
    if (variant != null) {
      setSelected(variant)
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
      {sorted.map((variant) => {
        return (
          <StyledToggleButton
            value={variant}
            key={`button-variant-${variant}`}
            sx={{ justifyContent: 'flex-start' }}
          >
            {/* Icon */}
            <Typography variant="subtitle2" sx={{ pl: 2 }}>
              {capitalize(variant)}
            </Typography>
          </StyledToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}

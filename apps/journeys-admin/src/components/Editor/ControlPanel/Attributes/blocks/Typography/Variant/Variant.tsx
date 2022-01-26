import { ReactElement, useState } from 'react'
import capitalize from 'lodash/capitalize'
import lowerCase from 'lodash/lowerCase'
import Typography from '@mui/material/Typography'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { TypographyVariant } from '../../../../../../../../__generated__/globalTypes'
import { StyledToggleButton } from '../../../../StyledToggleButton'

interface VariantProps {
  id: string
  variant: TypographyVariant | null
}

// add mutaion to update back end data

export function Variant({ id, variant }: VariantProps): ReactElement {
  const [selected, setSelected] = useState(variant ?? 'body2')

  const order = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'subtitle1',
    'subtitle2',
    'body1',
    'body2',
    'caption',
    'overline'
  ]
  const sorted = Object.values(TypographyVariant).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )

  function handleChange(
    event: React.MouseEvent<HTMLElement>,
    variant: TypographyVariant
  ): void {
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
      color="primary"
      sx={{
        display: 'flex',
        px: 6,
        py: 4
      }}
    >
      {sorted.map((variant) => {
        return (
          <StyledToggleButton
            value={variant}
            key={`typography-align-${variant}`}
            sx={{ justifyContent: 'flex-start' }}
          >
            {/* Icon goes here */}
            <Typography variant={variant}>
              {capitalize(
                lowerCase(variant?.toString() ?? 'body2').replace('h', 'header')
              )}
            </Typography>
          </StyledToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}

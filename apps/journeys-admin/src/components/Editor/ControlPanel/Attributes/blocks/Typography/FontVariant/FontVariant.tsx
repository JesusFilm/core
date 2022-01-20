import { ReactElement, useState } from 'react'
import capitalize from 'lodash/capitalize'
import lowerCase from 'lodash/lowerCase'
import Typography from '@mui/material/Typography'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { TypographyVariant } from '../../../../../../../../__generated__/globalTypes'

interface FontVariantProps {
  id: string
  variant: TypographyVariant | null
}

export function FontVariant({ id, variant }: FontVariantProps): ReactElement {
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
    varaint: TypographyVariant
  ): void {
    if (varaint != null) {
      setSelected(varaint)
    }
  }

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
      {sorted.map((variant) => {
        return (
          <ToggleButton
            value={variant}
            key={`${id}-align-${variant}`}
            sx={{ justifyContent: 'flex-start' }}
          >
            {/* Icon goes here */}
            <Typography variant={variant}>
              {capitalize(
                lowerCase(variant?.toString() ?? 'body2').replace('h', 'header')
              )}
            </Typography>
          </ToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}

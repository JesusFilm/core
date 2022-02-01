import { ReactElement, useState } from 'react'
import capitalize from 'lodash/capitalize'
import Typography from '@mui/material/Typography'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { StyledToggleButton } from '../../../../../StyledToggleButton'
import { IconSize } from '../../../../../../../../../__generated__/globalTypes'

interface SizeToggleGroupProps {
  id: string
  size: IconSize | null | undefined
}

export function SizeToggleGroup({
  id,
  size
}: SizeToggleGroupProps): ReactElement {
  const [selected, setSelected] = useState(size ?? IconSize.md)
  const order = ['sm', 'md', 'lg', 'xl', 'inherit']
  const sorted = Object.values(IconSize).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )
  function handleChange(
    event: React.MouseEvent<HTMLElement>,
    size: IconSize
  ): void {
    if (size != null) {
      setSelected(size)
    }
  }
  return (
    <>
      <Typography>Size</Typography>
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
              key={`button-icon-size-${size}`}
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
    </>
  )
}

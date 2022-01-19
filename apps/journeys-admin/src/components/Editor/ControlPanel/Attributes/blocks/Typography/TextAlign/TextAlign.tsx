import { ReactElement, useState } from 'react'
import FormatAlignLeftRoundedIcon from '@mui/icons-material/FormatAlignLeftRounded'
import FormatAlignCenterRoundedIcon from '@mui/icons-material/FormatAlignCenterRounded'
import FormatAlignRightRoundedIcon from '@mui/icons-material/FormatAlignRightRounded'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import capitalize from 'lodash/capitalize'
import { TypographyAlign } from '../../../../../../../../__generated__/globalTypes'

interface TextAlignProps {
  id: string
  align: TypographyAlign | null
}

export function TextAlign({ id, align }: TextAlignProps): ReactElement {
  const [selected, setSelected] = useState(align ?? 'left')

  const order = ['left', 'center', 'right']
  const sorted = Object.values(TypographyAlign).sort(
    (a, b) => order.indexOf(a) - order.indexOf(b)
  )

  function handleChange(
    event: React.MouseEvent<HTMLElement>,
    align: string
  ): void {
    if (align != null) {
      setSelected(align)
    }
  }

  function iconSelector(align: TypographyAlign): ReactElement {
    switch (align) {
      case 'center':
        return <FormatAlignCenterRoundedIcon sx={{ mx: 3 }} />
      case 'right':
        return <FormatAlignRightRoundedIcon sx={{ mx: 3 }} />
      default:
        return <FormatAlignLeftRoundedIcon sx={{ mx: 3 }} />
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
        display: 'flex'
      }}
    >
      {sorted.map((alignment) => {
        return (
          <ToggleButton
            value={alignment}
            key={`${id}-align-${alignment}`}
            sx={{ justifyContent: 'flex-start' }}
          >
            {iconSelector(alignment)}
            <Typography variant="subtitle2">{capitalize(alignment)}</Typography>
          </ToggleButton>
        )
      })}
    </ToggleButtonGroup>
  )
}

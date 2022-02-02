import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { ReactElement, useState, useEffect } from 'react'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import capitalize from 'lodash/capitalize'
import { Icon as CoreIcon } from '@core/journeys/ui'
import {
  IconColor,
  IconSize,
  IconName
} from '../../../../../../../../__generated__/globalTypes'
import { SizeToggleGroup } from './SizeToggleGroup'
import { ColorToggleGroup } from './ColorToggleGroup'

interface IconProps {
  id: string
  iconName?: IconName
  iconColor: IconColor | null | undefined
  iconSize: IconSize | null | undefined
}

export function Icon({
  id,
  iconName,
  iconColor,
  iconSize
}: IconProps): ReactElement {
  const [showProps, setShowProps] = useState(iconName != null)
  const [name, setName] = useState('')

  useEffect(() => {
    setShowProps(iconName != null)
    setName(iconName != null ? iconName : '')
  }, [iconName])

  function handleChange(event: SelectChangeEvent): void {
    setName(event.target.value)
    setShowProps(event.target.value !== '')
  }

  return (
    <Box sx={{ px: 6 }}>
      <Box sx={{ display: 'flex', pt: 4, flexDirection: 'column' }}>
        <Typography variant="subtitle2">Show Icon</Typography>
        <Typography variant="caption">Show/Hide Icon on Button</Typography>
      </Box>

      <FormControl fullWidth hiddenLabel sx={{ pt: 4, pb: 9 }}>
        <Select
          labelId="icon-name-select"
          id="icon-name-select"
          value={name}
          onChange={handleChange}
          variant="filled"
          displayEmpty
          IconComponent={KeyboardArrowDownRoundedIcon}
          inputProps={{ 'aria-label': 'icon-name-select' }}
        >
          <MenuItem value="">Select an icon...</MenuItem>
          {Object.values(IconName).map((name) => {
            return (
              <MenuItem key={`button-icon-name-${name}`} value={name}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CoreIcon
                    __typename={'Icon'}
                    name={name}
                    color={null}
                    size={null}
                  />

                  <Typography sx={{ pl: 3 }}>{capitalize(name)}</Typography>
                </Box>
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>

      {showProps && (
        <Box>
          <ColorToggleGroup id={id} color={iconColor} />
          <SizeToggleGroup id={id} size={iconSize} />
        </Box>
      )}
    </Box>
  )
}

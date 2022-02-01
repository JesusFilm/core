import { ReactElement, useState, useEffect } from 'react'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import capitalize from 'lodash/capitalize'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import { Icon } from '@core/journeys/ui'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import { IconName } from '../../../../../../../../../__generated__/globalTypes'

interface NameListProps {
  id: string
  name?: IconName
  disabled: boolean
}

export function NameList({ id, name, disabled }: NameListProps): ReactElement {
  const [iconName, setIconName] = useState('')
  useEffect(() => {
    name != null ? setIconName(name) : setIconName('')
  }, [name])

  function handleChange(event: SelectChangeEvent): void {
    setIconName(event.target.value)
  }
  return (
    <FormControl fullWidth hiddenLabel sx={{ pt: 4, pb: 9 }}>
      <Select
        labelId="icon-name-select"
        id="icon-name-select"
        value={iconName}
        onChange={handleChange}
        variant="filled"
        disabled={disabled}
        displayEmpty
        IconComponent={KeyboardArrowDownRoundedIcon}
        inputProps={{ 'aria-label': 'icon-name-select' }}
        sx={{
          '&.Mui-disabled': {
            backgroundColor: 'transparent'
          }
        }}
      >
        <MenuItem value="">Select an icon...</MenuItem>
        {Object.values(IconName).map((name) => {
          return (
            <MenuItem key={`button-icon-name-${name}`} value={name}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Icon
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
  )
}

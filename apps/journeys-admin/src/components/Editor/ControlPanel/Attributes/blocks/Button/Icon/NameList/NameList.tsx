import { ReactElement, useState, useEffect } from 'react'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import capitalize from 'lodash/capitalize'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
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
    <FormControl fullWidth>
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
            backgroundColor: 'white'
          }
        }}
      >
        <MenuItem value="">None</MenuItem>
        {Object.values(IconName).map((name) => {
          return (
            <MenuItem key={`button-icon-name-${name}`} value={name}>
              {capitalize(name)}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

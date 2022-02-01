import { ReactElement, useState } from 'react'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import capitalize from 'lodash/capitalize'
import { IconName } from '../../../../../../../../../__generated__/globalTypes'

interface NameListProps {
  id: string
  name: IconName | string | undefined
  disabled: boolean
}

export function NameList({ id, name, disabled }: NameListProps): ReactElement {
  const [iconName, setIconName] = useState(name)

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
      >
        {Object.values(IconName).map((name) => {
          return (
            <MenuItem key={`button-icon-name-${name}`} value={name}>
              {/* Icon */}
              {capitalize(name)}
            </MenuItem>
          )
        })}
      </Select>
    </FormControl>
  )
}

import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Switch from '@mui/material/Switch'
import { ReactElement, useState } from 'react'
import {
  IconColor,
  IconSize,
  IconName
} from '../../../../../../../../__generated__/globalTypes'
import { SizeToggleGroup } from './SizeToggleGroup'
import { ColorToggleGroup } from './ColorToggleGroup'
import { NameList } from './NameList'

interface IconProps {
  id: string
  iconName: IconName | undefined
  iconColor: IconColor | null | undefined
  iconSize: IconSize | null | undefined
}

export function Icon({
  id,
  iconName,
  iconColor,
  iconSize
}: IconProps): ReactElement {
  const [checked, setChecked] = useState(true)

  return (
    <>
      <Box sx={{ display: 'flex' }}>
        <Box sx={{ flexDirection: 'column' }}>
          <Typography variant="subtitle2">Show Icon</Typography>
          <Typography variant="caption">Show/Hide Icon on Button</Typography>
        </Box>
        <Switch
          checked={checked}
          // onChange={handleOpenOptions}
          inputProps={{ 'aria-label': 'controlled' }}
          sx={{
            marginLeft: 'auto'
          }}
        />
      </Box>

      <NameList id={id} name={iconName} disabled={!checked} />

      <Box>
        <ColorToggleGroup id={id} color={iconColor} />
        <SizeToggleGroup id={id} size={iconSize} />
      </Box>
    </>
  )
}

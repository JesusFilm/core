import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { ReactElement } from 'react'

import { Icon, IconName } from '../Icon'

interface CenterCheckProps {
  name: IconName
}

export function CenterCheck({ name }: CenterCheckProps): ReactElement {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid red',
        height: '96px',
        width: '96px'
      }}
    >
      <Divider
        flexItem
        orientation="vertical"
        sx={{
          position: 'absolute',
          backgroundColor: 'red',
          height: '94px'
        }}
      />
      <Divider
        sx={{
          position: 'absolute',
          backgroundColor: 'red',
          width: '96px'
        }}
      />
      <Divider
        sx={{
          position: 'absolute',
          backgroundColor: 'red',
          width: '135px',
          transform: 'rotate(45deg)'
        }}
      />
      <Divider
        sx={{
          position: 'absolute',
          backgroundColor: 'red',
          width: '135px',
          transform: 'rotate(-45deg)'
        }}
      />
      <Icon name={name} sx={{ fontSize: '96px' }} />
    </Box>
  )
}

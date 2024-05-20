import Box from '@mui/material/Box'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { GoalType } from '@core/journeys/ui/Button/utils/getLinkActionGoal'
import { getLinkActionDetails } from '@core/journeys/ui/getLinkActionDetails'

import { BaseNode } from '../BaseNode'

export function LinkNode(): ReactElement {
  const { label, icon } = getLinkActionDetails(GoalType.Chat, false)

  console.log('label', label)

  return (
    <BaseNode id="id">
      <Box
        sx={{
          px: 3,
          transition: (theme) => theme.transitions.create('opacity'),
          margin: 0,
          border: (theme) =>
            `1px solid ${alpha(theme.palette.secondary.dark, 0.1)}`,
          borderRadius: 2,
          height: 45,
          width: 200,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {icon}
        <Typography
          noWrap
          sx={{
            fontWeight: 'bold',
            fontSize: 20
          }}
          variant="body2"
        >
          {label}
        </Typography>
      </Box>
    </BaseNode>
  )
}

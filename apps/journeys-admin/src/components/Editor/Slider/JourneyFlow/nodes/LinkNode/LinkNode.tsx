import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'

import { GoalType } from '@core/journeys/ui/Button/utils/getLinkActionGoal'
import { useGoalDetails } from '@core/journeys/ui/useGoalDetails'

import { BaseNode } from '../BaseNode'

export function LinkNode(): ReactElement {
  const { label, icon } = useGoalDetails(GoalType.Chat)

  const url = 'https://bible.com'

  return (
    <BaseNode id="LinkNode" isTargetConnectable>
      <Stack
        gap={1}
        alignItems="center"
        direction="row"
        sx={{
          px: 3,
          margin: 0,
          height: 45,
          width: 224,
          borderRadius: 2,
          border: (theme) =>
            `1px solid ${alpha(theme.palette.secondary.dark, 0.1)}`,
          transition: (theme) => theme.transitions.create('opacity')
        }}
      >
        {icon}
        <Stack sx={{ width: '100%' }}>
          <Typography
            noWrap
            variant="body2"
            sx={{ fontWeight: 'bold', fontSize: 11 }}
          >
            {label}
          </Typography>
          <Typography noWrap variant="body2" sx={{ fontSize: 10 }}>
            {url}
          </Typography>
        </Stack>
      </Stack>
    </BaseNode>
  )
}

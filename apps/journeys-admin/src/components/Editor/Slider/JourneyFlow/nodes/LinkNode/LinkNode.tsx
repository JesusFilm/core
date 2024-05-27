import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { NodeProps } from 'reactflow'

import { getLinkActionGoal } from '@core/journeys/ui/Button/utils/getLinkActionGoal'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { filterActionBlocks } from '@core/journeys/ui/filterActionBlocks'
import { useGoalDetails } from '@core/journeys/ui/useGoalDetails'

import { BaseNode } from '../BaseNode'

export function LinkNode({ id }: NodeProps): ReactElement {
  const {
    state: { steps }
  } = useEditor()
  const strippedNodeId = id.replace('LinkNode-', '')

  const actionBlocks = steps
    ?.map((step) => filterActionBlocks(step))
    .flat()
    .filter(
      (block) =>
        block.action?.__typename === 'LinkAction' ||
        block.action?.__typename === 'EmailAction'
    )

  const matchedActionBlock = actionBlocks?.find(
    (block) => block.id === strippedNodeId
  )

  function getActionDetail(matchedActionBlock): string {
    switch (matchedActionBlock?.action?.__typename) {
      case 'LinkAction':
        return matchedActionBlock.action.url
      case 'EmailAction':
        return matchedActionBlock.action.email
      default:
        return ''
    }
  }

  const actionDetail = getActionDetail(matchedActionBlock)
  const { label, icon } = useGoalDetails(getLinkActionGoal(actionDetail))

  return (
    <BaseNode id={id} isTargetConnectable>
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
            {actionDetail}
          </Typography>
        </Stack>
      </Stack>
    </BaseNode>
  )
}

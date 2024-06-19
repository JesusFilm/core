import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { NodeProps } from 'reactflow'

import { getLinkActionGoal } from '@core/journeys/ui/Button/utils/getLinkActionGoal'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { filterActionBlocks } from '@core/journeys/ui/filterActionBlocks'
import { getGoalDetails } from '@core/journeys/ui/getGoalDetails'

import { BaseNode } from '../BaseNode'
import { LINK_NODE_HEIGHT, LINK_NODE_WIDTH } from '../StepBlockNode/libs/sizes'

export function LinkNode({ id }: NodeProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { steps }
  } = useEditor()
  const strippedNodeId = id.replace('LinkNode-', '')

  const matchedActionBlock = steps
    ?.flatMap((step) => filterActionBlocks(step))
    .find(({ id }) => id === strippedNodeId)

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
  const { label, icon } = getGoalDetails(getLinkActionGoal(actionDetail), t)

  return (
    <BaseNode id={id} targetHandle="disabled">
      <Stack
        gap={2}
        alignItems="center"
        direction="row"
        sx={{
          px: 3,
          margin: 0,
          height: LINK_NODE_HEIGHT,
          width: LINK_NODE_WIDTH,
          borderRadius: 2,
          border: (theme) =>
            `2px solid ${alpha(theme.palette.secondary.dark, 0.1)}`,
          transition: (theme) => theme.transitions.create('opacity')
        }}
      >
        {icon}
        <Stack
          sx={{ width: '85%' }}
          alignItems="start"
          justifyContent="center"
          gap={0}
        >
          <Typography
            noWrap
            variant="body2"
            gutterBottom
            sx={{
              width: '100%',
              fontWeight: 'bold',
              fontSize: 11,
              lineHeight: '11px'
            }}
          >
            {label}
          </Typography>
          <Typography
            noWrap
            variant="body2"
            sx={{
              width: '100%',
              fontSize: 10,
              lineHeight: '12px'
            }}
          >
            {actionDetail}
          </Typography>
        </Stack>
      </Stack>
    </BaseNode>
  )
}

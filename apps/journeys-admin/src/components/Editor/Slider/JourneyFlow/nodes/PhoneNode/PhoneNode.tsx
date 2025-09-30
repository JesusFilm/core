import Fade from '@mui/material/Fade'
import Stack from '@mui/material/Stack'
import { alpha } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { NodeProps } from 'reactflow'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { filterActionBlocks } from '@core/journeys/ui/filterActionBlocks'
import { getGoalDetails } from '@core/journeys/ui/getGoalDetails'
import { ActionBlock } from '@core/journeys/ui/isActionBlock'

import { ContactActionType } from '../../../../../../../__generated__/globalTypes'
import { BaseNode, HandleVariant } from '../BaseNode'
import { LinkNodeAnalytics } from '../LinkNode/LinkNodeAnalytics'
import { LINK_NODE_HEIGHT, LINK_NODE_WIDTH } from '../StepBlockNode/libs/sizes'

export function PhoneNode({ id }: NodeProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const {
    state: { steps, showAnalytics }
  } = useEditor()
  const strippedNodeId = id.replace('PhoneNode-', '')

  const matchedActionBlock = steps
    ?.flatMap((step) => filterActionBlocks(step))
    .find(({ id }) => id === strippedNodeId)

  function getActionDetail(matchedActionBlock?: ActionBlock): string {
    switch (matchedActionBlock?.action?.__typename) {
      case 'PhoneAction':
        return matchedActionBlock.action.phone
      case 'LinkAction':
        return matchedActionBlock.action.url
      case 'EmailAction':
        return matchedActionBlock.action.email
      default:
        return ''
    }
  }

  const actionDetail = getActionDetail(matchedActionBlock)
  const { label, icon } = getGoalDetails(
    matchedActionBlock?.action?.__typename === 'PhoneAction' &&
      matchedActionBlock?.action?.contactAction === 'text'
      ? 'Text'
      : 'Call',
    t
  )

  return (
    <BaseNode id={id} targetHandle={HandleVariant.Disabled}>
      <Stack
        gap={2}
        alignItems="center"
        direction="row"
        sx={{
          pr: 3,
          m: 0,
          height: LINK_NODE_HEIGHT,
          width: LINK_NODE_WIDTH,
          borderRadius: 2,
          border: (theme) =>
            `2px solid ${alpha(theme.palette.secondary.dark, 0.1)}`,
          transition: (theme) => theme.transitions.create('opacity'),
          ':hover': {
            cursor: 'grab'
          }
        }}
      >
        <Fade in={showAnalytics}>
          <div>
            <LinkNodeAnalytics actionBlock={matchedActionBlock} />
          </div>
        </Fade>
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
              lineHeight: '12px',
              pr: 3
            }}
          >
            {actionDetail}
          </Typography>
        </Stack>
      </Stack>
    </BaseNode>
  )
}

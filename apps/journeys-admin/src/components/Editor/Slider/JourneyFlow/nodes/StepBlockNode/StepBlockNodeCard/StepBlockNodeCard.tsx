import Card from '@mui/material/Card'
import Box from '@mui/material/Box'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import { ReactElement } from 'react'
import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../__generated__/BlockFields'

import { getCardMetadata } from '../libs/getCardMetadata'
import { StepBlockNodeIcon } from '../StepBlockNodeIcon'
import { STEP_NODE_HEIGHT, STEP_NODE_WIDTH } from '../StepBlockNode'
import { TreeBlock } from '@core/journeys/ui/block'
import { ActiveFab, useEditor } from '@core/journeys/ui/EditorProvider'

interface StepBlockNodeCardProps {
  step: TreeBlock<StepBlock>
  selected: boolean
}

export function StepBlockNodeCard({
  step,
  selected
}: StepBlockNodeCardProps): ReactElement {
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()
  const card = step?.children[0] as TreeBlock<CardBlock> | undefined
  const { title, subtitle, description, priorityBlock, bgImage } =
    getCardMetadata(card)

  function handleClick(): void {
    if (selectedStep?.id === step?.id) {
      dispatch({
        type: 'SetSelectedBlockAction',
        selectedBlock: selectedStep
      })
      dispatch({ type: 'SetActiveFabAction', activeFab: ActiveFab.Add })
      dispatch({
        type: 'SetSelectedAttributeIdAction',
        selectedAttributeId: `${selectedStep?.id ?? ''}-next-block`
      })
    } else {
      dispatch({ type: 'SetSelectedStepAction', selectedStep: step })
    }
  }

  return (
    <Card
      sx={{ width: 190, m: 1.5 }}
      elevation={selected ? 6 : 1}
      title="Click to edit or drag"
      onClick={handleClick}
    >
      <CardContent
        data-testid="Step block"
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyItems: 'center',
          width: STEP_NODE_WIDTH,
          height: STEP_NODE_HEIGHT,
          gap: 2,
          margin: 0,
          padding: 0,
          borderRadius: 1,
          paddingBottom: '0px !important'
        }}
      >
        <Box
          sx={{
            height: '100%',
            flexShrink: 0,
            width: 50,
            borderBottomLeftRadius: 6,
            borderTopLeftRadius: 6,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: card?.backgroundColor ?? 'background.default',
            backgroundImage: bgImage != null ? `url(${bgImage})` : undefined
          }}
        >
          {priorityBlock != null && (
            <StepBlockNodeIcon typename={priorityBlock.__typename} />
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            width: STEP_NODE_WIDTH,
            height: STEP_NODE_HEIGHT,
            margin: 0,
            padding: 2
          }}
        >
          <Typography
            sx={{
              display: '-webkit-box',
              '-webkit-box-orient': 'vertical',
              '-webkit-line-clamp': '1',
              overflow: 'hidden',
              padding: 0,
              fontSize: 9,
              height: 'auto',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignSelf: 'flex-start',
              marginBottom: 1,
              lineHeight: 1.3,
              alignItems: 'flex-end',
              color: '#444451'
            }}
          >
            {description !== '' ? description : ''}
          </Typography>
          <Typography
            sx={{
              display: '-webkit-box',
              '-webkit-box-orient': 'vertical',
              '-webkit-line-clamp': '2',
              overflow: 'hidden',
              padding: 0,
              fontSize: 11,
              fontWeight: 'bold',
              height: 'auto',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignSelf: 'flex-start',
              marginBottom: 1,
              lineHeight: 1.3,
              alignItems: 'flex-end',
              color: '#26262E',
              wordBreak: 'break-all'
            }}
          >
            {title != null && title !== '' ? (
              title
            ) : (
              <Skeleton
                animation={false}
                sx={{
                  height: 16,
                  width: 117,
                  borderRadius: 1,
                  color: 'background.paper'
                }}
              />
            )}
          </Typography>
          <Typography
            sx={{
              display: '-webkit-box',
              '-webkit-box-orient': 'vertical',
              '-webkit-line-clamp': '2',
              fontSize: 10,
              lineHeight: '1.2',
              justifyContent: 'top',
              color: '#444451',
              overflow: 'hidden',
              paddingBottom: '1px'
            }}
          >
            {subtitle != null && subtitle !== '' ? (
              subtitle
            ) : (
              <Skeleton
                animation={false}
                sx={{
                  height: 16,
                  width: 95,
                  borderRadius: 1,
                  color: 'background.paper'
                }}
              />
            )}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  )
}

import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'
import { Handle, OnConnect, Position } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import {
  StepAndCardBlockCreate,
  StepAndCardBlockCreateVariables
} from '../../../../__generated__/StepAndCardBlockCreate'
import { STEP_AND_CARD_BLOCK_CREATE } from '../../CardPreview/CardPreview'

export const NODE_WIDTH = 150
export const NODE_HEIGHT = 80

interface BaseNodeProps {
  isTargetConnectable?: boolean
  isSourceConnectable?: boolean
  onSourceConnect?: (
    params: { target: string } | Parameters<OnConnect>[0]
  ) => void
  onClick?: () => void
  icon: ReactNode
  title: string
  selected?: 'descendant' | boolean
}

export function BaseNode({
  isTargetConnectable,
  isSourceConnectable,
  onSourceConnect,
  onClick,
  icon,
  title,
  selected = false
}: BaseNodeProps): ReactElement {
  const { journey } = useJourney()
  const [stepAndCardBlockCreate] = useMutation<
    StepAndCardBlockCreate,
    StepAndCardBlockCreateVariables
  >(STEP_AND_CARD_BLOCK_CREATE)

  const handleClick = async (): Promise<void> => {
    if (journey == null) return

    const stepId = uuidv4()
    const cardId = uuidv4()
    const { data } = await stepAndCardBlockCreate({
      variables: {
        stepBlockCreateInput: {
          id: stepId,
          journeyId: journey.id
        },
        cardBlockCreateInput: {
          id: cardId,
          journeyId: journey.id,
          parentBlockId: stepId,
          themeMode: ThemeMode.dark,
          themeName: ThemeName.base
        }
      },
      update(cache, { data }) {
        if (data?.stepBlockCreate != null && data?.cardBlockCreate != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
            fields: {
              blocks(existingBlockRefs = []) {
                const newStepBlockRef = cache.writeFragment({
                  data: data.stepBlockCreate,
                  fragment: gql`
                    fragment NewBlock on Block {
                      id
                    }
                  `
                })
                const newCardBlockRef = cache.writeFragment({
                  data: data.cardBlockCreate,
                  fragment: gql`
                    fragment NewBlock on Block {
                      id
                    }
                  `
                })
                return [...existingBlockRefs, newStepBlockRef, newCardBlockRef]
              }
            }
          })
        }
      }
    })
    if (data?.stepBlockCreate != null) {
      onSourceConnect?.({
        target: data.stepBlockCreate.id
      })
    }
  }

  return isTargetConnectable !== false ? (
    <Card // regular card
      sx={{
        borderRadius: 1,
        outline: '2px solid',
        outlineColor: (theme) =>
          selected === true
            ? theme.palette.primary.main
            : selected === 'descendant'
            ? theme.palette.divider
            : 'transparent',
        outlineOffset: '5px'
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          gap: 2
        }}
        onClick={onClick}
      >
        {icon}
        <Typography
          sx={{
            display: '-webkit-box',
            '-webkit-box-orient': 'vertical',
            '-webkit-line-clamp': '2',
            overflow: 'hidden'
          }}
        >
          {title}
        </Typography>
      </CardContent>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: 15,
          height: 15,
          background: '#636363'
        }}
      />
      <Handle
        type="target"
        position={Position.Left}
        isConnectableStart={false}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 0,
          background: '#636363',
          opacity: 0
        }}
      />
      {isSourceConnectable !== false && (
        <Handle
          type="source"
          position={Position.Right}
          onConnect={onSourceConnect}
          onClick={handleClick}
          style={{
            width: '15px',
            height: '15px',
            background: '#636363'
          }}
        />
      )}
    </Card>
  ) : (
    <Box // action label
      sx={{
        borderRadius: 1,
        outline: '2px solid',
        outlineColor: (theme) =>
          selected === true
            ? theme.palette.primary.main
            : selected === 'descendant'
            ? theme.palette.divider
            : 'transparent',
        outlineOffset: '5px'
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          gap: 2
        }}
        onClick={onClick}
      >
        {icon}
        <Typography
          sx={{
            display: '-webkit-box',
            '-webkit-box-orient': 'vertical',
            '-webkit-line-clamp': '2',
            overflow: 'hidden'
          }}
        >
          {title}
        </Typography>
      </CardContent>
      {isTargetConnectable && <Handle type="target" position={Position.Left} />}
      {isSourceConnectable !== false && (
        <Handle
          type="source"
          position={Position.Right}
          onConnect={onSourceConnect}
          onClick={handleClick}
          style={{
            left: '80%',
            width: '15px',
            height: '15px',
            background: '#636363'
          }}
        />
      )}
    </Box>
  )
}

import { gql, useMutation } from '@apollo/client'
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode, useState } from 'react'
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

  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = (): void => {
    setIsHovered(true)
    console.log('hovered over')
  }

  const handleMouseLeave = (): void => {
    setIsHovered(false)
  }

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
    <Box
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{ height: '150%', overflow: 'visible' }}
    >
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
          outlineOffset: '2px'
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
            gap: 2,
            borderRadius: 1
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
          position={Position.Top}
          style={{
            width: 7,
            height: 7,
            background: 'white',
            border:
              selected !== false ? '2px solid #c52d3aff' : '2px solid #aaacbb ',
            outline: '1.5px solid white',
            outlineColor: 'white',
            cursor: 'pointer'
          }}
        />
        <Handle
          type="target"
          position={Position.Bottom}
          isConnectableStart={false}
          style={{
            overflow: 'visible',
            width: '100%',
            height: '100%',
            borderRadius: 0,
            background: 'tranparent',
            opacity: 0
          }}
        />
        {isSourceConnectable !== false && (
          <Handle
            type="source"
            position={Position.Bottom}
            onConnect={onSourceConnect}
            onClick={handleClick}
            style={{
              width: 7,
              height: 7,
              background: 'white',
              border:
                selected !== false
                  ? '2px solid #c52d3aff'
                  : '2px solid #aaacbb ',
              outline: '1.5px solid white',
              outlineColor: 'white',
              visibility: isHovered ? 'hidden' : 'visible'
            }}
          />
        )}
        {isHovered && (
          <Box
            style={{
              position: 'absolute',
              background: 'transparent',
              borderColor: 'transparent',
              cursor: 'pointer',
              margin: 0,
              padding: 0,
              width: NODE_WIDTH,
              height: 18,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Handle
              type="source"
              position={Position.Bottom}
              onConnect={onSourceConnect}
              onClick={handleClick}
              style={{
                width: NODE_WIDTH / 2,
                height: 30,
                background: 'transparent',
                borderColor: 'transparent',
                borderRadius: 0,
                overflow: 'visible'
              }}
            />
            <ArrowDownwardRoundedIcon
              style={{
                borderRadius: '50%',
                color: 'white',
                fontSize: 'large',
                padding: 0,
                marginTop: 5,
                backgroundColor: '#c52d3aff'
              }}
            />
          </Box>
        )}
      </Card>
    </Box>
  ) : (
    <Box // action label
      sx={{
        borderRadius: 20,
        backgroundColor: 'white',
        outline: '2px solid',
        outlineColor: (theme) =>
          selected === true
            ? theme.palette.primary.main
            : selected === 'descendant'
            ? theme.palette.divider
            : 'lightgrey'
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: NODE_WIDTH - 20,
          height: 'auto',
          padding: 1
        }}
        onClick={onClick}
      >
        {icon}
        <Typography
          sx={{
            display: '-webkit-box',
            '-webkit-box-orient': 'vertical',
            '-webkit-line-clamp': '1',
            overflow: 'hidden',
            fontSize: 'small',
            paddingLeft: 1
          }}
        >
          {title}
        </Typography>
      </CardContent>
      {isSourceConnectable !== false && (
        <Handle
          type="source"
          position={Position.Bottom}
          onConnect={onSourceConnect}
          onClick={handleClick}
          style={{
            width: 7,
            height: 7,
            background: 'white',
            border:
              selected !== false ? '2px solid #c52d3aff' : '2px solid #aaacbb ',
            outline: '1.5px solid white',
            outlineColor: 'white'
          }}
        />
      )}
    </Box>
  )
}

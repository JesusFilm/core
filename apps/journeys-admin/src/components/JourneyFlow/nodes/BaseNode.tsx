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
import { useStepAndCardBlockCreateMutation } from '../../../libs/useStepAndCardBlockCreateMutation'

export const ACTION_NODE_WIDTH = 125
export const ACTION_NODE_HEIGHT = 28
export const ACTION_NODE_WIDTH_GAP = 11
export const ACTION_NODE_HEIGHT_GAP = 8

export const STEP_NODE_WIDTH = 150
export const STEP_NODE_HEIGHT = 80
export const STEP_NODE_WIDTH_GAP = 200
export const STEP_NODE_HEIGHT_GAP =
  ACTION_NODE_HEIGHT + ACTION_NODE_HEIGHT_GAP + 43

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
  variant?: 'step' | 'action'
}

export function BaseNode({
  isTargetConnectable,
  isSourceConnectable,
  onSourceConnect,
  onClick,
  icon,
  title,
  selected = false,
  variant = 'step'
}: BaseNodeProps): ReactElement {
  const { journey } = useJourney()
  const [stepAndCardBlockCreate] = useStepAndCardBlockCreateMutation()
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = (): void => {
    setIsHovered(true)
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
      }
    })
    if (data?.stepBlockCreate != null) {
      onSourceConnect?.({
        target: data.stepBlockCreate.id
      })
    }
  }

  switch (variant) {
    case 'step':
      return (
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
                width: STEP_NODE_WIDTH,
                height: STEP_NODE_HEIGHT,
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
                  selected !== false
                    ? '2px solid #c52d3aff'
                    : '2px solid #aaacbb ',
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
                className="dragToCreateHitbox"
                style={{
                  position: 'absolute',
                  background: 'transparent',
                  borderColor: 'transparent',
                  cursor: 'pointer',
                  margin: 0,
                  padding: 0,
                  width: STEP_NODE_WIDTH,
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
                    width: STEP_NODE_WIDTH / 2,
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
      )
    case 'action':
      return (
        <Box
          sx={{
            borderRadius: 20,
            outline: (theme) => `2px solid ${theme.palette.divider}`,
            backgroundColor: '#eff2f5',
            width: ACTION_NODE_WIDTH,
            height: ACTION_NODE_HEIGHT,
            py: 1,
            px: 4
          }}
          onClick={onClick}
        >
          <Typography
            sx={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: 10
            }}
            variant="body2"
          >
            {title}
          </Typography>
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
                outlineColor: 'white'
              }}
            />
          )}
        </Box>
      )
  }
}

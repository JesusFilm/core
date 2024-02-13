import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode, useState } from 'react'
import { Handle, OnConnect, Position } from 'reactflow'
import { v4 as uuidv4 } from 'uuid'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { ThemeMode, ThemeName } from '../../../../__generated__/globalTypes'
import {} from '../../../../__generated__/StepAndCardBlockCreate'
import { useStepAndCardBlockCreateMutation } from '../../../libs/useStepAndCardBlockCreateMutation'

export const ACTION_NODE_WIDTH = 125
export const ACTION_NODE_HEIGHT = 28
export const ACTION_NODE_WIDTH_GAP = 11
export const ACTION_NODE_HEIGHT_GAP = 16

export const STEP_NODE_WIDTH = 200
export const STEP_NODE_HEIGHT = 76
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
  iconAndImage: ReactNode
  title?: string
  subtitle?: string
  description?: string
  selected?: 'descendant' | boolean
  variant?: 'step' | 'action'
}

export function BaseNode({
  isTargetConnectable,
  isSourceConnectable,
  onSourceConnect,
  onClick,
  iconAndImage,
  title,
  subtitle,
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
          <Card
            sx={{
              borderRadius: 2,
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
                justifyItems: 'center',
                width: STEP_NODE_WIDTH,
                height: STEP_NODE_HEIGHT,
                gap: 2,
                margin: 0,
                padding: 0,
                borderRadius: 1
              }}
              onClick={onClick}
            >
              {iconAndImage}

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
                onClick={onClick}
              >
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
                    marginBottom: 0.5,
                    lineHeight: 1.3,
                    alignItems: 'flex-end'
                  }}
                >
                  {title ?? (
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
                    color: '#7f7e8c',
                    overflow: 'hidden',
                    paddingBottom: '1px'
                  }}
                >
                  {title != null ? (
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
              {isHovered && (
                <>
                  <ArrowDownwardRoundedIcon
                    style={{
                      display: 'flex',
                      top: STEP_NODE_HEIGHT - 9,
                      left: STEP_NODE_WIDTH / 2 - 9,
                      position: 'absolute',
                      borderRadius: '50%',
                      color: 'white',
                      fontSize: 'large',
                      padding: 0,
                      marginTop: 5,
                      backgroundColor: '#c52d3aff'
                    }}
                  />
                </>
              )}
            </CardContent>
            <Handle
              type="target"
              position={Position.Top}
              style={{
                width: 7.5,
                height: 7.5,
                background: 'white',
                border:
                  selected !== false
                    ? '2px solid #c52d3aff'
                    : '2px solid #aaacbb',
                outline: '1px solid white',
                outlineColor: 'white',
                cursor: 'pointer',
                top: selected !== false ? -9.5 : -4
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
            <Handle
              type="source"
              position={Position.Bottom}
              onConnect={onSourceConnect}
              onClick={handleClick}
              style={{
                width: 7.5,
                height: 7.5,
                background: 'white',
                border:
                  selected !== false
                    ? '2px solid #c52d3aff'
                    : '2px solid #aaacbb',
                outline: '1px solid',
                outlineColor: 'white',
                visibility: isHovered ? 'hidden' : 'visible',

                bottom: selected !== false ? -9.5 : -4
              }}
            />

            <Handle
              type="source"
              position={Position.Bottom}
              onConnect={onSourceConnect}
              onClick={handleClick}
              style={{
                position: 'fixed',
                width: 40,
                height: 40,
                top: 60,
                background: 'transparent',
                borderColor: 'transparent',
                borderRadius: 20,
                overflow: 'visible'
              }}
            />
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
            outlineWidth: 1,
            outlineColor: 'grey',
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
                width: 7.5,
                height: 7.5,
                background: 'white',
                border:
                  selected !== false
                    ? '2px solid #c52d3aff'
                    : '2px solid #aaacbb ',
                outline: '1.5px solid',
                outlineColor: '#eef1f4'
              }}
            />
          )}
        </Box>
      )
  }
}

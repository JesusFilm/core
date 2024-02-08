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
  icon: ReactNode
  title: string
  language?: string
  subtitle?: string
  blockType?: string
  videoStartToEnd?: string
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
  language,
  subtitle,
  blockType,
  videoStartToEnd,
  selected = false,
  variant = 'step'
}: BaseNodeProps): ReactElement {
  const { journey } = useJourney()
  const [stepAndCardBlockCreate] = useStepAndCardBlockCreateMutation()
  const [isHovered, setIsHovered] = useState(false)

  const handleMouseEnter = (): void => {
    // setIsHovered(true)  //DISABLED untill design is given
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
      switch (blockType) {
        case 'VideoBlock':
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
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    width: STEP_NODE_WIDTH,
                    height: STEP_NODE_HEIGHT,
                    gap: 2,
                    margin: 0,
                    padding: 0
                  }}
                  onClick={onClick}
                >
                  {icon}

                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'left',
                      justifyContent: 'center',
                      width: STEP_NODE_WIDTH,
                      height: STEP_NODE_HEIGHT,
                      margin: 0,
                      paddingLeft: 1,
                      paddingRight: 3
                    }}
                    onClick={onClick}
                  >
                    <Typography
                      sx={{
                        display: '-webkit-box',
                        '-webkit-box-orient': 'vertical',
                        '-webkit-line-clamp': '1',
                        overflow: 'hidden',
                        padding: 0,
                        fontSize: 10,
                        color: '#7f7e8c',
                        height: 10,
                        lineHeight: 1,
                        marginBottom: 0,
                        alignContent: 'left'
                      }}
                    >
                      {language !== '' ? (
                        language
                      ) : (
                        <Box
                          sx={{
                            height: 12,
                            width: 37,
                            borderRadius: 1,
                            backgroundColor: '#efefef',
                            backgroundSize: 'cover',
                            alignItems: 'left',

                            lineHeight: 1,
                            alignContent: 'left',
                            display: 'flex',
                            justifyContent: 'flex-start',
                            marginTop: 0
                          }}
                        />
                      )}
                    </Typography>
                    <Typography
                      sx={{
                        display: '-webkit-box',
                        '-webkit-box-orient': 'vertical',
                        '-webkit-line-clamp': '2',
                        overflow: 'hidden',
                        fontWeight: 'bold',
                        fontSize: 11,

                        height: 'auto',
                        padding: 0,
                        top: 0,
                        lineHeight: 1.2,
                        transform: 'scaleY(0.9)',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        alignSelf: 'flex-start',
                        justifyContent: 'center',
                        marginBottom: 1,
                        marginTop: 1
                      }}
                    >
                      {title !== '' ? (
                        title
                      ) : (
                        <Box
                          sx={{
                            height: 12,
                            width: 117,
                            borderRadius: 1,
                            backgroundColor: '#efefef',
                            backgroundSize: 'cover',
                            alignItems: 'left',
                            alignContent: 'left',
                            display: 'flex',
                            justifyContent: 'flex-start'
                          }}
                        />
                      )}
                    </Typography>
                    <Typography
                      sx={{
                        display: '-webkit-box',
                        '-webkit-box-orient': 'vertical',
                        '-webkit-line-clamp': '2',
                        overflow: 'hidden',
                        padding: 0,
                        fontSize: 10,
                        height: 11,
                        lineHeight: 1.2,
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        alignSelf: 'flex-start',
                        marginBottom: 0,
                        top: 0
                      }}
                    >
                      {videoStartToEnd}
                    </Typography>
                  </Box>
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
                    visibility: isHovered ? 'hidden' : 'visible'
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
                {isHovered && (
                  <Box
                    className="dragToCreateHitbox"
                    style={{
                      position: 'absolute',
                      background: 'transparent',
                      borderColor: 'transparent',
                      cursor: 'pointer',
                      marginTop: selected === true ? 5 : 0,
                      padding: 0,
                      width: STEP_NODE_WIDTH,
                      height: 28,
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
                        height: 50,
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

        default:
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
                    alignItems: 'left',
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
                  {icon}

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
                        marginBottom: 1,
                        lineHeight: 1.3,
                        alignItems: 'flex-end'
                      }}
                    >
                      {title !== '' ? (
                        title
                      ) : (
                        <Box
                          sx={{
                            height: 12,
                            width: 117,
                            borderRadius: 1,
                            backgroundColor: '#efefef',
                            backgroundSize: 'cover',
                            alignItems: 'left',
                            alignContent: 'left',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            marginTop: 2
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
                        overflow: 'hidden'
                      }}
                    >
                      {title !== '' ? (
                        subtitle
                      ) : (
                        <Box
                          sx={{
                            height: 12,
                            width: 95,
                            borderRadius: 1,
                            backgroundColor: '#efefef',
                            backgroundSize: 'cover',
                            alignItems: 'left',
                            alignContent: 'left',
                            display: 'flex',
                            justifyContent: 'flex-start',
                            marginTop: 2
                          }}
                        />
                      )}
                    </Typography>
                  </Box>
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
                    visibility: isHovered ? 'hidden' : 'visible'
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
                {isHovered && (
                  <Box
                    className="dragToCreateHitbox"
                    style={{
                      position: 'absolute',
                      background: 'transparent',
                      borderColor: 'transparent',
                      cursor: 'pointer',
                      marginTop: selected === true ? 5 : 0,
                      padding: 0,
                      width: STEP_NODE_WIDTH,
                      height: 28,
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
                        height: 50,
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
      }

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

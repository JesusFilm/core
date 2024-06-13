import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import isFunction from 'lodash/isFunction'
import { useTranslation } from 'next-i18next'
import {
  ComponentProps,
  ReactElement,
  ReactNode,
  useEffect,
  useState
} from 'react'
import {
  Handle,
  OnConnect,
  Position,
  useOnSelectionChange,
  useStore
} from 'reactflow'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'

import {
  ACTION_BUTTON_HEIGHT,
  HANDLE_BORDER_WIDTH,
  HANDLE_DIAMETER,
  HANDLE_WITH_BORDER_DIAMETER,
  NODE_EXTRA_DETECTION_WIDTH,
  STEP_NODE_CARD_HEIGHT,
  STEP_NODE_CARD_WIDTH,
  STEP_NODE_WIDTH
} from '../StepBlockNode/libs/sizes'

import { PulseWrapper } from './PulseWrapper'

const StyledHandle = styled(Handle)(() => ({}))
const connectionHandleIdSelector = (state): string | null =>
  state.connectionHandleId
const connectionNodeIdSelector = (state): string | null =>
  state.connectionNodeId

interface BaseNodeProps {
  id?: string
  targetHandle?: 'show' | 'hide' | 'disabled'
  sourceHandle?: 'show' | 'hide' | 'disabled'
  onSourceConnect?: (
    params: { target: string } | Parameters<OnConnect>[0]
  ) => void
  selected?: 'descendant' | boolean
  isSourceConnected?: boolean
  sourceHandleProps?: Partial<ComponentProps<typeof StyledHandle>>
  dragging?: boolean
  children?:
    | ((context: { selected: 'descendant' | boolean }) => ReactNode)
    | ReactNode
}

export function BaseNode({
  id,
  targetHandle = 'hide',
  sourceHandle = 'hide',
  onSourceConnect,
  selected = false,
  isSourceConnected = false,
  sourceHandleProps,
  dragging,
  children
}: BaseNodeProps): ReactElement {
  const {
    state: { showJourneyFlowAnalytics }
  } = useEditor()
  const { t } = useTranslation('apps-journeys-admin')
  const connectionHandleId = useStore(connectionHandleIdSelector)
  const connectionNodeId = useStore(connectionNodeIdSelector)
  const isConnecting =
    (connectionHandleId != null || connectionNodeId != null) &&
    id !== connectionNodeId
  const [targetSelected, setTargetSelected] = useState(false)
  const [sourceSelected, setSourceSelected] = useState(false)

  useEffect(() => {
    if (showJourneyFlowAnalytics) {
      setTargetSelected(false)
      setSourceSelected(false)
    }
  }, [showJourneyFlowAnalytics])

  useOnSelectionChange({
    onChange: (selected) => {
      const selectedEdge = selected.edges[0]
      if (showJourneyFlowAnalytics) return
      setTargetSelected(selectedEdge?.target === id)
      setSourceSelected(
        selectedEdge?.sourceHandle != null
          ? selectedEdge.sourceHandle === id
          : selectedEdge?.source === id
      )
    }
  })

  return (
    <Box
      data-testid="BaseNode"
      sx={{
        position: 'relative',
        cursor: dragging === true ? 'grabbing' : 'pointer',
        '.arrow': {
          opacity: 0,
          transition: 'right 0.5s, opacity 0.4s'
        },
        ':hover .arrow': {
          opacity: isSourceConnected ? 0 : 1,
          right: -22 // animation travel length
        }
      }}
    >
      {isFunction(children) ? children({ selected }) : children}
      {(targetHandle === 'show' || targetHandle === 'disabled') && (
        <PulseWrapper show={isConnecting && targetHandle !== 'disabled'}>
          <StyledHandle
            type="target"
            data-testid={
              targetHandle === 'disabled'
                ? 'BaseNodeLeftHandle-disabled'
                : 'BaseNodeLeftHandle'
            }
            position={Position.Left}
            isConnectableStart={isConnecting && targetHandle !== 'disabled'}
            isConnectable={
              id !== connectionNodeId && targetHandle !== 'disabled'
            }
            sx={{
              width: HANDLE_DIAMETER + HANDLE_BORDER_WIDTH,
              height: HANDLE_DIAMETER + HANDLE_BORDER_WIDTH,
              left: -HANDLE_WITH_BORDER_DIAMETER / 2,
              top: isFunction(children)
                ? (STEP_NODE_CARD_HEIGHT + HANDLE_WITH_BORDER_DIAMETER) / 2
                : null,
              background: (theme) => theme.palette.background.default,
              border: (theme) =>
                (isConnecting && targetHandle !== 'disabled') || targetSelected
                  ? `${HANDLE_BORDER_WIDTH}px solid ${theme.palette.primary.main}`
                  : `${HANDLE_BORDER_WIDTH}px solid ${theme.palette.secondary.light}80`,

              '&:after': {
                display: isConnecting ? 'block' : 'none',
                position: 'absolute',
                content: '""',
                width: STEP_NODE_WIDTH + NODE_EXTRA_DETECTION_WIDTH,
                height: STEP_NODE_CARD_HEIGHT,
                top: -STEP_NODE_CARD_HEIGHT / 2,
                left: -NODE_EXTRA_DETECTION_WIDTH,
                backgroundColor: 'transparent'
              }
            }}
          />
        </PulseWrapper>
      )}
      {(sourceHandle === 'show' || sourceHandle === 'disabled') && (
        <StyledHandle
          id={id}
          type="source"
          title={t('Drag to connect')}
          data-testid="BaseNodeRightHandle"
          position={Position.Right}
          onConnect={onSourceConnect}
          isConnectable={sourceHandle !== 'disabled'}
          {...sourceHandleProps}
          sx={{
            border: 'none',
            width: HANDLE_DIAMETER,
            height: HANDLE_DIAMETER,
            background: (theme) =>
              sourceSelected
                ? theme.palette.primary.main
                : `${theme.palette.secondary.light}A0`,
            ...sourceHandleProps?.sx,

            '&:after': {
              content: '""',
              position: 'absolute',
              top: -((ACTION_BUTTON_HEIGHT - HANDLE_DIAMETER) / 2),
              width:
                id === 'SocialPreview'
                  ? NODE_EXTRA_DETECTION_WIDTH * 2
                  : STEP_NODE_CARD_WIDTH + NODE_EXTRA_DETECTION_WIDTH,
              height: ACTION_BUTTON_HEIGHT,
              right: -NODE_EXTRA_DETECTION_WIDTH / 2,
              backgroundColor: 'transparent'
            }
          }}
        >
          {sourceHandle === 'show' && (
            <ArrowRightIcon
              data-testid="BaseNodeConnectionArrowIcon"
              className="arrow"
              sx={{
                position: 'absolute',
                borderRadius: '100%',
                fontSize: 'large',
                color: 'background.paper',
                backgroundColor: 'primary.main',
                top: -HANDLE_DIAMETER,
                right: -HANDLE_DIAMETER,
                pointerEvents: 'none'
              }}
            />
          )}
        </StyledHandle>
      )}
    </Box>
  )
}

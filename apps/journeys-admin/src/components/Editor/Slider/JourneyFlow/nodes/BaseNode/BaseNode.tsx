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
  STEP_NODE_WIDTH
} from '../StepBlockNode/libs/sizes'

import { PulseWrapper } from './PulseWrapper'

export enum HandleVariant {
  None = 'none', // not rendered - Default value
  Shown = 'shown', // rendered, visible and connectable
  Hidden = 'hidden', // rendered, not visible or connectable.
  Disabled = 'disabled' // rendered, visible, not connectable
}

const StyledHandle = styled(Handle)(() => ({}))
const connectionHandleIdSelector = (state): string | null =>
  state.connectionHandleId
const connectionNodeIdSelector = (state): string | null =>
  state.connectionNodeId

interface BaseNodeProps {
  id?: string
  targetHandle?: HandleVariant
  sourceHandle?: HandleVariant
  onSourceConnect?: (
    params: { target: string } | Parameters<OnConnect>[0]
  ) => void
  selected?: 'descendant' | boolean
  isSourceConnected?: boolean
  sourceHandleProps?: Partial<ComponentProps<typeof StyledHandle>>
  dragging?: boolean
  positionTargetHandle?: boolean
  children?:
    | ((context: { selected: 'descendant' | boolean }) => ReactNode)
    | ReactNode
}

export function BaseNode({
  id,
  targetHandle = HandleVariant.None,
  sourceHandle = HandleVariant.None,
  onSourceConnect,
  selected = false,
  isSourceConnected = false,
  sourceHandleProps,
  dragging,
  children,
  positionTargetHandle = true
}: BaseNodeProps): ReactElement {
  const {
    state: { showAnalytics }
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
    if (showAnalytics === true) {
      setTargetSelected(false)
      setSourceSelected(false)
    }
  }, [showAnalytics])

  useOnSelectionChange({
    onChange: (selected) => {
      const selectedEdge = selected.edges[0]
      if (showAnalytics === true) return
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
      {(targetHandle === HandleVariant.Shown ||
        targetHandle === HandleVariant.Disabled ||
        targetHandle === HandleVariant.Hidden) && (
        <PulseWrapper
          show={
            id !== 'SocialPreview' &&
            isConnecting &&
            targetHandle === HandleVariant.Shown
          }
        >
          <StyledHandle
            type="target"
            data-testid={`BaseNodeLeftHandle-${targetHandle}`}
            position={Position.Left}
            isConnectableStart={
              isConnecting && targetHandle === HandleVariant.Shown
            }
            isConnectable={
              id !== connectionNodeId && targetHandle === HandleVariant.Shown
            }
            sx={{
              opacity: targetHandle === HandleVariant.Hidden ? 0 : 1,
              width: HANDLE_DIAMETER + HANDLE_BORDER_WIDTH,
              height: HANDLE_DIAMETER + HANDLE_BORDER_WIDTH,
              ...(positionTargetHandle && {
                left: -HANDLE_WITH_BORDER_DIAMETER / 2,
                top: isFunction(children)
                  ? (STEP_NODE_CARD_HEIGHT + HANDLE_WITH_BORDER_DIAMETER) / 2
                  : null
              }),
              background: (theme) => theme.palette.background.default,
              border: (theme) =>
                (isConnecting && targetHandle === HandleVariant.Shown) ||
                targetSelected
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
      {(sourceHandle === HandleVariant.Shown ||
        sourceHandle === HandleVariant.Disabled ||
        sourceHandle === HandleVariant.Hidden) && (
        <StyledHandle
          id={id}
          type="source"
          title={t('Drag to connect')}
          data-testid={`BaseNodeRightHandle-${sourceHandle}`}
          position={Position.Right}
          onConnect={onSourceConnect}
          isConnectable={sourceHandle === HandleVariant.Shown}
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
            opacity: sourceHandle === HandleVariant.Hidden ? 0 : 1,

            '&:after': {
              content: '""',
              position: 'absolute',
              top: -((ACTION_BUTTON_HEIGHT - HANDLE_DIAMETER) / 2),
              width:
                id === 'SocialPreview'
                  ? NODE_EXTRA_DETECTION_WIDTH * 2
                  : NODE_EXTRA_DETECTION_WIDTH,
              height: ACTION_BUTTON_HEIGHT,
              right: -NODE_EXTRA_DETECTION_WIDTH / 2,
              backgroundColor: 'transparent'
            }
          }}
        >
          {sourceHandle === HandleVariant.Shown && (
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

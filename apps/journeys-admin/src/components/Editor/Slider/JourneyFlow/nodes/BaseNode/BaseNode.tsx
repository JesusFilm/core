import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import isFunction from 'lodash/isFunction'
import { useTranslation } from 'next-i18next'
import { ComponentProps, ReactElement, ReactNode, useState } from 'react'
import {
  Handle,
  OnConnect,
  Position,
  useOnSelectionChange,
  useStore
} from 'reactflow'

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
  isTargetConnectable?: boolean
  isSourceConnectable?: boolean
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
  isTargetConnectable = false,
  isSourceConnectable = false,
  onSourceConnect,
  selected = false,
  isSourceConnected = false,
  sourceHandleProps,
  dragging,
  children
}: BaseNodeProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const connectionHandleId = useStore(connectionHandleIdSelector)
  const connectionNodeId = useStore(connectionNodeIdSelector)
  const isConnecting =
    (connectionHandleId != null || connectionNodeId != null) &&
    id !== connectionNodeId
  const [targetSelected, setTargetSelected] = useState(false)
  const [sourceSelected, setSourceSelected] = useState(false)

  useOnSelectionChange({
    onChange: (selected) => {
      const selectedEdge = selected.edges[0]
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
      {isTargetConnectable && (
        <PulseWrapper show={isConnecting}>
          <StyledHandle
            type="target"
            data-testid="BaseNodeLeftHandle"
            position={Position.Left}
            isConnectableStart={isConnecting}
            isConnectable={id !== connectionNodeId}
            sx={{
              width: HANDLE_DIAMETER + HANDLE_BORDER_WIDTH,
              height: HANDLE_DIAMETER + HANDLE_BORDER_WIDTH,
              left: -HANDLE_WITH_BORDER_DIAMETER / 2,
              top: (STEP_NODE_CARD_HEIGHT + HANDLE_WITH_BORDER_DIAMETER) / 2,
              background: (theme) => theme.palette.background.default,
              border: (theme) =>
                isConnecting || targetSelected
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
      {isSourceConnectable && (
        <StyledHandle
          id={id}
          type="source"
          title={t('Drag to connect')}
          data-testid="BaseNodeRightHandle"
          position={Position.Right}
          onConnect={onSourceConnect}
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
          <ArrowRightIcon
            data-testid="BaseNodeDownwardArrowIcon"
            className="arrow"
            sx={{
              position: 'absolute',
              borderRadius: '100%',
              fontSize: 'large',
              color: (theme) => theme.palette.background.paper,
              backgroundColor: (theme) => theme.palette.primary.main,
              top: -HANDLE_DIAMETER,
              right: -HANDLE_DIAMETER,
              pointerEvents: 'none'
            }}
          />
        </StyledHandle>
      )}
    </Box>
  )
}

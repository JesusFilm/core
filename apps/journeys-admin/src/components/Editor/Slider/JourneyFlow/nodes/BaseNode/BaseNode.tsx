import Box from '@mui/material/Box'
import { styled, useTheme } from '@mui/material/styles'
import isFunction from 'lodash/isFunction'
import { ComponentProps, ReactElement, ReactNode, useState } from 'react'
import {
  Handle,
  OnConnect,
  Position,
  useOnSelectionChange,
  useStore
} from 'reactflow'

import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'

import { PulseWrapper } from './PulseWrapper'

const StyledHandle = styled(Handle)(() => ({}))
const connectionHandleIdSelector = (state): string | null =>
  state.connectionHandleId

interface BaseNodeProps {
  id?: string
  isTargetConnectable?: boolean
  isSourceConnectable?: boolean
  onSourceConnect?: (
    params: { target: string } | Parameters<OnConnect>[0]
  ) => void
  selected?: 'descendant' | boolean
  sourceHandleProps?: Partial<ComponentProps<typeof StyledHandle>>
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
  sourceHandleProps,
  children
}: BaseNodeProps): ReactElement {
  const connectionHandleId = useStore(connectionHandleIdSelector)
  const isConnecting = connectionHandleId != null
  const [targetSelected, setTargetSelected] = useState(false)
  const [sourceSelected, setSourceSelected] = useState(false)
  const theme = useTheme()

  useOnSelectionChange({
    onChange: (selected) => {
      const selectedEdge = selected.edges[0]
      setTargetSelected(selectedEdge?.target === id)
      setSourceSelected(selectedEdge?.source === id)
    }
  })

  return (
    <Box
      data-testid="BaseNode"
      sx={{
        position: 'relative',
        cursor: 'pointer',
        '.arrow': {
          opacity: 0,
          right: -20,
          transition: 'right 0.5s, opacity 0.4s'
        },
        ':hover .arrow': {
          opacity: 1,
          right: -30
        }
      }}
    >
      {isFunction(children) ? children({ selected }) : children}
      {isTargetConnectable && (
        <PulseWrapper show={isConnecting}>
          <StyledHandle
            type="target"
            data-testid="BaseNodeTopHandle"
            position={Position.Left}
            isConnectableStart={false}
            sx={{
              ml: 0.5,
              width: 8.5,
              height: 8.5,
              left: -7.5,
              background: '#F1F2F5',
              border:
                isConnecting || targetSelected
                  ? '2px solid #c52d3aff'
                  : '2px solid #aaacbb',

              '&:after': {
                display: isConnecting ? 'block' : 'none',
                content: '""',
                position: 'absolute',
                width: 218, // STEP_NODE_WIDTH + 4
                height: 98, // // STEP_NODE_HEIGHT
                top: -48,
                left: -4,
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
          title="Drag to connect"
          data-testid="BaseNodeBottomHandle"
          position={Position.Right}
          onConnect={onSourceConnect}
          {...sourceHandleProps}
          sx={{
            width: 6,
            height: 6,
            background:
              connectionHandleId === id
                ? theme.palette.primary.main
                : 'rgba(0,0,0,.25)',
            // border: 'none',
            border: sourceSelected ? '2px solid #c52d3aff' : 'none',
            ...sourceHandleProps?.sx,

            '&:after': {
              content: '""',
              position: 'absolute',
              transform: 'translate(0, -50%)',
              top: '50%',
              width: 235,
              height: 28,
              right: -30,
              backgroundColor: 'transparent'
            }
          }}
        >
          <ArrowRightIcon
            data-testid="BaseNodeDownwardArrowIcon"
            className="arrow"
            sx={{
              position: 'absolute',
              borderRadius: '50%',
              color: 'white',
              fontSize: 'large',
              backgroundColor: '#c52d3aff', // theme.palette.primary.main,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          />
        </StyledHandle>
      )}
    </Box>
  )
}

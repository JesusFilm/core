import Box from '@mui/material/Box'
import { styled, useTheme } from '@mui/material/styles'
import isFunction from 'lodash/isFunction'
import { ComponentProps, ReactElement, ReactNode, useState } from 'react'
import { Handle, OnConnect, Position, useStore } from 'reactflow'

import ArrowRightIcon from '@core/shared/ui/icons/ArrowRight'

const StyledHandle = styled(Handle)(() => ({}))

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
  const state = useStore((state) => state)
  const isConnecting = !!state.connectionHandleId
  const theme = useTheme()
  const [hoverSelected, setHoverSelected] = useState(false)
  const isTouchDevice = matchMedia('(hover: none), (pointer: coarse)').matches
  const desktopStyle = {
    '.arrow': {
      opacity: 0,
      right: -20,
      transition: 'right 0.5s, opacity 0.4s'
    },
    ':hover .arrow': {
      opacity: 1,
      right: -30
    }
  }

  const touchStyle = {
    '.arrow': {
      visibility: selected === true ? 'visible' : 'hidden'
    }
  }

  const handleMouseEnter = (): void => {
    setHoverSelected(true)
  }
  const handleMouseLeave = (): void => {
    setHoverSelected(false)
  }

  return (
    <Box
      data-testid="BaseNode"
      sx={{
        position: 'relative',
        cursor: 'pointer',
        ...(isTouchDevice ? touchStyle : desktopStyle)
      }}
    >
      {isFunction(children) ? children({ selected }) : children}
      {isTargetConnectable && (
        <StyledHandle
          type="target"
          data-testid="BaseNodeTopHandle"
          position={Position.Left}
          sx={{
            ml: 0.5,
            width: 8.5,
            height: 8.5,
            left: -7.5,
            background: '#F1F2F5',
            border:
              selected !== false || isConnecting
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
      )}
      {isSourceConnectable && (
        <StyledHandle
          id={id}
          type="source"
          data-testid="BaseNodeBottomHandle"
          position={Position.Right}
          onConnect={onSourceConnect}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...sourceHandleProps}
          sx={{
            width: 6,
            height: 6,
            background:
              state.connectionHandleId === id
                ? theme.palette.primary.main
                : 'rgba(0,0,0,.25)',
            border: 'none',
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
              top: '50%',
              backgroundColor: '#c52d3aff', // theme.palette.primary.main,
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          />
        </StyledHandle>
      )}
    </Box>
  )
}

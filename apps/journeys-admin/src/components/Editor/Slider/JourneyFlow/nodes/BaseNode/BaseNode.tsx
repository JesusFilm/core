import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import isFunction from 'lodash/isFunction'
import { ComponentProps, ReactElement, ReactNode, useState } from 'react'
import { Handle, OnConnect, Position } from 'reactflow'

import Plus1Icon from '@core/shared/ui/icons/Plus1'

const StyledHandle = styled(Handle)(() => ({}))

interface BaseNodeProps {
  id?: string
  isTargetConnectable?: boolean
  isSourceConnectable?: 'arrow' | boolean
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
  const [hoverSelected, setHoverSelected] = useState(false)
  const isTouchDevice = matchMedia('(hover: none), (pointer: coarse)').matches
  const desktopStyle = {
    '.arrow': {
      visibility: 'hidden'
    },
    ':hover .arrow': {
      visibility: 'visible'
    }
  }

  const touchStyle = {
    '.arrow': {
      visibility:
        typeof selected === 'boolean' && selected ? 'visible' : 'hidden'
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
            width: 8.5,
            height: 8.5,
            left: -12,
            background: '#F1F2F5',
            border:
              selected !== false ? '2px solid #c52d3aff' : '2px solid #aaacbb'
            // outline: '1px solid white',
            // outlineColor: 'white'
          }}
        />
      )}
      {isSourceConnectable === 'arrow' && (
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
            // right: -10,
            background: 'rgba(0,0,0,.25)',
            // border: '2px solid rgba(0,0,0,.25)',
            // opacity: selected !== false ? 1 : 0,
            border: 'none',
            // border: selected !== false ? '3px solid #000' : '3px solid #000',
            // outline: '1px solid',
            // outlineColor: 'white',
            ...sourceHandleProps?.sx,

            '&:after': {
              content: '""',
              position: 'absolute',
              transform: 'translate(-50%, -50%)',
              top: '50%',
              left: '50%',
              width: 18,
              height: 18,
              backgroundColor: 'transparent',
              borderRadius: '50%',
              cursor: 'copy'
            }
          }}
        >
          <Plus1Icon
            data-testid="BaseNodeDownwardArrowIcon"
            className="arrow"
            sx={{
              display: 'flex',
              position: 'absolute',
              borderRadius: '50%',
              color: hoverSelected ? 'white' : 'black',
              fontSize: 'large',
              top: '50%',
              backgroundColor: hoverSelected ? '#c52d3aff' : 'white',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          />
        </StyledHandle>
      )}
    </Box>
  )
}

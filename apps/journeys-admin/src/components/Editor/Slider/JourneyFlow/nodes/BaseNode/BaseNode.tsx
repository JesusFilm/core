import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import isFunction from 'lodash/isFunction'
import { ComponentProps, ReactElement, ReactNode } from 'react'
import { Handle, OnConnect, Position } from 'reactflow'

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

  return (
    <Box
      data-testid="BaseNode"
      sx={{
        position: 'relative',
        ...(isTouchDevice ? touchStyle : desktopStyle)
      }}
    >
      {isFunction(children) ? children({ selected }) : children}
      {isTargetConnectable && (
        <StyledHandle
          type="target"
          data-testid="BaseNodeTopHandle"
          position={Position.Top}
          sx={{
            width: 7.5,
            height: 7.5,
            background: 'white',
            border:
              selected !== false ? '2px solid #c52d3aff' : '2px solid #aaacbb',
            outline: '1px solid white',
            outlineColor: 'white',
            cursor: 'pointer'
          }}
        />
      )}
      {isSourceConnectable !== false && (
        <>
          <StyledHandle
            id={id}
            type="source"
            data-testid="BaseNodeBottomHandle"
            position={Position.Bottom}
            onConnect={onSourceConnect}
            {...sourceHandleProps}
            sx={{
              width: 7.5,
              height: 7.5,
              background: 'white',
              border:
                selected !== false
                  ? '2px solid #c52d3aff'
                  : '2px solid #aaacbb',
              outline: '1px solid',
              outlineColor: 'white',
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
                borderRadius: '50%'
              }
            }}
          >
            {isSourceConnectable === 'arrow' && (
              <ArrowDownwardRoundedIcon
                data-testid="BaseNodeDownwardArrowIcon"
                className="arrow"
                style={{
                  display: 'flex',
                  position: 'absolute',
                  borderRadius: '50%',
                  color: 'white',
                  fontSize: 'large',
                  top: '50%',
                  backgroundColor: '#c52d3aff',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none'
                }}
              />
            )}{' '}
          </StyledHandle>
        </>
      )}
    </Box>
  )
}

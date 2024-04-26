import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import Box from '@mui/material/Box'
import { Theme, styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
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
  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const desktopStyle = {
    position: 'relative',
    '.show-on-hover': {
      visibility: 'hidden'
    },
    ':hover .show-on-hover': {
      visibility: 'visible'
    }
  }

  const mobileStyle = {
    position: 'relative',
    '.show-on-hover': {
      visibility:
        typeof selected === 'boolean' && selected ? 'visible' : 'hidden'
    }
  }
  return (
    <Box data-testid="BaseNode" sx={isDesktop ? desktopStyle : mobileStyle}>
      {isFunction(children) ? children({ selected }) : children}
      {isTargetConnectable && (
        <StyledHandle
          type="target"
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
              ...sourceHandleProps?.sx
            }}
          />
          {isSourceConnectable === 'arrow' && (
            <ArrowDownwardRoundedIcon
              data-testid="BaseNodeDownwardArrowIcon"
              className="show-on-hover"
              style={{
                display: 'flex',
                position: 'absolute',
                borderRadius: '50%',
                color: 'white',
                fontSize: 'large',
                top: 72,
                backgroundColor: '#c52d3aff',
                left: '50%',
                transform: 'translate(-50%, 0)'
              }}
            />
          )}
        </>
      )}
    </Box>
  )
}

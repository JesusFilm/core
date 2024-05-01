import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import Box from '@mui/material/Box'
import { Theme, styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import isFunction from 'lodash/isFunction'
import { ComponentProps, ReactElement, ReactNode, useState } from 'react'
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
  const [showArrow, setShowArrow] = useState(false)

  const isDesktop = useMediaQuery((theme: Theme) => theme.breakpoints.up('sm'))
  const desktopStyle = {
    '.arrow': {
      visibility: 'hidden'
    },
    ':hover .arrow': {
      visibility: 'visible'
    }
  }

  const mobileStyle = {
    '.arrow': {
      visibility:
        typeof selected === 'boolean' && selected ? 'visible' : 'hidden'
    }
  }

  const handleHoverStart = (): void => {
    setShowArrow(true)
  }

  const handleHoverEnd = (): void => {
    setShowArrow(false)
  }
  // console.log(sourceHandleProps?.sx)

  return (
    <Box
      data-testid="BaseNode"
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
      sx={{
        position: 'relative'
        // ...(isDesktop ? desktopStyle : mobileStyle)
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
            // onMouseEnter={handleHoverStart}
            // onMouseLeave={handleHoverEnd}
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
            {isSourceConnectable === 'arrow' && showArrow && (
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

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'
import { Handle, OnConnect, Position } from 'reactflow'

export const NODE_WIDTH = 150
export const NODE_HEIGHT = 80

interface BaseNodeProps {
  isTargetConnectable?: boolean
  isSourceConnectable?: boolean
  onSourceConnect?: OnConnect
  onClick?: () => void
  icon: ReactNode
  title: string
  selected?: 'descendant' | boolean
}

export function BaseNode({
  isTargetConnectable,
  isSourceConnectable,
  onSourceConnect,
  onClick,
  icon,
  title,
  selected = false
}: BaseNodeProps): ReactElement {
  return (
    <Card
      sx={{
        borderRadius: 1,
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
          alignItems: 'center',
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          gap: 2
        }}
        onClick={onClick}
      >
        {icon}
        <Typography
          sx={{
            display: '-webkit-box',
            '-webkit-box-orient': 'vertical',
            '-webkit-line-clamp': '2',
            overflow: 'hidden'
          }}
        >
          {title}
        </Typography>
      </CardContent>
      {isTargetConnectable !== false && (
        <Handle type="target" position={Position.Left} />
      )}
      {isSourceConnectable !== false && (
        <Handle
          type="source"
          position={Position.Right}
          onConnect={onSourceConnect}
        />
      )}
    </Card>
  )
}

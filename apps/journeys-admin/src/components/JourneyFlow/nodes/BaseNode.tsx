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
  icon: ReactNode
  title: string
}

export function BaseNode({
  isTargetConnectable,
  isSourceConnectable,
  onSourceConnect,
  icon,
  title
}: BaseNodeProps): ReactElement {
  return (
    <Card>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
          gap: 2
        }}
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

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'
import { Handle, Position } from 'reactflow'

interface BaseNodeProps {
  isTargetConnectable?: boolean
  isSourceConnectable?: boolean
  icon: ReactNode
  title: string
}

export function BaseNode({
  isTargetConnectable,
  isSourceConnectable,
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
          width: 150,
          height: 80,
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
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isTargetConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isSourceConnectable}
      />
    </Card>
  )
}

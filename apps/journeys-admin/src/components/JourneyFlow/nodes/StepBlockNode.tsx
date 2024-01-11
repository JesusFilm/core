import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { Handle, NodeProps, Position } from 'reactflow'

export interface StepBlockNodeData {
  title?: string
  bgColor?: string | null
  bgImage?: string
}

export function StepBlockNode({
  data
}: NodeProps<StepBlockNodeData>): ReactElement {
  return (
    <Card
      sx={{
        width: 130
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
        <Box
          sx={{
            flexShrink: 0,
            width: 20,
            borderRadius: 1,
            bgcolor: data?.bgColor,
            backgroundImage:
              data?.bgImage != null ? `url(${data?.bgImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center center'
          }}
        />
        <Typography
          sx={{
            flexGrow: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {data.title}
        </Typography>
      </CardContent>
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Card>
  )
}

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement } from 'react'
import { Handle, NodeProps, Position } from 'reactflow'

export interface RadioOptionBlockNodeData {
  title?: string
}

export function RadioOptionBlockNode({
  data
}: NodeProps<RadioOptionBlockNodeData>): ReactElement {
  return (
    <Box
      sx={{
        borderRadius: 2,
        minHeight: '30px',
        overflow: 'hidden',
        display: 'flex',
        padding: '2px 6px',
        position: 'relative',
        flexGrow: 1,
        border: 'solid 2px #b1b1b7',
        background: '#e6e6e6'
      }}
    >
      <Typography>{data.title}</Typography>
      <Handle type="target" position={Position.Left} isConnectable={false} />
      <Handle type="source" position={Position.Right} />
    </Box>
  )
}

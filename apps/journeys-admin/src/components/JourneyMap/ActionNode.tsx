import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'
import { Handle, NodeProps, Position } from 'reactflow'

export interface ActionNodeType {
  type: 'action'
  title?: string
  icon?: ReactNode
  subline?: string
  bgColor?: string | null
}

export function ActionNode({ data }: NodeProps<ActionNodeType>): ReactElement {
  return (
    <Box>
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
        <div className="inner">
          <div className="body">
            {data.icon != null && <div className="icon">{data.icon}</div>}
            <div>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '13px',
                  lineHeight: 1.25,
                  mb: '2px'
                }}
              >
                {data.title}
              </Typography>
            </div>
          </div>
          <Handle
            type="target"
            position={Position.Left}
            isConnectable={false}
            style={{ opacity: 0 }}
          />
          <Handle type="source" position={Position.Right} />
        </div>
      </Box>
    </Box>
  )
}

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactElement, ReactNode } from 'react'
import { Handle, NodeProps, Position } from 'reactflow'

export interface CustomNodeType {
  type: 'custom'
  title?: string
  icon?: ReactNode
  subline?: string
  bgColor?: string | null
  bgImage?: string
}

export function CustomNode({ data }: NodeProps<CustomNodeType>): ReactElement {
  const randomPercentage = Math.floor(Math.random() * 101)

  return (
    <Box>
      <Box
        sx={{
          boxShadow: 1,
          borderRadius: 2,
          minWidth: '130px',
          minHeight: '50px',
          display: 'flex',
          padding: '2px 6px 2px 40px',
          position: 'relative',
          flexGrow: 1,
          border: 'solid 1px white',
          background: '#f6f5f5'
        }}
      >
        <div className="inner">
          <div className="body">
            {data?.bgColor !== null && (
              <Box
                sx={{
                  position: 'absolute',
                  width: '26px',
                  height: '40px',
                  left: '4px',
                  top: '4px',
                  borderRadius: 1,
                  zIndex: 99,
                  bgcolor: data?.bgColor,
                  backgroundImage:
                    data?.bgImage != null ? `url(${data?.bgImage})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center'
                }}
              />
            )}
            {data.icon != null && <div className="icon">{data.icon}</div>}
            <div>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '13px'
                }}
              >
                {data.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: '12px'
                }}
              >
                Visitors: {randomPercentage}%
              </Typography>
            </div>
          </div>
          <Handle type="target" position={Position.Left} />
          <Handle type="source" position={Position.Right} />
        </div>
      </Box>
    </Box>
  )
}

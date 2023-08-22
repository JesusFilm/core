import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { Box, Typography } from '@mui/material'
import React, { ReactNode, memo } from 'react'
import { Handle, NodeProps, Position } from 'reactflow'

export interface ActionNode {
  title: string
  icon?: ReactNode
  subline?: string
  bgColor?: string
}

export default memo(({ data }: NodeProps<ActionNode>) => {
  return (
    <Box
      sx={
        {
          // overflow: 'hidden',
          // display: 'flex',
          // padding: '2px',
          // position: 'relative',
          // borderRadius: '3px',
          // flexGrow: 1,
          // border:'solid 1px grey'
        }
      }
    >
      {/* <Box
        sx={{
          position: 'absolute',
          left: '4px',
          top: '6px',
          background: '#fff',
          borderRadius: '99px',
          zIndex: 99
        }}
      >
        <div>
          <ChevronRightRoundedIcon />
        </div>
      </Box> */}
      <Box
      
        sx={{
          // boxShadow: 1,
          borderRadius: 2,
          // minWidth: '40px',
          minHeight: '30px',
          overflow: 'hidden',
          display: 'flex',
          padding: '2px 6px',
          position: 'relative',
          flexGrow: 1,
          border: 'solid 2px #b1b1b7',
          // background: '#f4f3f3',
          background: '#e6e6e6',
        }}
      >
        <div className="inner">
          <div className="body">
            {data.icon && <div className="icon">{data.icon}</div>}
            <div>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '13px',
                  lineHeight: 1.25,
                  mb:'2px'
                }}
              >
                {data.title}
              </Typography>
              {/* {data.subline && (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '11px',
                    lineHeight: 1.25,
                  }}
                >
                  {data.subline}
                </Typography>
              )} */}
            </div>
          </div>
          <Handle type="target" position={Position.Left} isConnectable={false} style={{opacity:0}} />
          <Handle type="source" position={Position.Right} />
        </div>
      </Box>
    </Box>
  )
})

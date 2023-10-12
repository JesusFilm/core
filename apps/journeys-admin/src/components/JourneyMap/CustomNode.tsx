import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded'
import { Box, Typography } from '@mui/material'
import React, { ReactNode, memo } from 'react'
import { Handle, NodeProps, Position } from 'reactflow'

export interface CustomNode {
  title: string
  icon?: ReactNode
  subline?: string
  bgColor?: string
}

export default memo(({ data }: NodeProps<CustomNode>) => {
  const randomPercentage = Math.floor(Math.random() * 101) + '%'

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
          boxShadow: 1,
          borderRadius: 2,
          minWidth: '130px',
          minHeight: '50px',
          // overflow: 'hidden',
          display: 'flex',
          padding: '2px 6px 2px 40px',
          position: 'relative',
          flexGrow: 1,
          border: 'solid 1px white',
          // background: '#f4f3f3',
          background: '#f6f5f5'
        }}
      >
        <div className="inner">
          <div className="body">
            {data?.bgColor !== null && (
              <Box
                sx={{
                  // overflow: 'hidden',
                  // display: 'flex',
                  // padding: '2px 6px 2px 32px',
                  // borderRadius: '3px',
                  // flexGrow: 1,
                  // border: 'solid 1px white',
                  position: 'absolute',
                  width: '26px',
                  height: '40px',
                  // boxShadow: '1px 1px 0 1px rgey'
                  position: 'absolute',
                  left: '4px',
                  top: '4px',
                  borderRadius: 1,
                  zIndex: 99,
                  bgcolor: data?.bgColor,
                  backgroundImage: 'url(' + data?.bgImage + ')',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center center'
                }}
              />
            )}
            {data.icon && <div className="icon">{data.icon}</div>}
            <div>
              <Typography
                variant="body1"
                sx={{
                  fontSize: '13px'
                }}
              >
                {data.title}
              </Typography>
              {data.subline && (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '12px'
                  }}
                >
                  {data.subline}
                </Typography>
              )}
              <Typography
                variant="body2"
                sx={{
                  fontSize: '12px'
                }}
              >
                Clicked:{randomPercentage}
              </Typography>
            </div>
          </div>
          <Handle type="target" position={Position.Left} />
          <Handle type="source" position={Position.Right} />
        </div>
      </Box>
    </Box>
  )
})

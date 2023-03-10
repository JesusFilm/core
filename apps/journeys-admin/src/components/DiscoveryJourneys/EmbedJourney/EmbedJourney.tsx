import Box from '@mui/material/Box'
import { ReactElement } from 'react'

interface Props {
  slug: string
}

export function EmbedJourney({ slug }: Props): ReactElement {
  return (
    <Box
      aria-label={`${slug}-embedded`}
      sx={{
        position: 'relative',
        width: '33%',
        height: 0
      }}
    >
      <Box
        sx={{
          transform: {
            xs: 'scale(0.4)',
            sm: 'scale(0.6)',
            md: 'scale(0.8)'
          },
          transformOrigin: 'top left'
        }}
      >
        <Box
          sx={{
            width: {
              xs: '252%',
              sm: '168%',
              md: '125%'
            }
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              overflow: 'hidden',
              paddingTop: '150%',
              paddingLeft: '94%'
            }}
          >
            <iframe
              id="jfm-iframe"
              src={`https://your.nextstep.is/embed/${slug}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allow="fullscreen"
            />
          </div>
        </Box>
      </Box>
    </Box>
  )
}

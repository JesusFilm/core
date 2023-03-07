import Box from '@mui/material/Box'
import { ReactElement } from 'react'

interface Props {
  slug: string
}

export function EmbedJourney({ slug }: Props): ReactElement {
  return (
    <Box sx={{ position: 'relative', width: 95, height: 140 }}>
      <Box
        sx={{
          height: '100%',
          width: '380px',
          transform: 'scale(0.25)',
          transformOrigin: 'top left'
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            paddingTop: '150%'
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
  )
}

import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'

interface Props {
  slug: string
}

export function EmbedJourney({ slug }: Props): ReactElement {
  const StyledIframe = styled('iframe')(({ theme }) => ({}))
  return (
    <Box
      aria-label={`${slug}-embedded`}
      sx={{
        transform: {
          xs: 'scale(0.4)',
          sm: 'scale(0.6)',
          md: 'scale(0.8)'
        },
        transformOrigin: 'top left',
        position: 'relative',
        width: '33%',
        height: 0
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
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            pt: '150%',
            pl: '94%'
          }}
        >
          <StyledIframe
            id="jfm-iframe"
            src={`https://your.nextstep.is/embed/${slug}`}
            sx={{
              position: 'absolute',
              top: 0,
              left: {
                xs: 0,
                sm:
                  slug === 'admin-left' ? -32 : slug === 'admin-right' ? 32 : 0
              },
              bottom: 0,
              right: 0,
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            allow="fullscreen"
          />
        </Box>
      </Box>
    </Box>
  )
}

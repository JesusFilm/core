import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'

interface Props {
  slug: 'admin-left' | 'admin-right' | 'admin-center'
}

export function EmbedJourney({ slug }: Props): ReactElement {
  const width = {
    xs: '270%',
    sm: '180%',
    md: '133%'
  }

  const scale = {
    xs: 'scale(0.4)',
    sm: 'scale(0.6)',
    md: 'scale(0.8)'
  }

  const top = {
    xs: -8,
    sm: 0
  }

  // marginLeft and left is set to values for "admin-left" by default
  let marginLeft = '0px'
  let left = {
    xs: -8,
    sm: -32
  }

  switch (slug) {
    case 'admin-right':
      left = {
        xs: 8,
        sm: 32
      }
      marginLeft = `-28px`
      break
    case 'admin-center':
      left = {
        xs: 0,
        sm: 0
      }
      marginLeft = `-12px`
      break
  }

  const StyledIframe = styled('iframe')(({ theme }) => ({}))
  return (
    <Box
      aria-label={`${slug}-embedded`}
      sx={{
        transform: scale,
        transformOrigin: 'top left',
        position: 'relative',
        width: '33%',
        height: 0
      }}
    >
      <Box
        sx={{
          width
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            overflow: 'hidden',
            ml: marginLeft,
            pt: '150%',
            pl: '94%'
          }}
        >
          <StyledIframe
            id="jfm-iframe"
            src={`https://your.nextstep.is/embed/${slug}`}
            sx={{
              position: 'absolute',
              top,
              left,
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

import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import { ReactElement } from 'react'

interface Props {
  slug: 'admin-left' | 'admin-right' | 'admin-center'
}

const Iframe = styled('iframe')`
  height: 100%;
  width: 100%;
  border: 0;
`

export function EmbedJourney({ slug }: Props): ReactElement {
  const dimensions = {
    xs: 'calc(250% + 64px)',
    sm: 'calc(166% + 64px)',
    md: 'calc(125% + 64px)'
  }

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
        width: dimensions,
        height: dimensions
      }}
    >
      <Iframe
        id="jfm-iframe"
        src={`https://your.nextstep.is/embed/${slug}`}
        sx={{ margin: '-32px' }}
        allow="fullscreen"
      />
    </Box>
  )
}

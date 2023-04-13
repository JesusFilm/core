import { styled } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

interface Props {
  slug: 'admin-left' | 'admin-right' | 'admin-center'
}

const StyledIframe = styled('iframe')(() => ({}))

export function EmbedJourney({ slug }: Props): ReactElement {
  return (
    <Stack
      sx={{
        width: '100%',
        height: { xs: '300px', md: '360px' },
        marginBottom: { xs: '-120px', sm: '-100px', md: '-90px' }
      }}
    >
      <StyledIframe
        id="jfm-iframe"
        src={`https://your.nextstep.is/embed/${slug}/?padding=false`}
        sx={{
          display: 'flex',
          transform: { xs: 'scale(0.55)', sm: 'scale(0.6)', md: 'scale(0.7)' },
          transformOrigin: {
            xs:
              slug === 'admin-center'
                ? '5% 0%'
                : slug === 'admin-left'
                ? '15% 0%'
                : '-5% 0%',
            sm:
              slug === 'admin-center'
                ? '4% 0%'
                : slug === 'admin-left'
                ? 'top left'
                : '8% 0%',
            md:
              slug === 'admin-center'
                ? '3% 0%'
                : slug === 'admin-left'
                ? 'top left'
                : '6% 0%'
          },
          width: { xs: '160%', md: '140%' },
          height: '100%',
          border: 'none'
        }}
        allow="fullscreen"
      />
    </Stack>
  )
}

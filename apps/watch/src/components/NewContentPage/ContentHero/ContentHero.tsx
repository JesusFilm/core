import Box from '@mui/material/Box'
import { ReactElement } from 'react'

import { ContentHeader } from './ContentHeader'
import { ContentHeroVideo } from './ContentHeroVideo'

export function ContentHero(): ReactElement {
  return (
    <Box
      sx={{
        height: { xs: '90svh', md: '80svh' },
        width: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        position: 'relative',
        transition: 'height 0.3s ease-out',
        bgcolor: 'background.default',
        zIndex: 1
      }}
      data-testid="ContentHero"
    >
      <ContentHeader />
      <ContentHeroVideo />
      <Box
        data-testid="ContainerHeroTitleContainer"
        sx={{
          width: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          maxWidth: '1920px',
          mx: 'auto',
          pb: 4
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            width: '100%',
            pointerEvents: 'none',
            display: { xs: 'block', md: 'none' },
            backdropFilter: 'brightness(.6) blur(40px)',
            maskImage:
              'linear-gradient(0deg, rgba(2,0,36,1) 46%, rgba(2,0,36,1) 53%, rgba(0,0,0,0) 100%)'
          }}
        />
      </Box>
    </Box>
  )
}

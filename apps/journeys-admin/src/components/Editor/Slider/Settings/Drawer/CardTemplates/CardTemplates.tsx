import Box from '@mui/material/Box'
import type { ReactElement } from 'react'

import { CardCta } from './Templates/CardCta'
import { CardForm } from './Templates/CardForm'
import { CardIntro } from './Templates/CardIntro'
import { CardPoll } from './Templates/CardPoll'
import { CardQuote } from './Templates/CardQuote'
import { CardVideo } from './Templates/CardVideo'

export function CardTemplates(): ReactElement {
  return (
    <Box
      data-testid="CardTemplates"
      sx={{
        p: 5,
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(auto-fill, 128px)',
          sm: 'repeat(3, minmax(128px, 160px))',
          md: 'repeat(2, 128px)'
        },
        justifyContent: 'center',
        gap: 5,
        width: '100%'
      }}
    >
      <CardVideo />
      <CardIntro />
      <CardPoll />
      <CardForm />
      <CardQuote />
      <CardCta />
    </Box>
  )
}

import Box from '@mui/material/Box'
import type { ReactElement } from 'react'

import { CardCta } from './Layouts/CardCta'
import { CardForm } from './Layouts/CardForm'
import { CardIntro } from './Layouts/CardIntro'
import { CardPoll } from './Layouts/CardPoll'
import { CardQuote } from './Layouts/CardQuote'
import { CardVideo } from './Layouts/CardVideo'

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

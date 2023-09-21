import Grid from '@mui/material/Grid'
import { ReactElement } from 'react'

import { CardCta } from './Templates/CardCta'
import { CardForm } from './Templates/CardForm'
import { CardIntro } from './Templates/CardIntro'
import { CardPoll } from './Templates/CardPoll'
import { CardQuote } from './Templates/CardQuote'
import { CardVideo } from './Templates/CardVideo'

export function CardLibrary(): ReactElement {
  return (
    <Grid container spacing={5} sx={{ p: 5 }}>
      <Grid item xs={6}>
        <CardVideo />
      </Grid>
      <Grid item xs={6}>
        <CardIntro />
      </Grid>
      <Grid item xs={6}>
        <CardPoll />
      </Grid>
      <Grid item xs={6}>
        <CardForm />
      </Grid>
      <Grid item xs={6}>
        <CardQuote />
      </Grid>
      <Grid item xs={6}>
        <CardCta />
      </Grid>
    </Grid>
  )
}

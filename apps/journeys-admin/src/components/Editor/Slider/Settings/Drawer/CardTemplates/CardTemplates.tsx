import Grid from '@mui/material/Grid'
import Skeleton from '@mui/material/Skeleton'
import { type ReactElement, useState } from 'react'

import { Button } from '@mui/material'
import { CardCta } from './Templates/CardCta'
import { CardForm } from './Templates/CardForm'
import { CardIntro } from './Templates/CardIntro'
import { CardPoll } from './Templates/CardPoll'
import { CardQuote } from './Templates/CardQuote'
import { CardVideo } from './Templates/CardVideo'

export function CardTemplates(): ReactElement {
  const [loading, setLoading] = useState(false)

  return (
    <Grid data-testid="CardTemplates" container spacing={5} sx={{ p: 5 }}>
      {loading ? (
        <>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={6} key={index}>
              <Skeleton
                variant="rectangular"
                data-testid="card-template-skeleton"
                width={126}
                height={195}
                sx={{ borderRadius: 4, margin: 'auto' }}
              />
            </Grid>
          ))}
        </>
      ) : (
        <>
          <Grid item xs={6}>
            <CardVideo setCardTemplatesLoading={setLoading} />
          </Grid>
          <Grid item xs={6}>
            <CardIntro setCardTemplatesLoading={setLoading} />
          </Grid>
          <Grid item xs={6}>
            <CardPoll setCardTemplatesLoading={setLoading} />
          </Grid>
          <Grid item xs={6}>
            <CardForm setCardTemplatesLoading={setLoading} />
          </Grid>
          <Grid item xs={6}>
            <CardQuote setCardTemplatesLoading={setLoading} />
          </Grid>
          <Grid item xs={6}>
            <CardCta setCardTemplatesLoading={setLoading} />
          </Grid>
        </>
      )}
    </Grid>
  )
}

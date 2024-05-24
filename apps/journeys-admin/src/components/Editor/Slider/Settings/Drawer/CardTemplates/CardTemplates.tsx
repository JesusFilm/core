import Grid from '@mui/material/Grid'
import { ReactElement, useState } from 'react'

import { CardCta } from './Templates/CardCta'
import { CardForm } from './Templates/CardForm'
import { CardIntro } from './Templates/CardIntro'
import { CardPoll } from './Templates/CardPoll'
import { CardQuote } from './Templates/CardQuote'
import { CardVideo } from './Templates/CardVideo'
import Skeleton from '@mui/material/Skeleton'
import { Button } from '@mui/material'

export function CardTemplates(): ReactElement {
  const [cardTemplatesLoading, setCardTemplatesLoading] = useState(false)

  return (
    <Grid data-testid="CardTemplates" container spacing={5} sx={{ p: 5 }}>
      {cardTemplatesLoading === true ? (
        <>
          {Array.from({ length: 6 }).map(() => (
            <Grid item xs={6}>
              <Skeleton
                variant="rectangular"
                width={126}
                height={195}
                sx={{ borderRadius: 4, marginLeft: 1 }}
              />
            </Grid>
          ))}
        </>
      ) : (
        <>
          <Grid item xs={6}>
            <CardVideo
              setCardTemplatesLoading={setCardTemplatesLoading}
              cardTemplatesLoading={cardTemplatesLoading}
            />
          </Grid>
          <Grid item xs={6}>
            <CardIntro
              setCardTemplatesLoading={setCardTemplatesLoading}
              cardTemplatesLoading={cardTemplatesLoading}
            />
          </Grid>
          <Grid item xs={6}>
            <CardPoll
              setCardTemplatesLoading={setCardTemplatesLoading}
              cardTemplatesLoading={cardTemplatesLoading}
            />
          </Grid>
          <Grid item xs={6}>
            <CardForm
              setCardTemplatesLoading={setCardTemplatesLoading}
              cardTemplatesLoading={cardTemplatesLoading}
            />
          </Grid>
          <Grid item xs={6}>
            <CardQuote
              setCardTemplatesLoading={setCardTemplatesLoading}
              cardTemplatesLoading={cardTemplatesLoading}
            />
          </Grid>
          <Grid item xs={6}>
            <CardCta
              setCardTemplatesLoading={setCardTemplatesLoading}
              cardTemplatesLoading={cardTemplatesLoading}
            />
          </Grid>
        </>
      )}
    </Grid>
  )
}

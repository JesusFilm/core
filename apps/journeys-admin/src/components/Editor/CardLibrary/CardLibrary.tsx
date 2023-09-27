import Grid from '@mui/material/Grid'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { Properties } from '../../JourneyView/Properties'

import { CardCta } from './Templates/CardCta'
import { CardForm } from './Templates/CardForm'
import { CardIntro } from './Templates/CardIntro'
import { CardPoll } from './Templates/CardPoll'
import { CardQuote } from './Templates/CardQuote'
import { CardVideo } from './Templates/CardVideo'

export function CardLibrary(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { dispatch } = useEditor()
  const { journey } = useJourney()
  function handleClick(): void {
    dispatch({
      type: 'SetDrawerPropsAction',
      mobileOpen: false,
      title: t('Properties'),
      children: (
        <Properties
          journeyType={journey?.template === true ? 'Template' : 'Journey'}
          isPublisher={false}
        />
      )
    })
  }
  return (
    <Grid container spacing={5} sx={{ p: 5 }}>
      <Grid item xs={6}>
        <CardVideo onClick={handleClick} />
      </Grid>
      <Grid item xs={6}>
        <CardIntro onClick={handleClick} />
      </Grid>
      <Grid item xs={6}>
        <CardPoll onClick={handleClick} />
      </Grid>
      <Grid item xs={6}>
        <CardForm onClick={handleClick} />
      </Grid>
      <Grid item xs={6}>
        <CardQuote onClick={handleClick} />
      </Grid>
      <Grid item xs={6}>
        <CardCta onClick={handleClick} />
      </Grid>
    </Grid>
  )
}

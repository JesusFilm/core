import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { AnalyticsItem } from './AnalyticsItem'
import { ResponsesItem } from './ResponsesItem'
import { ShareItem } from './ShareItem'
import { StrategyItem } from './StrategyItem'

export function Items(): ReactElement {
  const { journey } = useJourney()
  const isTemplate = journey?.template === true

  return (
    <Stack
      data-testid="ItemsStack"
      sx={{
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
        display: { xs: 'none', md: 'flex' }
      }}
    >
      <Stack
        sx={{
          flexDirection: 'row',
          gap: 2
        }}
      >
        {!isTemplate && (
          <ResponsesItem variant="icon-button" journeyId={journey?.id} />
        )}
        <AnalyticsItem variant="icon-button" journeyId={journey?.id} />
      </Stack>
      <StrategyItem variant="button" />
      <ShareItem variant="button" journey={journey} />
    </Stack>
  )
}

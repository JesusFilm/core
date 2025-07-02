import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { AnalyticsItem } from './AnalyticsItem'
import { ResponsesItem } from './ResponsesItem'
import { ShareItem } from './ShareItem'
import { StrategyItem } from './StrategyItem'

export function Items(): ReactElement {
  const { journey } = useJourney()
  return (
    <Stack
      sx={{ display: { xs: 'none', md: 'flex' } }}
      flexDirection="row"
      gap={5}
      data-testid="ItemsStack"
      alignItems="center"
    >
      <Stack flexDirection="row" gap={2}>
        <ResponsesItem variant="icon-button" />
        <AnalyticsItem variant="icon-button" />
      </Stack>
      <StrategyItem variant="button" />
      <ShareItem variant="button" journey={journey} />
    </Stack>
  )
}

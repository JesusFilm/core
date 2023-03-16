import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ActionFields_LinkAction as LinkAction } from '../../../../__generated__/ActionFields'
import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { ActionsList } from './ActionsList'
import { ActionsBanner } from './ActionsBanner'

export interface Actions {
  url: string
  count: number
}

export function ActionsTable(): ReactElement {
  const { journey } = useJourney()

  function countUrls(journey: Journey | undefined): Actions[] {
    const actions = (journey?.blocks ?? [])
      .filter(
        (block) =>
          ((block as ButtonBlock).action as LinkAction)?.__typename ===
          'LinkAction'
      )
      .map((block) => (block as ButtonBlock).action as LinkAction)
      .reduce((counts, { url }) => {
        counts[url] = ((counts[url] ?? 0) as number) + 1
        return counts
      }, {})

    return Object.entries(actions).map(([url, count]) => ({
      url,
      count
    })) as Actions[]
  }

  const actions = countUrls(journey)

  return (
    <Stack gap={2} justifyContent="center" sx={{ mx: 6 }}>
      <ActionsBanner hasActions={actions.length > 0} />
      {actions != null && actions.length > 0 && (
        <ActionsList actions={actions} />
      )}
    </Stack>
  )
}

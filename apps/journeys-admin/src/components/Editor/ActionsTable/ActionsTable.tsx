import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'

import {
  GoalType,
  getLinkActionGoal
} from '@core/journeys/ui/Button/utils/getLinkActionGoal'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { ActionFields_LinkAction as LinkAction } from '../../../../__generated__/ActionFields'
import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'

import { ActionsBanner } from './ActionsBanner'
import { ActionsList } from './ActionsList'

interface ActionsTableProps {
  hasAction?: (actions: boolean) => void
}

export interface Actions {
  url: string
  count: number
}

export function ActionsTable({ hasAction }: ActionsTableProps): ReactElement {
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

  actions.length >= 1 ? hasAction?.(true) : hasAction?.(false)

  const goalLabel = (url: string): string => {
    if (url === '') return ''
    const urlObject = new URL(url)
    const hostname = urlObject.hostname.replace('www.', '') // Remove 'www.' and top-level domain suffixes
    const hostActionType = getLinkActionGoal(hostname)
    switch (hostActionType) {
      case GoalType.Chat:
        return 'Start a Conversation'
      case GoalType.Bible:
        return 'Link to Bible'
      default:
        return 'Visit a Website'
    }
  }

  return (
    <Stack gap={2} justifyContent="center" py={6}>
      {journey != null &&
        (actions != null && actions.length > 0 ? (
          <ActionsList actions={actions} goalLabel={goalLabel} />
        ) : (
          <ActionsBanner />
        ))}
    </Stack>
  )
}

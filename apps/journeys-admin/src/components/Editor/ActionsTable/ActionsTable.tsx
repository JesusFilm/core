import Stack from '@mui/material/Stack'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import {
  GoalType,
  getLinkActionGoal
} from '@core/journeys/ui/Button/utils/getLinkActionGoal'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ActiveSlide } from '@core/journeys/ui/EditorProvider/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'

import { ActionFields_LinkAction as LinkAction } from '../../../../__generated__/ActionFields'
import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'

import { ActionsBanner } from './ActionsBanner'
import { ActionsList } from './ActionsList'

export interface Actions {
  url: string
  count: number
}

export function ActionsTable(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { dispatch } = useEditor()

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

  const goalLabel = (url: string): string => {
    if (url === '') return ''
    const goalType = getLinkActionGoal(url)
    switch (goalType) {
      case GoalType.Chat:
        return t('Start a Conversation')
      case GoalType.Bible:
        return t('Link to Bible')
      default:
        return t('Visit a Website')
    }
  }

  function handleSelect(): void {
    dispatch({
      type: 'SetActiveSlideAction',
      activeSlide: ActiveSlide.Content
    })
  }

  return (
    <Stack
      gap={2}
      justifyContent={
        actions != null && actions.length > 0 ? 'flex-start' : 'center'
      }
      py={6}
      flexGrow={1}
      data-testid="EditorActionsTable"
      onClick={handleSelect}
    >
      {journey != null &&
        (actions != null && actions.length > 0 ? (
          <ActionsList actions={actions} goalLabel={goalLabel} />
        ) : (
          <ActionsBanner />
        ))}
    </Stack>
  )
}

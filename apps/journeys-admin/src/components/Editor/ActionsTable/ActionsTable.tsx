import { ReactElement, useEffect } from 'react'
import Stack from '@mui/material/Stack'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ActionFields_LinkAction as LinkAction } from '../../../../__generated__/ActionFields'
import { BlockFields_ButtonBlock as ButtonBlock } from '../../../../__generated__/BlockFields'
import { GetJourney_journey as Journey } from '../../../../__generated__/GetJourney'
import { ActionDetails } from '../ActionDetails'
import { ActionsList } from './ActionsList'
import { ActionsBanner } from './ActionsBanner'

export interface Actions {
  url: string
  count: number
}

export function ActionsTable(): ReactElement {
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
    const urlObject = new URL(url)
    const hostname = urlObject.hostname.replace('www.', '') // Remove 'www.' and top-level domain suffixes
    switch (hostname) {
      case 'm.me':
      case 'messenger.com':
      case 't.me':
      case 'telegram.org':
      case 'wa.me':
      case 'whatsapp.com':
      case 'vb.me':
      case 'viber.com':
      case 'snapchat.com':
      case 'skype.com':
      case 'line.me':
      case 'vk.com':
        return 'Start a Conversation'
      case 'bible.com':
      case 'wordproject.org':
      case 'biblegateway.com':
      case 'worldbibles.org':
      case 'biblestudytools.com':
      case 'biblehub.com':
      case 'biblia.com':
      case 'blueletterbible.org':
      case 'bible-ru.org':
      case 'bibleonline.ru':
      case 'bible.by':
      case 'bible-facts.org':
      case 'copticchurch.net':
      case 'ebible.org':
      case 'arabicbible.com':
        return 'Link to Bible'
      default:
        return 'Visit a Website'
    }
  }

  useEffect(() => {
    dispatch({
      type: 'SetDrawerPropsAction',
      mobileOpen: true,
      title: 'Goal Details',
      children: <ActionDetails url={actions[0]?.url} />
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Stack gap={2} justifyContent="center">
      {actions != null && actions.length > 0 ? (
        <ActionsList actions={actions} goalLabel={goalLabel} />
      ) : (
        <ActionsBanner />
      )}
    </Stack>
  )
}

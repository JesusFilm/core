import { ReactElement } from 'react'
import Stack from '@mui/material/Stack'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { ActionsList } from './ActionsList'
import { ActionsBanner } from './ActionsBanner'
import { getActions } from './utils/getActions'

interface ActionsTableProps {
  hasAction?: (actions: boolean) => void
}

export function ActionsTable({ hasAction }: ActionsTableProps): ReactElement {
  const { journey } = useJourney()

  const actions = getActions(journey)
  console.log('actions', actions)

  actions.length >= 1 ? hasAction?.(true) : hasAction?.(false)

  const goalLabel = (url: string): string => {
    if (url === '') return ''
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
      case 'viber.me':
      case 'snapchat.com':
      case 'skype.com':
      case 'line.me':
      case 'vk.com':
      case 'tiktok.com':
      case 'instagram.com':
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

import { NextRouter } from 'next/dist/client/router'

import { ContactActionType } from '../../../__generated__/globalTypes'
import { nextActiveBlock } from '../block'

import { ActionFields } from './__generated__/ActionFields'

export function handleAction(
  router: NextRouter,
  action?: ActionFields | null,
  nextBlockAddress?: string
): void {
  const journeysUrls = [
    'your.nextstep.is',
    'localhost:4100',
    'your-stage.nextstep.is'
  ]

  if (action == null) return
  switch (action.__typename) {
    case 'NavigateToBlockAction':
      if (nextBlockAddress != null) {
        void router.push(nextBlockAddress)
      } else {
        nextActiveBlock({ id: action.blockId })
      }
      break
    case 'LinkAction':
      if (
        action.url.startsWith('http') &&
        !journeysUrls.some((substring) => action.url.includes(substring))
      ) {
        window.open(action.url, '_blank')
      } else if (action.url === '') {
        break
      } else {
        void router.push(action.url)?.then(() => window.location.reload())
      }
      break
    case 'EmailAction':
      window.open(`mailto:${action.email}`, '_blank')
      break
    case 'ChatAction':
      if (
        action.chatUrl.startsWith('http') &&
        !journeysUrls.some((substring) => action.chatUrl.includes(substring))
      ) {
        window.open(action.chatUrl, '_blank')
      } else if (action.chatUrl === '') {
        break
      } else {
        void router.push(action.chatUrl)?.then(() => window.location.reload())
      }
      break
    case 'PhoneAction':
      if (action.contactAction === ContactActionType.text) {
        window.location.href = `sms:${action.phone}`
      } else {
        window.location.href = `tel:${action.phone}`
      }
      break
  }
}

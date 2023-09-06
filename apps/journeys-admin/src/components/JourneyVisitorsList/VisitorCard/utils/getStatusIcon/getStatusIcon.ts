import { VisitorStatus } from '../../../../../../__generated__/globalTypes'

export function getStatusIcon(status?: VisitorStatus | null): string | null {
  let res: string | null = null

  switch (status) {
    case VisitorStatus.checkMarkSymbol:
      res = '✅'
      break
    case VisitorStatus.partyPopper:
      res = '🎉'
      break
    case VisitorStatus.prohibited:
      res = '🚫'
      break
    case VisitorStatus.redExclamationMark:
      res = '❗'
      break
    case VisitorStatus.redQuestionMark:
      res = '❓'
      break
    case VisitorStatus.robotFace:
      res = '🤖'
      break
    case VisitorStatus.star:
      res = '⭐'
      break
    case VisitorStatus.thumbsDown:
      res = '👎'
      break
    case VisitorStatus.thumbsUp:
      res = '👍'
      break
    case VisitorStatus.warning:
      res = '⚠'
      break
  }

  return res
}

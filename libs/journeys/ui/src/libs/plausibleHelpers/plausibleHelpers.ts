import {
  ButtonClickEventCreateInput,
  ChatOpenEventCreateInput,
  RadioQuestionSubmissionEventCreateInput,
  SignUpSubmissionEventCreateInput,
  StepNextEventCreateInput,
  StepPreviousEventCreateInput,
  StepViewEventCreateInput,
  TextResponseSubmissionEventCreateInput,
  VideoCollapseEventCreateInput,
  VideoCompleteEventCreateInput,
  VideoExpandEventCreateInput,
  VideoPauseEventCreateInput,
  VideoPlayEventCreateInput,
  VideoProgressEventCreateInput,
  VideoStartEventCreateInput
} from '../../../__generated__/globalTypes'
import { messagePlatforms } from '../../components/Button/utils/findMessagePlatform'
import {
  BlockFields_ButtonBlock_action,
  BlockFields_RadioOptionBlock_action,
  BlockFields_SignUpBlock_action,
  BlockFields_VideoBlock_action
} from '../block/__generated__/BlockFields'

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K: string]: any
  blockId: string
  /**
   * compound of stepId, event name, blockId, targetBlockId.
   * Needed to run plausible /api/v1/stats/breakdown api call with
   * property=event:props:key param
   * used for breakdown of journey map*/
  key: string
  /**
   * compound of stepId, event name, blockId.
   * Needed to run plausible /api/v1/stats/breakdown api call with
   * property=event:props:simpleKey param
   * used for aggregate stats for journey*/
  simpleKey: string
  /**
   * compound of event name, journeyId.
   * Needed to run plausible /api/v1/stats/breakdown api call with
   * property=event:templateKey param
   * used for journey breakdown stats by template*/
  templateKey?: string
  /**
   * compound of event name.
   * Needed to run plausible /api/v1/stats/breakdown api call with
   * property=event:simpleTemplateKey param
   * used for aggregate stats of template*/
  simpleTemplateKey?: string
}

interface Events {
  [K: string]: Props
}

export interface JourneyPlausibleEvents extends Events {
  footerThumbsUpButtonClick: Props
  footerThumbsDownButtonClick: Props
  shareButtonClick: Props
  pageview: StepViewEventCreateInput & Props
  navigatePreviousStep: StepPreviousEventCreateInput & Props
  navigateNextStep: StepNextEventCreateInput & Props
  buttonClick: ButtonClickEventCreateInput & Props
  chatButtonClick: ChatOpenEventCreateInput & Props
  footerChatButtonClick: ChatOpenEventCreateInput & Props
  radioQuestionSubmit: RadioQuestionSubmissionEventCreateInput & Props
  signUpSubmit: SignUpSubmissionEventCreateInput & Props
  textResponseSubmit: TextResponseSubmissionEventCreateInput & Props
  videoPlay: VideoPlayEventCreateInput & Props
  videoPause: VideoPauseEventCreateInput & Props
  videoExpand: VideoExpandEventCreateInput & Props
  videoCollapse: VideoCollapseEventCreateInput & Props
  videoStart: VideoStartEventCreateInput & Props
  videoProgress25: VideoProgressEventCreateInput & Props
  videoProgress50: VideoProgressEventCreateInput & Props
  videoProgress75: VideoProgressEventCreateInput & Props
  videoComplete: VideoCompleteEventCreateInput & Props
  videoTrigger: Props
  // New events
  prayerRequestCapture: Props
  christDecisionCapture: Props
  gospelStartCapture: Props
  gospelCompleteCapture: Props
  shareCapture: Props
  rsvpCapture: Props
  inviteFriendCapture: Props
  custom2Capture: Props
  custom3Capture: Props
  custom4Capture: Props
  custom5Capture: Props
}

interface KeyifyProps {
  stepId: string
  event: keyof JourneyPlausibleEvents
  blockId: string
  target?: string | Action | null
  journeyId?: string
}

export function generateActionTargetKey(action: Action): string {
  switch (action.__typename) {
    case 'NavigateToBlockAction':
      return action.blockId
    case 'LinkAction':
      return `link:${action.url}`
    case 'EmailAction':
      return `email:${action.email}`
    case 'ChatAction':
      return `chat:${action.chatUrl}`
    case 'PhoneAction':
      return `phone:${action.phone}`
    default:
      throw new Error(`Unknown action type`)
  }
}

export function keyify({
  stepId,
  event,
  blockId,
  target,
  journeyId
}: KeyifyProps): string {
  let targetId = ''

  if (typeof target === 'string' || target == null) {
    targetId = target ?? ''
  } else {
    targetId = generateActionTargetKey(target)
  }

  return JSON.stringify({
    stepId,
    event,
    blockId,
    target: targetId,
    journeyId
  })
}

export function reverseKeyify(key: string): {
  stepId: string
  event: keyof JourneyPlausibleEvents
  blockId: string
  target?: string
  journeyId?: string
} {
  return JSON.parse(key)
}

type Action =
  | BlockFields_ButtonBlock_action
  | BlockFields_RadioOptionBlock_action
  | BlockFields_SignUpBlock_action
  | BlockFields_VideoBlock_action

export function getTargetEventKey(action?: Action | null): string {
  if (action == null) return ''

  const target = generateActionTargetKey(action)
  return `${action.parentBlockId}->${target}`
}

interface TemplateKeyifyProps {
  event: keyof JourneyPlausibleEvents
  target?: string | Action | null
  journeyId?: string
}

export function templateKeyify({
  event,
  target,
  journeyId
}: TemplateKeyifyProps): string {
  let targetId = ''

  if (typeof target === 'string' || target == null) {
    targetId = target ?? ''
  } else {
    targetId = generateActionTargetKey(target)
  }

  return JSON.stringify({
    event,
    target: targetId,
    journeyId
  })
}

export function reverseTemplateKeyify(key: string): {
  event: keyof JourneyPlausibleEvents
  target?: string
  journeyId?: string
} {
  return JSON.parse(key)
}

export function actionToTarget(action: Action | null): 'link' | 'chat' | null {
  if (action == null) return null

  switch (action.__typename) {
    case 'NavigateToBlockAction':
      return null
    case 'LinkAction': {
      const isChatLink = messagePlatforms.find(({ url }: { url: string }) =>
        action.url.includes(url)
      )
      return isChatLink != null ? 'chat' : 'link'
    }
    case 'EmailAction':
      return null
    case 'ChatAction':
      return 'chat'
    case 'PhoneAction':
      return 'chat'
  }
}

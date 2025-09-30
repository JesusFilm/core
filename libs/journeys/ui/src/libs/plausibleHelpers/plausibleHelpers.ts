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
   * property=event:props:key param */
  key: string
  /**
   * compound of stepId, event name, blockId.
   * Needed to run plausible /api/v1/stats/breakdown api call with
   * property=event:props:simpleKey param */
  simpleKey: string
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
}

interface KeyifyProps {
  stepId: string
  event: keyof JourneyPlausibleEvents
  blockId: string
  target?: string | Action | null
}

export function generateActionTargetKey(action: Action): string {
  switch (action.__typename) {
    case 'NavigateToBlockAction':
      return action.blockId
    case 'LinkAction':
      return `link:${action.url}`
    case 'EmailAction':
      return `email:${action.email}`
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
  target
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
    target: targetId
  })
}

export function reverseKeyify(key: string): {
  stepId: string
  event: keyof JourneyPlausibleEvents
  blockId: string
  target?: string
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

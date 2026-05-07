import { usePlausible } from 'next-plausible'

import {
  BlockEventLabel,
  ButtonClickEventCreateInput,
  ChatOpenEventCreateInput,
  MultiselectSubmissionEventCreateInput,
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
   * compound of event name, journeyId, target.
   * Needed to run plausible /api/v1/stats/breakdown api call with
   * property=event:templateKey param
   * used for journey breakdown stats by template*/
  templateKey?: string
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
  multiSelectSubmit: MultiselectSubmissionEventCreateInput & Props
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
  multiselectSubmit: MultiselectSubmissionEventCreateInput & Props
  videoTrigger: Props
  // Capture events are triggered by journey events above
  prayerRequestCapture: Props
  christDecisionCapture: Props
  gospelStartCapture: Props
  gospelCompleteCapture: Props
  rsvpCapture: Props
  specialVideoStartCapture: Props
  specialVideoCompleteCapture: Props
  custom1Capture: Props
  custom2Capture: Props
  custom3Capture: Props
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

// Maps BlockEventLabel enum values to their registered Plausible capture goal names.
// Uses Record (not Partial) so TypeScript requires an explicit entry for every BlockEventLabel.
// Adding a new BlockEventLabel without updating this map is a compile error.
// Server-side counterpart: EVENT_TO_CAPTURE_MAP in
// apis/api-journeys-modern/src/schema/plausible/templateFamilyStatsBreakdown/utils/transformBreakdownResults.ts
// Both maps must stay in sync.
export const BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT: Record<
  BlockEventLabel,
  keyof JourneyPlausibleEvents | null
> = {
  [BlockEventLabel.decisionForChrist]: 'christDecisionCapture',
  [BlockEventLabel.gospelPresentationStart]: 'gospelStartCapture',
  [BlockEventLabel.gospelPresentationComplete]: 'gospelCompleteCapture',
  [BlockEventLabel.prayerRequest]: 'prayerRequestCapture',
  [BlockEventLabel.rsvp]: 'rsvpCapture',
  [BlockEventLabel.specialVideoStart]: 'specialVideoStartCapture',
  [BlockEventLabel.specialVideoComplete]: 'specialVideoCompleteCapture',
  [BlockEventLabel.custom1]: 'custom1Capture',
  [BlockEventLabel.custom2]: 'custom2Capture',
  [BlockEventLabel.custom3]: 'custom3Capture',
  // No Plausible capture goals are registered for these labels.
  // If goals are added for them in service.ts, add entries here and in EVENT_TO_CAPTURE_MAP.
  [BlockEventLabel.inviteFriend]: null,
  [BlockEventLabel.share]: null
}

interface FireCaptureEventOptions<TInput extends object> {
  u: string
  input: TInput
  stepId: string
  blockId: string
  target?: Action | string | null
  templateTarget?: string | null
  journeyId?: string
}

export function fireCaptureEvent<TInput extends object>(
  plausible: ReturnType<typeof usePlausible<JourneyPlausibleEvents>>,
  eventLabel: BlockEventLabel | null | undefined,
  {
    u,
    input,
    stepId,
    blockId,
    target,
    templateTarget,
    journeyId
  }: FireCaptureEventOptions<TInput>
): void {
  const captureEvent =
    eventLabel != null ? BLOCK_EVENT_LABEL_TO_PLAUSIBLE_EVENT[eventLabel] : null
  if (captureEvent == null) return

  plausible(captureEvent, {
    u,
    props: {
      ...input,
      blockId,
      key: keyify({ stepId, event: captureEvent, blockId, target, journeyId }),
      simpleKey: keyify({ stepId, event: captureEvent, blockId, journeyId }),
      templateKey: templateKeyify({
        event: captureEvent,
        target: templateTarget,
        journeyId
      })
    } as Props
  })
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

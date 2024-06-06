import slice from 'lodash/slice'

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
import { ActionFields as Action } from '../action/__generated__/ActionFields'

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K: string]: any
  blockId: string
  /**
   * compound of event name, blockId, targetBlockId.
   * Required to run plausible /api/v1/stats/breakdown api call with
   * property=event:props:key param */
  key: string
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
    switch (target.__typename) {
      case 'NavigateToBlockAction':
        targetId = target.blockId
        break
      case 'LinkAction':
        targetId = `link:${target.url}`
        break
      case 'EmailAction':
        targetId = `email:${target.email}`
        break
    }
  }
  return `${stepId}:${event}:${blockId}${targetId !== '' ? `:${targetId}` : ''}`
}

export function reverseKeyify(key: string): {
  stepId: string
  event: keyof JourneyPlausibleEvents
  blockId: string
  target?: string
} {
  const decodedProperties = key.split(':')

  const stepId = decodedProperties[0]
  const event = decodedProperties[1]
  const blockId = decodedProperties[2]
  const target =
    decodedProperties[3] === 'link' || decodedProperties[3] === 'email'
      ? slice(decodedProperties, 3, decodedProperties.length).join(':')
      : decodedProperties[3]

  return {
    stepId,
    event: event as keyof JourneyPlausibleEvents,
    blockId,
    target
  }
}

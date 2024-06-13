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
import { TreeBlock } from '../block'
import { BlockFields_StepBlock } from '../block/__generated__/BlockFields'
import { ActionBlock, isActionBlock } from '../isActionBlock'
import { PlausibleEvent } from '../transformPlausibleBreakdown/transformPlausibleBreakdown'

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

export interface BlockAnalytics {
  percentOfStepEvents: number
  event: PlausibleEvent
}

interface StepAnalytics {
  blockAnalyticsMap: Record<string, BlockAnalytics>
  totalActiveEvents: number
}

interface ActionEvent extends PlausibleEvent {
  target: string
}

function generateActionTargetKey(action: Action): string {
  switch (action.__typename) {
    case 'NavigateToBlockAction':
      return action.blockId
    case 'LinkAction':
      return `link:${action.url}`
    case 'EmailAction':
      return `email:${action.email}`
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

export function formatEventKey(from: string, to: string): string {
  return `${from}->${to}`
}

export function getBlockEventKey(block?: TreeBlock): string {
  let key = ''

  if (block == null) {
    return key
  }

  if (block?.__typename === 'StepBlock') {
    // Get a key for Steps that have a next block
    if (block.nextBlockId != null && block.nextBlockId !== '') {
      key = formatEventKey(block.id, block.nextBlockId)
    }
  }

  // Get a key for actions blocks that have an action
  if (isActionBlock(block) && block.action != null) {
    const target = generateActionTargetKey(block.action)
    key = formatEventKey(block.action.parentBlockId, target)
  }

  return key
}

export function isActiveActionEvent(
  event: PlausibleEvent
): event is ActionEvent {
  return event.target != null && event.event !== 'navigatePreviousStep'
}

export function getStepAnalytics(
  blocks: Array<TreeBlock<BlockFields_StepBlock> | ActionBlock>,
  eventMap?: Record<string, PlausibleEvent>
): StepAnalytics {
  let totalActiveEvents = 0
  const blockAnalyticsMap: { [key: string]: BlockAnalytics } = {}

  // Iterate over action blocks to populate blockAnalyticsMap and totalActiveEvents
  blocks.forEach((block) => {
    if (block == null) return

    const key = getBlockEventKey(block)
    const event = eventMap?.[key]

    if (event != null) {
      totalActiveEvents += event.events
      blockAnalyticsMap[block.id] = { event, percentOfStepEvents: 0 }
    }
  })

  // Calculate
  blocks.forEach((block) => {
    const analytics = blockAnalyticsMap[block.id]

    if (analytics == null) return

    const percentage = analytics.event.events / totalActiveEvents

    blockAnalyticsMap[block.id].percentOfStepEvents = percentage
  })

  return { blockAnalyticsMap, totalActiveEvents }
}

import {
  GetJourney_journey_blocks as Block,
  GetJourney_journey_blocks_ButtonBlock as ButtonBlock,
  GetJourney_journey_blocks_RadioOptionBlock as RadioOptionBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock,
  GetJourney_journey_blocks_VideoTriggerBlock as VideoTriggerBlock
} from '../../../../../__generated__/GetJourney'

type Action =
  | ButtonBlock['action']
  | RadioOptionBlock['action']
  | VideoBlock['action']
  | VideoTriggerBlock['triggerAction']
  | null
  | undefined
export function checkBlocksForCustomizableLinks(blocks: Block[]): boolean {
  if (blocks.length === 0) return false
  for (const block of blocks) {
    if (
      block.__typename !== 'ButtonBlock' &&
      block.__typename !== 'RadioOptionBlock' &&
      block.__typename !== 'VideoBlock' &&
      block.__typename !== 'VideoTriggerBlock'
    )
      continue

    if (block.__typename === 'VideoTriggerBlock')
      return checkActionBlock(block.triggerAction)

    return checkActionBlock(block.action)
  }
  return false
}

function checkActionBlock(action: Action): boolean {
  if (action == null) return false
  switch (action.__typename) {
    case 'LinkAction':
      return action.customizable === true
    case 'EmailAction':
      return action.customizable === true
    default:
      return false
  }
}

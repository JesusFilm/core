import {
  JourneyFields_blocks as Block,
  JourneyFields_blocks_ButtonBlock as ButtonBlock,
  JourneyFields_blocks_RadioOptionBlock as RadioOptionBlock,
  JourneyFields_blocks_VideoBlock as VideoBlock,
  JourneyFields_blocks_VideoTriggerBlock as VideoTriggerBlock
} from '../../JourneyProvider/__generated__/JourneyFields'

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

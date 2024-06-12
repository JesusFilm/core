import includes from 'lodash/includes'

import { Block } from '.prisma/api-journeys-client'

export function canBlockHaveAction(block: Block): boolean {
  return includes(
    [
      'SignUpBlock',
      'RadioOptionBlock',
      'ButtonBlock',
      'VideoBlock',
      'VideoTriggerBlock',
      'FormBlock'
    ],
    block.typename
  )
}

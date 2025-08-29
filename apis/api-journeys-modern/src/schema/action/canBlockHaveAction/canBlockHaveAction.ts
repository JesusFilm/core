import includes from 'lodash/includes'

import { Block } from '@core/prisma/journeys/client'

export function canBlockHaveAction(block: Block): boolean {
  return includes(
    [
      'SignUpBlock',
      'RadioOptionBlock',
      'ButtonBlock',
      'VideoBlock',
      'VideoTriggerBlock'
    ],
    block.typename
  )
}

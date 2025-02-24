import { TOptions } from 'i18next'

import { TreeBlock } from '../../../../libs/block'
import { getStepHeading } from '../../../../libs/getStepHeading'
import { ButtonFieldsFragment as ButtonFields } from '../../__generated__/buttonFields'

export function getActionLabel(
  action: ButtonFields['action'] | null,
  treeBlocks?: TreeBlock[],
  t?: (str: string, options?: TOptions) => string
): string | undefined {
  let actionLabel: string | undefined

  switch (action?.__typename) {
    case 'NavigateToBlockAction': {
      const stepBlock = treeBlocks?.find(
        (block) => block.id === action?.blockId
      )?.children

      actionLabel =
        treeBlocks != null && t != null && stepBlock != null
          ? getStepHeading(action.blockId, stepBlock, treeBlocks, t)
          : 'Unknown Step'
      break
    }
    case 'LinkAction':
      actionLabel = action.url
      break
  }

  return actionLabel
}

import type { TreeBlock } from '@core/journeys/ui/block'

import type {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_StepBlock as StepBlock
} from '../../../../../../../../__generated__/BlockFields'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant
} from '../../../../../../../../__generated__/globalTypes'

export const submitButton: TreeBlock<ButtonBlock> = {
  id: 'submitButton.id',
  __typename: 'ButtonBlock',
  parentBlockId: 'card.id',
  parentOrder: 0,
  label: '',
  buttonVariant: ButtonVariant.contained,
  buttonColor: ButtonColor.primary,
  size: ButtonSize.medium,
  startIconId: null,
  endIconId: null,
  action: null,
  submitEnabled: true,
  children: [],
  settings: null
}

export const stepWithSubmitButton: TreeBlock<StepBlock> = {
  id: 'step.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: null,
  locked: false,
  nextBlockId: null,
  slug: null,
  children: [
    {
      id: 'card.id',
      __typename: 'CardBlock',
      parentBlockId: 'step.id',
      coverBlockId: null,
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: [submitButton]
    }
  ]
}

export const stepWithoutSubmitButton: TreeBlock<StepBlock> = {
  id: 'step.id',
  __typename: 'StepBlock',
  parentBlockId: null,
  parentOrder: null,
  locked: false,
  nextBlockId: null,
  slug: null,
  children: [
    {
      id: 'card.id',
      __typename: 'CardBlock',
      parentBlockId: 'step.id',
      coverBlockId: null,
      parentOrder: 0,
      backgroundColor: null,
      themeMode: null,
      themeName: null,
      fullscreen: false,
      backdropBlur: null,
      children: []
    }
  ]
}

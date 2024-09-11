import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_CardBlock,
  BlockFields_StepBlock,
  BlockFields_TypographyBlock
} from '../../../../../../../../../__generated__/BlockFields'
import {
  ThemeMode,
  ThemeName,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'

export const menuStep: TreeBlock<
  BlockFields_StepBlock & { x: number; y: number }
> = {
  __typename: 'StepBlock',
  locked: false,
  nextBlockId: null,
  parentBlockId: null,
  parentOrder: 0,
  id: 'step.id',
  x: 0,
  y: 144,
  slug: 'menu',
  children: []
}
export const menuCard: BlockFields_CardBlock = {
  __typename: 'CardBlock',
  id: 'card.id',
  parentBlockId: 'step.id',
  themeMode: ThemeMode.dark,
  themeName: ThemeName.base,
  fullscreen: false,
  coverBlockId: null,
  backgroundColor: null,
  parentOrder: 0
}
export const menuTypography: BlockFields_TypographyBlock = {
  __typename: 'TypographyBlock' as const,
  id: 'typography.id',
  parentBlockId: 'card.id',
  parentOrder: 0,
  align: null,
  color: null,
  content: 'Menu',
  variant: TypographyVariant.h1
}

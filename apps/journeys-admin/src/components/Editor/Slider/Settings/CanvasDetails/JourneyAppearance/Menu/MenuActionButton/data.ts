import { TreeBlock } from '@core/journeys/ui/block'

import {
  BlockFields_ButtonBlock as Button,
  BlockFields_CardBlock as Card,
  BlockFields_StepBlock as Step,
  BlockFields_TypographyBlock as Typography
} from '../../../../../../../../../__generated__/BlockFields'
import {
  ButtonSize,
  ButtonVariant,
  ThemeMode,
  ThemeName,
  TypographyAlign,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'

const buttonBase = {
  __typename: 'ButtonBlock' as const,
  parentBlockId: 'card.id',
  buttonVariant: ButtonVariant.contained,
  buttonColor: null,
  size: ButtonSize.large,
  startIconId: null,
  endIconId: null,
  submitEnabled: null,
  action: null,
  settings: null
}

export const mockMenuStep: TreeBlock<Step & { x: number; y: number }> = {
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

export const mockMenuCard = {
  __typename: 'CardBlock',
  id: 'card.id',
  parentBlockId: 'step.id',
  themeMode: ThemeMode.dark,
  themeName: ThemeName.base,
  fullscreen: false,
  backdropBlur: null,
  coverBlockId: null,
  backgroundColor: null,
  parentOrder: 0
} satisfies Card

export const mockMenuHeading = {
  __typename: 'TypographyBlock' as const,
  id: 'heading.id',
  parentBlockId: 'card.id',
  parentOrder: 0,
  align: TypographyAlign.center,
  color: null,
  content: 'Menu',
  variant: TypographyVariant.h1
} satisfies Typography

export const mockMenuSubHeading = {
  __typename: 'TypographyBlock' as const,
  id: 'subHeading.id',
  parentBlockId: 'card.id',
  parentOrder: 1,
  align: TypographyAlign.center,
  color: null,
  content: 'Helping people discover Jesus.',
  variant: TypographyVariant.subtitle2
} satisfies Typography

export const mockMenuButton1 = {
  ...buttonBase,
  id: 'button1.id',
  parentOrder: 2,
  label: 'About Us'
} satisfies Button

export const mockMenuButton2 = {
  ...buttonBase,
  id: 'button2.id',
  parentOrder: 3,
  label: 'Ministries'
} satisfies Button

export const mockMenuButton3 = {
  ...buttonBase,
  id: 'button3.id',
  parentOrder: 5,
  label: 'Contact Us'
} satisfies Button

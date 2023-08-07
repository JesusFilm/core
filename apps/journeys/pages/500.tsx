import { ReactElement } from 'react'

import { transformer } from '@core/journeys/ui/transformer'
import { ThemeProvider } from '@core/shared/ui/ThemeProvider'

import { GetJourney_journey_blocks as Block } from '../__generated__/GetJourney'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconName,
  ThemeMode,
  ThemeName,
  TypographyAlign,
  TypographyVariant
} from '../__generated__/globalTypes'
import { Conductor } from '../src/components/Conductor'

const blocks: Block[] = [
  {
    __typename: 'StepBlock',
    id: 'stepBlock1.id',
    locked: false,
    nextBlockId: null,
    parentBlockId: null,
    parentOrder: 0
  },
  {
    __typename: 'CardBlock',
    backgroundColor: '#30313D',
    coverBlockId: 'imageBlock1.id',
    fullscreen: false,
    id: 'cardBlock1.id',
    parentBlockId: 'stepBlock1.id',
    parentOrder: 0,
    themeMode: null,
    themeName: null
  },
  {
    __typename: 'ImageBlock',
    alt: 'error-500-image',
    blurhash: 'U05OKJ0300sq5O?Y~VM|0M-.%1%K~o9HEKxu',
    height: 2230,
    id: 'imageBlock1.id',
    parentBlockId: 'cardBlock1.id',
    parentOrder: null,
    src: 'https://images.unsplash.com/photo-1522030865324-4062412a2023?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3244&q=80',
    width: 3244
  },
  {
    __typename: 'TypographyBlock',
    align: TypographyAlign.center,
    color: null,
    content: '500',
    id: 'typog1.id',
    parentBlockId: 'cardBlock1.id',
    parentOrder: 0,
    variant: TypographyVariant.h2
  },
  {
    __typename: 'TypographyBlock',
    align: TypographyAlign.center,
    color: null,
    content: 'This journey is not available.',
    id: 'typog2.id',
    parentBlockId: 'cardBlock1.id',
    parentOrder: 1,
    variant: TypographyVariant.h5
  },
  {
    __typename: 'ButtonBlock',
    buttonColor: ButtonColor.primary,
    buttonVariant: ButtonVariant.contained,
    endIconId: 'icon2.id',
    id: 'button1.id',
    label: 'See Other Journeys',
    parentBlockId: 'cardBlock1.id',
    parentOrder: 2,
    size: ButtonSize.large,
    startIconId: 'icon1,id',
    action: {
      gtmEventName: null,
      parentBlockId: 'button1.id',
      url: '/',
      __typename: 'LinkAction'
    }
  },
  {
    __typename: 'IconBlock',
    iconColor: null,
    iconName: IconName.SubscriptionsRounded,
    iconSize: null,
    id: 'icon1,id',
    parentBlockId: 'button1.id',
    parentOrder: null
  },
  {
    __typename: 'IconBlock',
    iconColor: null,
    iconName: null,
    iconSize: null,
    id: 'icon2.id',
    parentBlockId: 'button1.id',
    parentOrder: null
  }
]

export function Custom500(): ReactElement {
  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.dark}>
      <Conductor blocks={transformer(blocks)} />
    </ThemeProvider>
  )
}

export default Custom500

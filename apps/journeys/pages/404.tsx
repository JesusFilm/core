import { useTranslation } from 'next-i18next'
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

export function Custom404(): ReactElement {
  const { t } = useTranslation('apps-journeys')
  const blocks: Block[] = [
    {
      __typename: 'StepBlock',
      id: '404-stepBlock-id',
      locked: false,
      nextBlockId: null,
      parentBlockId: null,
      parentOrder: 0,
      slug: null
    },
    {
      __typename: 'CardBlock',
      backgroundColor: '#30313D',
      backdropBlur: null,
      coverBlockId: '404-imageBlock-id',
      fullscreen: false,
      id: '404-cardBlock-id',
      parentBlockId: '404-stepBlock-id',
      parentOrder: 0,
      themeMode: null,
      themeName: null
    },
    {
      __typename: 'ImageBlock',
      alt: 'error-404-image',
      blurhash: 'U05OKJ0300sq5O?Y~VM|0M-.%1%K~o9HEKxu',
      height: 2230,
      id: '404-imageBlock-id',
      parentBlockId: '404-cardBlock-id',
      parentOrder: null,
      src: 'https://images.unsplash.com/photo-1522030865324-4062412a2023?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3244&q=80',
      width: 3244,
      scale: null,
      focalLeft: 50,
      focalTop: 50
    },
    {
      __typename: 'TypographyBlock',
      align: TypographyAlign.center,
      color: null,
      content: t('404'),
      id: '404-typog-id',
      parentBlockId: '404-cardBlock-id',
      parentOrder: 0,
      variant: TypographyVariant.h2,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
    },
    {
      __typename: 'TypographyBlock',
      align: TypographyAlign.center,
      color: null,
      content: t('This Journey is not available.'),
      id: 'typog2-id',
      parentBlockId: '404-cardBlock-id',
      parentOrder: 1,
      variant: TypographyVariant.h5,
  settings: {
    __typename: 'TypographyBlockSettings',
    color: null
  }
    },
    {
      __typename: 'ButtonBlock',
      buttonColor: ButtonColor.primary,
      buttonVariant: ButtonVariant.contained,
      endIconId: null,
      id: '404-button-id',
      label: 'See Other Journeys',
      parentBlockId: '404-cardBlock-id',
      parentOrder: 2,
      size: ButtonSize.large,
      startIconId: '404-icon-id',
      submitEnabled: null,
      action: {
        gtmEventName: null,
        parentBlockId: '404-button-id',
        url: '/',
        __typename: 'LinkAction'
      }
    },
    {
      __typename: 'IconBlock',
      iconColor: null,
      iconName: IconName.SubscriptionsRounded,
      iconSize: null,
      id: '404-icon-id',
      parentBlockId: '404-button-id',
      parentOrder: null
    }
  ]

  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.dark}>
      <Conductor blocks={transformer(blocks)} />
    </ThemeProvider>
  )
}

export default Custom404

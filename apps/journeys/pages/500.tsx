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

export function Custom500(): ReactElement {
  const { t } = useTranslation('apps-journeys')

  const blocks: Block[] = [
    {
      __typename: 'StepBlock',
      id: '500-stepBlock-id',
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
      coverBlockId: '500-imageBlock-id',
      fullscreen: false,
      id: '500-cardBlock-id',
      parentBlockId: '500-stepBlock-id',
      parentOrder: 0,
      themeMode: null,
      themeName: null
    },
    {
      __typename: 'ImageBlock',
      alt: 'error-500-image',
      blurhash: 'U05OKJ0300sq5O?Y~VM|0M-.%1%K~o9HEKxu',
      height: 2230,
      id: '500-imageBlock-id',
      parentBlockId: '500-cardBlock-id',
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
      content: t('500'),
      id: '500-typog-id',
      parentBlockId: '500-cardBlock-id',
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
      content: t('Oops! Something went wrong.'),
      id: 'typog2-id',
      parentBlockId: '500-cardBlock-id',
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
      id: '500-button-id',
      label: 'See Other Journeys',
      parentBlockId: '500-cardBlock-id',
      parentOrder: 2,
      size: ButtonSize.large,
      startIconId: '500-icon-id',
      submitEnabled: null,
      action: {
        gtmEventName: null,
        parentBlockId: '500-button-id',
        url: '/',
        __typename: 'LinkAction',
        customizable: false,
        parentStepId: null
      },
      settings: null
    },
    {
      __typename: 'IconBlock',
      iconColor: null,
      iconName: IconName.SubscriptionsRounded,
      iconSize: null,
      id: '500-icon-id',
      parentBlockId: '500-button-id',
      parentOrder: null
    }
  ]

  return (
    <ThemeProvider themeName={ThemeName.base} themeMode={ThemeMode.dark}>
      <Conductor blocks={transformer(blocks)} />
    </ThemeProvider>
  )
}

export default Custom500

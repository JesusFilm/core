import { GetJourney_journey_blocks as Block } from '../../__generated__/GetJourney'
import {
  IconName,
  TypographyAlign,
  TypographyVariant,
  ButtonColor,
  ButtonVariant,
  ButtonSize
} from '../../__generated__/globalTypes'

export function getErrorJourneyBlocks(errorCode: '404' | '500'): Block[] {
  return [
    {
      __typename: 'StepBlock',
      id: `${errorCode}-stepBlock-id`,
      locked: false,
      nextBlockId: null,
      parentBlockId: null,
      parentOrder: 0
    },
    {
      __typename: 'CardBlock',
      backgroundColor: '#30313D',
      coverBlockId: `${errorCode}-imageBlock-id`,
      fullscreen: false,
      id: `${errorCode}-cardBlock-id`,
      parentBlockId: `${errorCode}-stepBlock-id`,
      parentOrder: 0,
      themeMode: null,
      themeName: null
    },
    {
      __typename: 'ImageBlock',
      alt: `error-${errorCode}-image`,
      blurhash: 'U05OKJ0300sq5O?Y~VM|0M-.%1%K~o9HEKxu',
      height: 2230,
      id: `${errorCode}-imageBlock-id`,
      parentBlockId: `${errorCode}-cardBlock-id`,
      parentOrder: null,
      src: 'https://images.unsplash.com/photo-1522030865324-4062412a2023?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3244&q=80',
      width: 3244
    },
    {
      __typename: 'TypographyBlock',
      align: TypographyAlign.center,
      color: null,
      content: errorCode,
      id: `${errorCode}-typog-id`,
      parentBlockId: `${errorCode}-cardBlock-id`,
      parentOrder: 0,
      variant: TypographyVariant.h2
    },
    {
      __typename: 'TypographyBlock',
      align: TypographyAlign.center,
      color: null,
      content:
        errorCode === '404'
          ? 'This journey is not available.'
          : ' Oops! Something went wrong.',
      id: 'typog2-id',
      parentBlockId: `${errorCode}-cardBlock-id`,
      parentOrder: 1,
      variant: TypographyVariant.h5
    },
    {
      __typename: 'ButtonBlock',
      buttonColor: ButtonColor.primary,
      buttonVariant: ButtonVariant.contained,
      endIconId: `${errorCode}-icon-id`,
      id: `${errorCode}-button-id`,
      label: 'See Other Journeys',
      parentBlockId: `${errorCode}-cardBlock-id`,
      parentOrder: 2,
      size: ButtonSize.large,
      startIconId: `${errorCode}-icon-id`,
      action: {
        gtmEventName: null,
        parentBlockId: `${errorCode}-button-id`,
        url: '/',
        __typename: 'LinkAction'
      }
    },
    {
      __typename: 'IconBlock',
      iconColor: null,
      iconName: IconName.SubscriptionsRounded,
      iconSize: null,
      id: `${errorCode}-icon,id`,
      parentBlockId: `${errorCode}-button-id`,
      parentOrder: null
    },
    {
      __typename: 'IconBlock',
      iconColor: null,
      iconName: null,
      iconSize: null,
      id: `${errorCode}-icon-id`,
      parentBlockId: `${errorCode}-button-id`,
      parentOrder: null
    }
  ]
}

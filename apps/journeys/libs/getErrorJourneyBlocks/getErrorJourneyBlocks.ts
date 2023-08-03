import { GetJourney_journey_blocks as Block } from '../../__generated__/GetJourney'
import {
  IconName,
  TypographyAlign,
  TypographyVariant,
  ButtonColor,
  ButtonVariant,
  ButtonSize
} from '../../__generated__/globalTypes'

export function getErrorJourneyBlocks(
  title: string,
  description: string
): Block[] {
  return [
    {
      __typename: 'StepBlock',
      id: `${title}-stepBlock-id`,
      locked: false,
      nextBlockId: null,
      parentBlockId: null,
      parentOrder: 0
    },
    {
      __typename: 'CardBlock',
      backgroundColor: '#30313D',
      coverBlockId: `${title}-imageBlock-id`,
      fullscreen: false,
      id: `${title}-cardBlock-id`,
      parentBlockId: `${title}-stepBlock-id`,
      parentOrder: 0,
      themeMode: null,
      themeName: null
    },
    {
      __typename: 'ImageBlock',
      alt: `error-${title}-image`,
      blurhash: 'U05OKJ0300sq5O?Y~VM|0M-.%1%K~o9HEKxu',
      height: 2230,
      id: `${title}-imageBlock-id`,
      parentBlockId: `${title}-cardBlock-id`,
      parentOrder: null,
      src: 'https://images.unsplash.com/photo-1522030865324-4062412a2023?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3244&q=80',
      width: 3244
    },
    {
      __typename: 'TypographyBlock',
      align: TypographyAlign.center,
      color: null,
      content: title,
      id: `${title}-typog-id`,
      parentBlockId: `${title}-cardBlock-id`,
      parentOrder: 0,
      variant: TypographyVariant.h2
    },
    {
      __typename: 'TypographyBlock',
      align: TypographyAlign.center,
      color: null,
      content: description,
      id: 'typog2-id',
      parentBlockId: `${title}-cardBlock-id`,
      parentOrder: 1,
      variant: TypographyVariant.h5
    },
    {
      __typename: 'ButtonBlock',
      buttonColor: ButtonColor.primary,
      buttonVariant: ButtonVariant.contained,
      endIconId: null,
      id: `${title}-button-id`,
      label: 'See Other Journeys',
      parentBlockId: `${title}-cardBlock-id`,
      parentOrder: 2,
      size: ButtonSize.large,
      startIconId: `${title}-icon-id`,
      action: {
        gtmEventName: null,
        parentBlockId: `${title}-button-id`,
        url: '/',
        __typename: 'LinkAction'
      }
    },
    {
      __typename: 'IconBlock',
      iconColor: null,
      iconName: IconName.SubscriptionsRounded,
      iconSize: null,
      id: `${title}-icon-id`,
      parentBlockId: `${title}-button-id`,
      parentOrder: null
    }
  ]
}

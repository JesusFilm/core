import { MockedResponse } from '@apollo/client/testing'

import {
  CardCtaCreate,
  CardCtaCreateVariables
} from '../../../../../../../../../__generated__/CardCtaCreate'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconName,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'

import { CARD_CTA_CREATE } from './CardCta'

const cardCtaCreate: CardCtaCreate = {
  image: {
    id: 'imageId',
    parentBlockId: 'cardId',
    parentOrder: null,
    src: 'https://images.unsplash.com/photo-1474314881477-04c4aac40a0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHw3OHx8dGFsa2luZ3xlbnwwfHx8fDE2OTUxNzExNTl8MA&ixlib=rb-4.0.3&q=80&w=1080',
    alt: 'photo-1474314881477-04c4aac40a0e',
    width: 6000,
    height: 4000,
    blurhash: 'L~NTUYkWM{t7~qs:WBofEMjYt7WB',
    __typename: 'ImageBlock'
  },
  subtitle: {
    id: 'subtitleId',
    parentBlockId: 'cardId',
    parentOrder: 0,
    align: null,
    color: null,
    content: "Let's Connect",
    variant: TypographyVariant.h6,
    __typename: 'TypographyBlock'
  },
  title: {
    id: 'titleId',
    parentBlockId: 'cardId',
    parentOrder: 1,
    align: null,
    color: null,
    content: "From 'hello' to heartfelt conversations",
    variant: TypographyVariant.h3,
    __typename: 'TypographyBlock'
  },
  button1: {
    id: 'button1Id',
    parentBlockId: 'cardId',
    parentOrder: 2,
    label: 'Chat with us',
    buttonVariant: ButtonVariant.contained,
    buttonColor: null,
    size: ButtonSize.large,
    startIconId: null,
    endIconId: null,
    action: null,
    __typename: 'ButtonBlock'
  },
  startIcon1: {
    id: 'startIcon1Id',
    parentBlockId: 'button1Id',
    parentOrder: null,
    iconName: IconName.ChatBubbleOutlineRounded,
    iconSize: null,
    iconColor: null,
    __typename: 'IconBlock'
  },
  endIcon1: {
    id: 'endIcon1Id',
    parentBlockId: 'button1Id',
    parentOrder: null,
    iconName: null,
    iconSize: null,
    iconColor: null,
    __typename: 'IconBlock'
  },
  button1Update: {
    id: 'button1Id',
    parentBlockId: 'cardId',
    parentOrder: 2,
    label: 'Chat with us',
    buttonVariant: ButtonVariant.contained,
    buttonColor: null,
    size: ButtonSize.large,
    startIconId: 'startIcon1Id',
    endIconId: 'endIcon1Id',
    action: null,
    __typename: 'ButtonBlock'
  },
  button2: {
    id: 'button2Id',
    parentBlockId: 'cardId',
    parentOrder: 3,
    label: 'Email us',
    buttonVariant: ButtonVariant.contained,
    buttonColor: null,
    size: ButtonSize.large,
    startIconId: null,
    endIconId: null,
    action: null,
    __typename: 'ButtonBlock'
  },
  startIcon2: {
    id: 'startIcon2Id',
    parentBlockId: 'button2Id',
    parentOrder: null,
    iconName: IconName.SendRounded,
    iconSize: null,
    iconColor: null,
    __typename: 'IconBlock'
  },
  endIcon2: {
    id: 'endIcon2Id',
    parentBlockId: 'button2Id',
    parentOrder: null,
    iconName: null,
    iconSize: null,
    iconColor: null,
    __typename: 'IconBlock'
  },
  button2Update: {
    id: 'button2Id',
    parentBlockId: 'cardId',
    parentOrder: 3,
    label: 'Email us',
    buttonVariant: ButtonVariant.contained,
    buttonColor: null,
    size: ButtonSize.large,
    startIconId: 'startIcon2Id',
    endIconId: 'endIcon2Id',
    action: null,
    __typename: 'ButtonBlock'
  },
  button3: {
    id: 'button3Id',
    parentBlockId: 'cardId',
    parentOrder: 4,
    label: 'More about us',
    buttonVariant: ButtonVariant.text,
    buttonColor: ButtonColor.secondary,
    size: ButtonSize.large,
    startIconId: null,
    endIconId: null,
    action: null,
    __typename: 'ButtonBlock'
  },
  startIcon3: {
    id: 'startIcon3Id',
    parentBlockId: 'button3Id',
    parentOrder: null,
    iconName: IconName.ArrowForwardRounded,
    iconSize: null,
    iconColor: null,
    __typename: 'IconBlock'
  },
  endIcon3: {
    id: 'endIcon3Id',
    parentBlockId: 'button3Id',
    parentOrder: null,
    iconName: null,
    iconSize: null,
    iconColor: null,
    __typename: 'IconBlock'
  },
  button3Update: {
    id: 'button3Id',
    parentBlockId: 'cardId',
    parentOrder: 4,
    label: 'More about us',
    buttonVariant: ButtonVariant.text,
    buttonColor: ButtonColor.secondary,
    size: ButtonSize.large,
    startIconId: 'startIcon3Id',
    endIconId: 'endIcon3Id',
    action: null,
    __typename: 'ButtonBlock'
  },
  cardBlockUpdate: {
    id: 'cardId',
    parentBlockId: 'stepId',
    parentOrder: 0,
    backgroundColor: '#0E1412',
    coverBlockId: 'imageId',
    themeMode: null,
    themeName: null,
    fullscreen: false,
    __typename: 'CardBlock'
  }
}

export const cardCtaResult = jest.fn(() => ({
  data: cardCtaCreate
}))

export const cardCtaCreateMock: MockedResponse<
  CardCtaCreate,
  CardCtaCreateVariables
> = {
  request: {
    query: CARD_CTA_CREATE,
    variables: {
      journeyId: 'journeyId',
      imageInput: {
        journeyId: 'journeyId',
        parentBlockId: 'cardId',
        alt: 'photo-1474314881477-04c4aac40a0e',
        blurhash: 'L~NTUYkWM{t7~qs:WBofEMjYt7WB',
        height: 4000,
        src: 'https://images.unsplash.com/photo-1474314881477-04c4aac40a0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHw3OHx8dGFsa2luZ3xlbnwwfHx8fDE2OTUxNzExNTl8MA&ixlib=rb-4.0.3&q=80&w=1080',
        width: 6000,
        isCover: true
      },
      subtitleInput: {
        journeyId: 'journeyId',
        parentBlockId: 'cardId',
        content: "Let's Connect",
        variant: TypographyVariant.h6
      },
      titleInput: {
        journeyId: 'journeyId',
        parentBlockId: 'cardId',
        content: "From 'hello' to heartfelt conversations",
        variant: TypographyVariant.h3
      },
      button1Id: 'button1Id',
      button1Input: {
        id: 'button1Id',
        journeyId: 'journeyId',
        parentBlockId: 'cardId',
        label: 'Chat with us',
        variant: ButtonVariant.contained,
        size: ButtonSize.large
      },
      startIcon1Input: {
        id: 'startIcon1Id',
        journeyId: 'journeyId',
        parentBlockId: 'button1Id',
        name: IconName.ChatBubbleOutlineRounded
      },
      endIcon1Input: {
        id: 'endIcon1Id',
        journeyId: 'journeyId',
        parentBlockId: 'button1Id'
      },
      button1UpdateInput: {
        startIconId: 'startIcon1Id',
        endIconId: 'endIcon1Id'
      },
      button2Id: 'button2Id',
      button2Input: {
        id: 'button2Id',
        journeyId: 'journeyId',
        parentBlockId: 'cardId',
        label: 'Email us',
        variant: ButtonVariant.contained,
        size: ButtonSize.large
      },
      startIcon2Input: {
        id: 'startIcon2Id',
        journeyId: 'journeyId',
        parentBlockId: 'button2Id',
        name: IconName.SendRounded
      },
      endIcon2Input: {
        id: 'endIcon2Id',
        journeyId: 'journeyId',
        parentBlockId: 'button2Id'
      },
      button2UpdateInput: {
        startIconId: 'startIcon2Id',
        endIconId: 'endIcon2Id'
      },
      button3Id: 'button3Id',
      button3Input: {
        id: 'button3Id',
        journeyId: 'journeyId',
        parentBlockId: 'cardId',
        label: 'More about us',
        variant: ButtonVariant.text,
        color: ButtonColor.secondary,
        size: ButtonSize.large
      },
      startIcon3Input: {
        id: 'startIcon3Id',
        journeyId: 'journeyId',
        parentBlockId: 'button3Id',
        name: IconName.ArrowForwardRounded
      },
      endIcon3Input: {
        id: 'endIcon3Id',
        journeyId: 'journeyId',
        parentBlockId: 'button3Id'
      },
      button3UpdateInput: {
        startIconId: 'startIcon3Id',
        endIconId: 'endIcon3Id'
      },
      cardId: 'cardId',
      cardInput: {
        backgroundColor: '#0E1412'
      }
    }
  },
  result: cardCtaResult
}

import { gql, useMutation } from '@apollo/client'
import ButtonBase from '@mui/material/ButtonBase'
import omit from 'lodash/omit'
import pick from 'lodash/pick'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'
import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ICON_FIELDS } from '@core/journeys/ui/Icon/iconFields'
import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'

import {
  BlockFields_ButtonBlock as ButtonBlock,
  BlockFields_CardBlock as CardBlock,
  BlockFields_IconBlock as IconBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../../../../../../../__generated__/BlockFields'
import type {
  CardCtaCreate,
  CardCtaCreateVariables
} from '../../../../../../../../../__generated__/CardCtaCreate'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconName,
  ThemeMode,
  ThemeName,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'

import cardCtaImage from './cardCta.svg'

export const CARD_CTA_CREATE = gql`
  ${IMAGE_FIELDS}
  ${TYPOGRAPHY_FIELDS}
  ${BUTTON_FIELDS}
  ${ICON_FIELDS}
  ${CARD_FIELDS}
  mutation CardCtaCreate(
    $journeyId: ID!
    $imageInput: ImageBlockCreateInput!
    $subtitleInput: TypographyBlockCreateInput!
    $titleInput: TypographyBlockCreateInput!
    $button1Input: ButtonBlockCreateInput!
    $button1Id: ID!
    $button1UpdateInput: ButtonBlockUpdateInput!
    $startIcon1Input: IconBlockCreateInput!
    $endIcon1Input: IconBlockCreateInput!
    $button2Input: ButtonBlockCreateInput!
    $button2Id: ID!
    $button2UpdateInput: ButtonBlockUpdateInput!
    $startIcon2Input: IconBlockCreateInput!
    $endIcon2Input: IconBlockCreateInput!
    $button3Input: ButtonBlockCreateInput!
    $button3Id: ID!
    $button3UpdateInput: ButtonBlockUpdateInput!
    $startIcon3Input: IconBlockCreateInput!
    $endIcon3Input: IconBlockCreateInput!
    $cardId: ID!
    $cardInput: CardBlockUpdateInput!
  ) {
    image: imageBlockCreate(input: $imageInput) {
      ...ImageFields
    }
    subtitle: typographyBlockCreate(input: $subtitleInput) {
      ...TypographyFields
    }
    title: typographyBlockCreate(input: $titleInput) {
      ...TypographyFields
    }
    button1: buttonBlockCreate(input: $button1Input) {
      ...ButtonFields
    }
    startIcon1: iconBlockCreate(input: $startIcon1Input) {
      ...IconFields
    }
    endIcon1: iconBlockCreate(input: $endIcon1Input) {
      ...IconFields
    }
    button1Update: buttonBlockUpdate(
      id: $button1Id
      journeyId: $journeyId
      input: $button1UpdateInput
    ) {
      ...ButtonFields
    }
    button2: buttonBlockCreate(input: $button2Input) {
      ...ButtonFields
    }
    startIcon2: iconBlockCreate(input: $startIcon2Input) {
      ...IconFields
    }
    endIcon2: iconBlockCreate(input: $endIcon2Input) {
      ...IconFields
    }
    button2Update: buttonBlockUpdate(
      id: $button2Id
      journeyId: $journeyId
      input: $button2UpdateInput
    ) {
      ...ButtonFields
    }
    button3: buttonBlockCreate(input: $button3Input) {
      ...ButtonFields
    }
    startIcon3: iconBlockCreate(input: $startIcon3Input) {
      ...IconFields
    }
    endIcon3: iconBlockCreate(input: $endIcon3Input) {
      ...IconFields
    }
    button3Update: buttonBlockUpdate(
      id: $button3Id
      journeyId: $journeyId
      input: $button3UpdateInput
    ) {
      ...ButtonFields
    }
    cardBlockUpdate(id: $cardId, input: $cardInput) {
      ...CardFields
    }
  }
`

export function CardCta(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()

  const [cardCtaCreate] = useMutation<CardCtaCreate, CardCtaCreateVariables>(
    CARD_CTA_CREATE
  )

  async function handleClick(): Promise<void> {
    const cardId = selectedStep?.children[0].id
    if (journey == null || cardId == null || selectedStep == null) return

    const imageBlock = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: null,
      src: 'https://images.unsplash.com/photo-1474314881477-04c4aac40a0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHw3OHx8dGFsa2luZ3xlbnwwfHx8fDE2OTUxNzExNTl8MA&ixlib=rb-4.0.3&q=80&w=1080',
      alt: 'photo-1474314881477-04c4aac40a0e',
      width: 6000,
      height: 4000,
      blurhash: 'L~NTUYkWM{t7~qs:WBofEMjYt7WB',
      __typename: 'ImageBlock'
    } satisfies ImageBlock

    const subtitle = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 0,
      align: null,
      color: null,
      content: t("Let's Connect"),
      variant: TypographyVariant.h6,
      __typename: 'TypographyBlock'
    } satisfies TypographyBlock

    const title = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 1,
      align: null,
      color: null,
      content: t("From 'hello' to heartfelt conversations"),
      variant: TypographyVariant.h3,
      __typename: 'TypographyBlock'
    } satisfies TypographyBlock

    const buttonBlock1 = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 2,
      label: t('Chat with us'),
      buttonVariant: ButtonVariant.contained,
      buttonColor: null,
      size: ButtonSize.large,
      startIconId: null,
      endIconId: null,
      action: null,
      __typename: 'ButtonBlock'
    } satisfies ButtonBlock

    const startIconBlock1 = {
      id: uuidv4(),
      parentBlockId: buttonBlock1.id,
      parentOrder: null,
      iconName: IconName.ChatBubbleOutlineRounded,
      iconSize: null,
      iconColor: null,
      __typename: 'IconBlock'
    } satisfies IconBlock

    const endIconBlock1 = {
      id: uuidv4(),
      parentBlockId: buttonBlock1.id,
      parentOrder: null,
      iconName: null,
      iconSize: null,
      iconColor: null,
      __typename: 'IconBlock'
    } satisfies IconBlock

    const buttonBlock2 = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 3,
      label: t('Email us'),
      buttonVariant: ButtonVariant.contained,
      buttonColor: null,
      size: ButtonSize.large,
      startIconId: null,
      endIconId: null,
      action: null,
      __typename: 'ButtonBlock'
    } satisfies ButtonBlock

    const startIconBlock2 = {
      id: uuidv4(),
      parentBlockId: buttonBlock2.id,
      parentOrder: null,
      iconName: IconName.SendRounded,
      iconSize: null,
      iconColor: null,
      __typename: 'IconBlock'
    } satisfies IconBlock

    const endIconBlock2 = {
      id: uuidv4(),
      parentBlockId: buttonBlock2.id,
      parentOrder: null,
      iconName: null,
      iconSize: null,
      iconColor: null,
      __typename: 'IconBlock'
    } satisfies IconBlock

    const buttonBlock3 = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 4,
      label: t('More about us'),
      buttonVariant: ButtonVariant.text,
      buttonColor: ButtonColor.secondary,
      size: ButtonSize.large,
      startIconId: null,
      endIconId: null,
      action: null,
      __typename: 'ButtonBlock'
    } satisfies ButtonBlock

    const startIconBlock3 = {
      id: uuidv4(),
      parentBlockId: buttonBlock3.id,
      parentOrder: null,
      iconName: IconName.ArrowForwardRounded,
      iconSize: null,
      iconColor: null,
      __typename: 'IconBlock'
    } satisfies IconBlock

    const endIconBlock3 = {
      id: uuidv4(),
      parentBlockId: buttonBlock3.id,
      parentOrder: null,
      iconName: null,
      iconSize: null,
      iconColor: null,
      __typename: 'IconBlock'
    } satisfies IconBlock

    const cardBlock = {
      id: cardId,
      parentBlockId: selectedStep.id,
      parentOrder: 0,
      backgroundColor: '#0E1412',
      coverBlockId: imageBlock.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      __typename: 'CardBlock'
    } satisfies CardBlock

    const createdBlocks = [
      imageBlock,
      subtitle,
      title,
      buttonBlock1,
      startIconBlock1,
      endIconBlock1,
      buttonBlock2,
      startIconBlock2,
      endIconBlock2,
      buttonBlock3,
      startIconBlock3,
      endIconBlock3
    ]

    await cardCtaCreate({
      variables: {
        journeyId: journey.id,
        imageInput: {
          ...omit(imageBlock, ['__typename', 'parentOrder']),
          journeyId: journey.id,
          isCover: true
        },
        subtitleInput: {
          ...omit(subtitle, ['__typename', 'parentOrder']),
          journeyId: journey.id
        },
        titleInput: {
          ...omit(title, ['__typename', 'parentOrder']),
          journeyId: journey.id
        },
        button1Id: buttonBlock1.id,
        button1Input: {
          ...pick(buttonBlock1, ['id', 'parentBlockId', 'label', 'size']),
          journeyId: journey.id,
          variant: buttonBlock1.buttonVariant
        },
        startIcon1Input: {
          ...pick(startIconBlock1, ['id', 'parentBlockId']),
          journeyId: journey.id,
          name: startIconBlock1.iconName
        },
        endIcon1Input: {
          ...pick(endIconBlock1, ['id', 'parentBlockId']),
          journeyId: journey.id
        },
        button1UpdateInput: {
          startIconId: startIconBlock1.id,
          endIconId: endIconBlock1.id
        },
        button2Id: buttonBlock2.id,
        button2Input: {
          ...pick(buttonBlock2, ['id', 'parentBlockId', 'label', 'size']),
          journeyId: journey.id,
          variant: buttonBlock2.buttonVariant
        },
        startIcon2Input: {
          ...pick(startIconBlock2, ['id', 'parentBlockId']),
          journeyId: journey.id,
          name: startIconBlock2.iconName
        },
        endIcon2Input: {
          ...pick(endIconBlock2, ['id', 'parentBlockId']),
          journeyId: journey.id
        },
        button2UpdateInput: {
          startIconId: startIconBlock2.id,
          endIconId: endIconBlock2.id
        },
        button3Id: buttonBlock3.id,
        button3Input: {
          ...pick(buttonBlock3, ['id', 'parentBlockId', 'label', 'size']),
          journeyId: journey.id,
          variant: buttonBlock3.buttonVariant,
          color: buttonBlock3.buttonColor
        },
        startIcon3Input: {
          ...pick(startIconBlock3, ['id', 'parentBlockId']),
          journeyId: journey.id,
          name: startIconBlock3.iconName
        },
        endIcon3Input: {
          ...pick(endIconBlock3, ['id', 'parentBlockId']),
          journeyId: journey.id
        },
        button3UpdateInput: {
          startIconId: startIconBlock3.id,
          endIconId: endIconBlock3.id
        },
        cardId: cardBlock.id,
        cardInput: {
          backgroundColor: cardBlock.backgroundColor
        }
      },
      optimisticResponse: {
        image: imageBlock,
        subtitle,
        title,
        button1: buttonBlock1,
        startIcon1: startIconBlock1,
        endIcon1: endIconBlock1,
        button1Update: {
          ...buttonBlock1,
          startIconId: startIconBlock1.id,
          endIconId: endIconBlock1.id
        },
        button2: buttonBlock2,
        startIcon2: startIconBlock2,
        endIcon2: endIconBlock2,
        button2Update: {
          ...buttonBlock2,
          startIconId: startIconBlock2.id,
          endIconId: endIconBlock2.id
        },
        button3: buttonBlock3,
        startIcon3: startIconBlock3,
        endIcon3: endIconBlock3,
        button3Update: {
          ...buttonBlock3,
          startIconId: startIconBlock3.id,
          endIconId: endIconBlock3.id
        },
        cardBlockUpdate: cardBlock
      },
      update(cache, { data }) {
        if (data != null) {
          const keys = Object.keys(data).filter(
            (key) =>
              key !== 'button1Update' &&
              key !== 'button2Update' &&
              key !== 'button3Update' &&
              key !== 'cardBlockUpdate'
          )
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
            fields: {
              blocks(existingBlockRefs = []) {
                const NEW_BLOCK_FRAGMENT = gql`
                  fragment NewBlock on Block {
                    id
                  }
                `
                return [
                  ...existingBlockRefs,
                  ...keys.map((key) =>
                    cache.writeFragment({
                      data: data[key],
                      fragment: NEW_BLOCK_FRAGMENT
                    })
                  )
                ]
              }
            }
          })
        }
      }
    })
  }

  return (
    <ButtonBase sx={{ borderRadius: 5 }} onClick={handleClick}>
      <Image
        width={128}
        height={195}
        layout="responsive"
        src={cardCtaImage}
        alt="Card CTA Template"
        draggable={false}
        style={{ backgroundColor: 'red' }}
      />
    </ButtonBase>
  )
}

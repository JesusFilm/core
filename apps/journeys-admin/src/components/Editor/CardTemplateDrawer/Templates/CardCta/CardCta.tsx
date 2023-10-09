import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Image from 'next/image'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import { BUTTON_FIELDS } from '@core/journeys/ui/Button/buttonFields'
import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ICON_FIELDS } from '@core/journeys/ui/Icon/iconFields'
import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'

import {
  CardCtaCreate,
  CardCtaCreateVariables
} from '../../../../../../__generated__/CardCtaCreate'
import {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
  IconName,
  TypographyVariant
} from '../../../../../../__generated__/globalTypes'

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

interface CardCtaProps {
  onClick: () => void
}

export function CardCta({ onClick }: CardCtaProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()

  const [cardCtaCreate] = useMutation<CardCtaCreate, CardCtaCreateVariables>(
    CARD_CTA_CREATE
  )

  const handleClick = async (): Promise<void> => {
    const cardId = selectedStep?.children[0].id
    if (journey == null || cardId == null) return
    const button1Id = uuidv4()
    const startIcon1Id = uuidv4()
    const endIcon1Id = uuidv4()
    const button2Id = uuidv4()
    const startIcon2Id = uuidv4()
    const endIcon2Id = uuidv4()
    const button3Id = uuidv4()
    const startIcon3Id = uuidv4()
    const endIcon3Id = uuidv4()
    await cardCtaCreate({
      variables: {
        journeyId: journey.id,
        imageInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          alt: 'photo-1474314881477-04c4aac40a0e',
          blurhash: 'L~NTUYkWM{t7~qs:WBofEMjYt7WB',
          height: 4000,
          src: 'https://images.unsplash.com/photo-1474314881477-04c4aac40a0e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHw3OHx8dGFsa2luZ3xlbnwwfHx8fDE2OTUxNzExNTl8MA&ixlib=rb-4.0.3&q=80&w=1080',
          width: 6000,
          isCover: true
        },
        subtitleInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          content: t("Let's Connect"),
          variant: TypographyVariant.h6
        },
        titleInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          content: t("From 'hello' to heartfelt conversations"),
          variant: TypographyVariant.h3
        },
        button1Id,
        button1Input: {
          id: button1Id,
          journeyId: journey.id,
          parentBlockId: cardId,
          label: t('Chat with us'),
          variant: ButtonVariant.contained,
          size: ButtonSize.large
        },
        startIcon1Input: {
          id: startIcon1Id,
          journeyId: journey.id,
          parentBlockId: button1Id,
          name: IconName.ChatBubbleOutlineRounded
        },
        endIcon1Input: {
          id: endIcon1Id,
          journeyId: journey.id,
          parentBlockId: button1Id
        },
        button1UpdateInput: {
          startIconId: startIcon1Id,
          endIconId: endIcon1Id
        },
        button2Id,
        button2Input: {
          id: button2Id,
          journeyId: journey.id,
          parentBlockId: cardId,
          label: t('Email us'),
          variant: ButtonVariant.contained,
          size: ButtonSize.large
        },
        startIcon2Input: {
          id: startIcon2Id,
          journeyId: journey.id,
          parentBlockId: button2Id,
          name: IconName.SendRounded
        },
        endIcon2Input: {
          id: endIcon2Id,
          journeyId: journey.id,
          parentBlockId: button2Id
        },
        button2UpdateInput: {
          startIconId: startIcon2Id,
          endIconId: endIcon2Id
        },
        button3Id,
        button3Input: {
          id: button3Id,
          journeyId: journey.id,
          parentBlockId: cardId,
          label: t('More about us'),
          variant: ButtonVariant.text,
          color: ButtonColor.secondary,
          size: ButtonSize.large
        },
        startIcon3Input: {
          id: startIcon3Id,
          journeyId: journey.id,
          parentBlockId: button3Id,
          name: IconName.ArrowForwardRounded
        },
        endIcon3Input: {
          id: endIcon3Id,
          journeyId: journey.id,
          parentBlockId: button3Id
        },
        button3UpdateInput: {
          startIconId: startIcon3Id,
          endIconId: endIcon3Id
        },
        cardId,
        cardInput: {
          backgroundColor: '#0E1412'
        }
      },
      update(cache, { data }) {
        if (data != null) {
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
                  cache.writeFragment({
                    data: data.image,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.subtitle,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.title,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.button1Update,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.startIcon1,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.endIcon1,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.button2Update,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.startIcon2,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.endIcon2,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.button3Update,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.startIcon3,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.endIcon3,
                    fragment: NEW_BLOCK_FRAGMENT
                  })
                ]
              }
            }
          })
        }
      }
    })
    onClick()
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <ButtonBase sx={{ borderRadius: 5 }} onClick={handleClick}>
        <Image
          width={128}
          height={195}
          src={cardCtaImage}
          alt="Card CTA Template"
        />
      </ButtonBase>
    </Box>
  )
}

import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Image from 'next/image'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { RADIO_OPTION_FIELDS } from '@core/journeys/ui/RadioOption/radioOptionFields'
import { RADIO_QUESTION_FIELDS } from '@core/journeys/ui/RadioQuestion/radioQuestionFields'
import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'

import {
  CardPollCreate,
  CardPollCreateVariables
} from '../../../../../../__generated__/CardPollCreate'
import {
  TypographyColor,
  TypographyVariant
} from '../../../../../../__generated__/globalTypes'

import cardPollImage from './cardPoll.svg'

export const CARD_POLL_CREATE = gql`
  ${IMAGE_FIELDS}
  ${TYPOGRAPHY_FIELDS}
  ${RADIO_QUESTION_FIELDS}
  ${RADIO_OPTION_FIELDS}
  ${CARD_FIELDS}
  mutation CardPollCreate(
    $imageInput: ImageBlockCreateInput!
    $subtitleInput: TypographyBlockCreateInput!
    $titleInput: TypographyBlockCreateInput!
    $radioQuestionInput: RadioQuestionBlockCreateInput!
    $radioOptionInput1: RadioOptionBlockCreateInput!
    $radioOptionInput2: RadioOptionBlockCreateInput!
    $radioOptionInput3: RadioOptionBlockCreateInput!
    $radioOptionInput4: RadioOptionBlockCreateInput!
    $bodyInput: TypographyBlockCreateInput!
    $journeyId: ID!
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
    radioQuestion: radioQuestionBlockCreate(input: $radioQuestionInput) {
      ...RadioQuestionFields
    }
    radioOption1: radioOptionBlockCreate(input: $radioOptionInput1) {
      ...RadioOptionFields
    }
    radioOption2: radioOptionBlockCreate(input: $radioOptionInput2) {
      ...RadioOptionFields
    }
    radioOption3: radioOptionBlockCreate(input: $radioOptionInput3) {
      ...RadioOptionFields
    }
    radioOption4: radioOptionBlockCreate(input: $radioOptionInput4) {
      ...RadioOptionFields
    }
    body: typographyBlockCreate(input: $bodyInput) {
      ...TypographyFields
    }
    cardBlockUpdate(id: $cardId, journeyId: $journeyId, input: $cardInput) {
      ...CardFields
    }
  }
`

export function CardPoll(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()

  const [cardPollCreate] = useMutation<CardPollCreate, CardPollCreateVariables>(
    CARD_POLL_CREATE
  )

  const handleClick = async (): Promise<void> => {
    const cardId = selectedStep?.children[0].id
    if (journey == null || cardId == null) return
    const radioQuestionId = uuidv4()
    await cardPollCreate({
      variables: {
        imageInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          alt: 'photo-1488048924544-c818a467dacd',
          blurhash: 'LuHo2rtSIUfl.TtRRiogXot6aekC',
          height: 3456,
          src: 'https://images.unsplash.com/photo-1488048924544-c818a467dacd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyMHx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDI2NHww&ixlib=rb-4.0.3&q=80&w=1080',
          width: 5184,
          isCover: true
        },
        subtitleInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          content: t('GOT AN OPINION?'),
          variant: TypographyVariant.h6
        },
        titleInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          content: t("Which of Jesus' teachings challenges you the most?"),
          variant: TypographyVariant.h2
        },
        radioQuestionInput: {
          id: radioQuestionId,
          journeyId: journey.id,
          parentBlockId: cardId
        },
        radioOptionInput1: {
          journeyId: journey.id,
          parentBlockId: radioQuestionId,
          label: t('Turning the other cheek')
        },
        radioOptionInput2: {
          journeyId: journey.id,
          parentBlockId: radioQuestionId,
          label: t('Loving your enemies')
        },
        radioOptionInput3: {
          journeyId: journey.id,
          parentBlockId: radioQuestionId,
          label: t('Not worrying about tomorrow')
        },
        radioOptionInput4: {
          journeyId: journey.id,
          parentBlockId: radioQuestionId,
          label: t('Seeking first the kingdom of God')
        },
        bodyInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          content: t('↑ Select an answer to continue'),
          variant: TypographyVariant.caption,
          color: TypographyColor.secondary
        },
        journeyId: journey.id,
        cardId,
        cardInput: { fullscreen: true }
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
                    data: data.radioQuestion,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.radioOption1,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.radioOption2,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.radioOption3,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.radioOption4,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.body,
                    fragment: NEW_BLOCK_FRAGMENT
                  })
                ]
              }
            }
          })
        }
      }
    })
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Image
        width={128}
        height={195}
        src={cardPollImage}
        alt="Card Poll Template"
        onClick={handleClick}
        style={{
          cursor: 'pointer'
        }}
      />
    </Box>
  )
}

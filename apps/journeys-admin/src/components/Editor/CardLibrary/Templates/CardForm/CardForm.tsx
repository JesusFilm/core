import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Image from 'next/image'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import { v4 as uuidv4 } from 'uuid'

import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { ICON_FIELDS } from '@core/journeys/ui/Icon/iconFields'
import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TEXT_RESPONSE_FIELDS } from '@core/journeys/ui/TextResponse/textResponseFields'
import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'

import {
  CardFormCreate,
  CardFormCreateVariables
} from '../../../../../../__generated__/CardFormCreate'
import {
  IconName,
  TypographyColor,
  TypographyVariant
} from '../../../../../../__generated__/globalTypes'

import cardFormImage from './cardForm.svg'

export const CARD_FORM_CREATE = gql`
  ${IMAGE_FIELDS}
  ${TYPOGRAPHY_FIELDS}
  ${TEXT_RESPONSE_FIELDS}
  ${ICON_FIELDS}
  ${CARD_FIELDS}
  mutation CardFormCreate(
    $imageInput: ImageBlockCreateInput!
    $subtitleInput: TypographyBlockCreateInput!
    $titleInput: TypographyBlockCreateInput!
    $textResponseInput: TextResponseBlockCreateInput!
    $submitIconInput: IconBlockCreateInput!
    $textResponseId: ID!
    $textResponseUpdateInput: TextResponseBlockUpdateInput!
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
    textResponse: textResponseBlockCreate(input: $textResponseInput) {
      ...TextResponseFields
    }
    submitIcon: iconBlockCreate(input: $submitIconInput) {
      ...IconFields
    }
    textResponseBlockUpdate(
      id: $textResponseId
      journeyId: $journeyId
      input: $textResponseUpdateInput
    ) {
      ...TextResponseFields
    }
    body: typographyBlockCreate(input: $bodyInput) {
      ...TypographyFields
    }
    cardBlockUpdate(id: $cardId, journeyId: $journeyId, input: $cardInput) {
      ...CardFields
    }
  }
`

interface CardFormProps {
  onClick: () => void
}

export function CardForm({ onClick }: CardFormProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()

  const [cardFormCreate] = useMutation<CardFormCreate, CardFormCreateVariables>(
    CARD_FORM_CREATE
  )

  const handleClick = async (): Promise<void> => {
    const cardId = selectedStep?.children[0].id
    if (journey == null || cardId == null) return
    const textResponseId = uuidv4()
    const submitIconId = uuidv4()
    await cardFormCreate({
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
          content: t('Prayer Request'),
          variant: TypographyVariant.h6
        },
        titleInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          content: t('How can we pray for you?'),
          variant: TypographyVariant.h1
        },
        textResponseInput: {
          id: textResponseId,
          journeyId: journey.id,
          parentBlockId: cardId,
          label: t('Your answer here'),
          submitLabel: t('Submit')
        },
        submitIconInput: {
          id: submitIconId,
          journeyId: journey.id,
          parentBlockId: textResponseId,
          name: IconName.ArrowForwardRounded
        },
        textResponseId,
        textResponseUpdateInput: {
          submitIconId
        },
        bodyInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          content: t(
            "Each day, we pray for those in our city. We'd be grateful to include your personal needs."
          ),
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
                    data: data.textResponseBlockUpdate,
                    fragment: NEW_BLOCK_FRAGMENT
                  }),
                  cache.writeFragment({
                    data: data.submitIcon,
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
    onClick()
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Image
        width={128}
        height={195}
        src={cardFormImage}
        alt="Card Form Template"
        onClick={handleClick}
        style={{
          cursor: 'pointer'
        }}
      />
    </Box>
  )
}

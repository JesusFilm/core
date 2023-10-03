import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import ButtonBase from '@mui/material/ButtonBase'
import Image from 'next/image'
import { ReactElement } from 'react'
import { useTranslation } from 'react-i18next'

import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'

import {
  CardQuoteCreate,
  CardQuoteCreateVariables
} from '../../../../../../__generated__/CardQuoteCreate'
import {
  TypographyColor,
  TypographyVariant
} from '../../../../../../__generated__/globalTypes'

import cardQuoteImage from './cardQuote.svg'

export const CARD_QUOTE_CREATE = gql`
  ${IMAGE_FIELDS}
  ${TYPOGRAPHY_FIELDS}
  ${CARD_FIELDS}
  mutation CardQuoteCreate(
    $imageInput: ImageBlockCreateInput!
    $subtitleInput: TypographyBlockCreateInput!
    $titleInput: TypographyBlockCreateInput!
    $bodyInput: TypographyBlockCreateInput!
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
    body: typographyBlockCreate(input: $bodyInput) {
      ...TypographyFields
    }
    cardBlockUpdate(id: $cardId, input: $cardInput) {
      ...CardFields
    }
  }
`

interface CardQuoteProps {
  onClick: () => void
}

export function CardQuote({ onClick }: CardQuoteProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()

  const [cardQuoteCreate] = useMutation<
    CardQuoteCreate,
    CardQuoteCreateVariables
  >(CARD_QUOTE_CREATE)

  const handleClick = async (): Promise<void> => {
    const cardId = selectedStep?.children[0].id
    if (journey == null || cardId == null) return
    await cardQuoteCreate({
      variables: {
        imageInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          alt: 'photo-1552423310-ba74b8de5e6f',
          blurhash: 'L99*0;01IAtk5R%MRie;t8D%-pa$',
          height: 3396,
          src: 'https://images.unsplash.com/photo-1552423310-ba74b8de5e6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyOXx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDg5M3ww&ixlib=rb-4.0.3&q=80&w=1080',
          width: 5094,
          isCover: true
        },
        subtitleInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          content: t('The Bible Says:'),
          variant: TypographyVariant.h6
        },
        titleInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          content: t(
            'Blessed are the peacemakers, for they shall be called sons of God.'
          ),
          variant: TypographyVariant.h3
        },
        bodyInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          content: t('– Jesus Christ'),
          variant: TypographyVariant.body1,
          color: TypographyColor.secondary
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
      <ButtonBase sx={{ borderRadius: 5 }} onClick={handleClick}>
        <Image
          width={128}
          height={195}
          src={cardQuoteImage}
          alt="Card Quote Template"
        />
      </ButtonBase>
    </Box>
  )
}

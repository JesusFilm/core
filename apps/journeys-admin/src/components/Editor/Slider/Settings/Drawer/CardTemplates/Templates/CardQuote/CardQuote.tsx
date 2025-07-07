import { Reference, gql, useMutation } from '@apollo/client'
import ButtonBase from '@mui/material/ButtonBase'
import omit from 'lodash/omit'
import Image from 'next/image'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { BLOCK_FIELDS } from '@core/journeys/ui/block/blockFields'
import { CARD_FIELDS } from '@core/journeys/ui/Card/cardFields'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TYPOGRAPHY_FIELDS } from '@core/journeys/ui/Typography/typographyFields'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_TypographyBlock as TypographyBlock
} from '../../../../../../../../../__generated__/BlockFields'
import {
  CardQuoteCreate,
  CardQuoteCreateVariables
} from '../../../../../../../../../__generated__/CardQuoteCreate'
import {
  CardQuoteDelete,
  CardQuoteDeleteVariables
} from '../../../../../../../../../__generated__/CardQuoteDelete'
import {
  CardQuoteRestore,
  CardQuoteRestoreVariables
} from '../../../../../../../../../__generated__/CardQuoteRestore'
import {
  ThemeMode,
  ThemeName,
  TypographyColor,
  TypographyVariant
} from '../../../../../../../../../__generated__/globalTypes'

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

export const CARD_QUOTE_DELETE = gql`
  ${CARD_FIELDS}
  mutation CardQuoteDelete(
    $imageId: ID!
    $subtitleId: ID!
    $titleId: ID!
    $bodyId: ID!
    $cardId: ID!
    $cardInput: CardBlockUpdateInput!
  ) {
    cardBlockUpdate(id: $cardId, input: $cardInput) {
      ...CardFields
    }
    body: blockDelete(id: $bodyId) {
      id
      parentOrder
    }
    title: blockDelete(id: $titleId) {
      id
      parentOrder
    }
    subtitle: blockDelete(id: $subtitleId) {
      id
      parentOrder
    }
    image: blockDelete(id: $imageId) {
      id
      parentOrder
    }
  }
`

export const CARD_QUOTE_RESTORE = gql`
  ${BLOCK_FIELDS}
  ${CARD_FIELDS}
  mutation CardQuoteRestore(
    $imageId: ID!
    $subtitleId: ID!
    $titleId: ID!
    $bodyId: ID!
    $cardId: ID!
    $cardInput: CardBlockUpdateInput!
  ) {
    image: blockRestore(id: $imageId) {
      ...BlockFields
    }
    subtitle: blockRestore(id: $subtitleId) {
      ...BlockFields
    }
    title: blockRestore(id: $titleId) {
      ...BlockFields
    }
    body: blockRestore(id: $bodyId) {
      ...BlockFields
    }
    cardBlockUpdate(id: $cardId, input: $cardInput) {
      ...CardFields
    }
  }
`

export function CardQuote(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()
  const { add } = useCommand()

  const [cardQuoteCreate] = useMutation<
    CardQuoteCreate,
    CardQuoteCreateVariables
  >(CARD_QUOTE_CREATE)

  const [cardQuoteDelete] = useMutation<
    CardQuoteDelete,
    CardQuoteDeleteVariables
  >(CARD_QUOTE_DELETE)

  const [cardQuoteRestore] = useMutation<
    CardQuoteRestore,
    CardQuoteRestoreVariables
  >(CARD_QUOTE_RESTORE)

  function handleClick(): void {
    const cardId = selectedStep?.children[0].id
    if (journey == null || cardId == null || selectedStep == null) return

    const imageBlock = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: null,
      src: 'https://images.unsplash.com/photo-1552423310-ba74b8de5e6f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0MDYwNDN8MHwxfHNlYXJjaHwyOXx8aXNyYWVsfGVufDB8fHx8MTY5NTE3MDg5M3ww&ixlib=rb-4.0.3&q=80&w=1080',
      alt: 'photo-1552423310-ba74b8de5e6f',
      width: 5094,
      height: 3396,
      blurhash: 'L99*0;01IAtk5R%MRie;t8D%-pa$',
      __typename: 'ImageBlock',
      scale: null,
      focalLeft: 50,
      focalTop: 50
    } satisfies ImageBlock

    const subtitle = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 0,
      align: null,
      color: null,
      content: t('The Bible Says:'),
      variant: TypographyVariant.h6,
      __typename: 'TypographyBlock',
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      }
    } satisfies TypographyBlock

    const title = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 1,
      align: null,
      color: null,
      content: t(
        'Blessed are the peacemakers, for they shall be called sons of God.'
      ),
      variant: TypographyVariant.h3,
      __typename: 'TypographyBlock',
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      }
    } satisfies TypographyBlock

    const body = {
      id: uuidv4(),
      parentBlockId: cardId,
      parentOrder: 2,
      align: null,
      color: TypographyColor.secondary,
      content: t('– Jesus Christ'),
      variant: TypographyVariant.body1,
      __typename: 'TypographyBlock',
      settings: {
        __typename: 'TypographyBlockSettings',
        color: null
      }
    } satisfies TypographyBlock

    const cardBlock = {
      id: cardId,
      parentBlockId: selectedStep.id,
      parentOrder: 0,
      backgroundColor: '#0E1412',
      coverBlockId: imageBlock.id,
      themeMode: ThemeMode.dark,
      themeName: ThemeName.base,
      fullscreen: false,
      backdropBlur: null,
      __typename: 'CardBlock'
    } satisfies CardBlock

    const createdBlocks = [imageBlock, subtitle, title, body]

    add({
      parameters: { execute: {}, undo: {} },
      execute() {
        void cardQuoteCreate({
          variables: {
            imageInput: {
              ...omit(imageBlock, ['__typename', 'parentOrder']),
              journeyId: journey.id,
              isCover: true
            },
            subtitleInput: {
              ...omit(
                {
                  ...subtitle,
                  settings: { color: subtitle.settings?.color }
                },
                ['__typename', 'parentOrder']
              ),
              journeyId: journey.id,
              variant: TypographyVariant.h6
            },
            titleInput: {
              ...omit(
                {
                  ...title,
                  settings: { color: title.settings?.color }
                },
                ['__typename', 'parentOrder']
              ),
              journeyId: journey.id
            },
            bodyInput: {
              ...omit(
                {
                  ...body,
                  settings: { color: body.settings?.color }
                },
                ['__typename', 'parentOrder']
              ),
              journeyId: journey.id
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
            body,
            cardBlockUpdate: cardBlock
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
                    const keys = Object.keys(data).filter(
                      (key) => key !== 'cardBlockUpdate'
                    )
                    return [
                      ...existingBlockRefs,
                      ...keys.map((key) => {
                        return cache.writeFragment({
                          data: data[key],
                          fragment: NEW_BLOCK_FRAGMENT
                        })
                      })
                    ]
                  }
                }
              })
            }
          }
        })
      },
      undo() {
        void cardQuoteDelete({
          variables: {
            imageId: imageBlock.id,
            subtitleId: subtitle.id,
            titleId: title.id,
            bodyId: body.id,
            cardId: cardBlock.id,
            cardInput: {
              backgroundColor: null
            }
          },
          optimisticResponse: {
            image: [],
            subtitle: [],
            title: [],
            body: [],
            cardBlockUpdate: { ...cardBlock, backgroundColor: null }
          },
          update(cache, { data }) {
            if (data == null) return
            createdBlocks.forEach((block) => {
              cache.modify({
                id: cache.identify({ __typename: 'Journey', id: journey.id }),
                fields: {
                  blocks(existingBlockRefs: Reference[], { readField }) {
                    return existingBlockRefs.filter(
                      (ref) => readField('id', ref) !== block.id
                    )
                  }
                }
              })
              cache.evict({
                id: cache.identify({
                  __typename: block.__typename,
                  id: block.id
                })
              })
              cache.gc()
            })
          }
        })
      },
      redo() {
        void cardQuoteRestore({
          variables: {
            imageId: imageBlock.id,
            subtitleId: subtitle.id,
            titleId: title.id,
            bodyId: body.id,
            cardId: cardBlock.id,
            cardInput: {
              backgroundColor: cardBlock.backgroundColor
            }
          },
          optimisticResponse: {
            image: [imageBlock],
            subtitle: [subtitle],
            title: [title],
            body: [body],
            cardBlockUpdate: cardBlock
          },
          update(cache, { data }) {
            if (data == null) return
            const keys = Object.keys(data).filter(
              (key) => key !== 'cardBlockUpdate'
            )
            keys.forEach((key) => {
              data[key].forEach((block) => {
                cache.modify({
                  id: cache.identify({ __typename: 'Journey', id: journey.id }),
                  fields: {
                    blocks(existingBlockRefs: Reference[], { readField }) {
                      const NEW_BLOCK_FRAGMENT = gql`
                        fragment NewBlock on Block {
                          id
                        }
                      `
                      if (
                        existingBlockRefs.some(
                          (ref) => readField('id', ref) === block.id
                        )
                      ) {
                        return existingBlockRefs
                      }
                      return [
                        ...existingBlockRefs,
                        cache.writeFragment({
                          data: block,
                          fragment: NEW_BLOCK_FRAGMENT
                        })
                      ]
                    }
                  }
                })
              })
            })
          }
        })
      }
    })
  }

  return (
    <ButtonBase sx={{ borderRadius: 5 }} onClick={handleClick}>
      <Image
        width={128}
        height={195}
        layout="responsive"
        src={cardQuoteImage}
        alt="Card Quote Template"
        draggable={false}
      />
    </ButtonBase>
  )
}

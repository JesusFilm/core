import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import Image3Icon from '@core/shared/ui/icons/Image3'

import { BlockFields_CardBlock as CardBlock } from '../../../../../../../../__generated__/BlockFields'
import { ImageBlockCreate } from '../../../../../../../../__generated__/ImageBlockCreate'
import { Button } from '../Button'

export const IMAGE_BLOCK_CREATE = gql`
  ${IMAGE_FIELDS}
  mutation ImageBlockCreate($input: ImageBlockCreateInput!) {
    imageBlockCreate(input: $input) {
      id
      parentBlockId
      parentOrder
      ...ImageFields
    }
  }
`

export function NewImageButton(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [imageBlockCreate, { loading }] =
    useMutation<ImageBlockCreate>(IMAGE_BLOCK_CREATE)
  const { journey } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()

  const handleClick = async (): Promise<void> => {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    if (card != null && journey != null) {
      const { data } = await imageBlockCreate({
        variables: {
          input: {
            journeyId: journey.id,
            parentBlockId: card.id,
            src: null,
            alt: 'Default Image Icon'
          }
        },
        update(cache, { data }) {
          if (data?.imageBlockCreate != null) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journey.id }),
              fields: {
                blocks(existingBlockRefs = []) {
                  const newBlockRef = cache.writeFragment({
                    data: data.imageBlockCreate,
                    fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                  })
                  return [...existingBlockRefs, newBlockRef]
                }
              }
            })
          }
        }
      })
      if (data?.imageBlockCreate != null) {
        dispatch({
          type: 'SetSelectedBlockByIdAction',
          selectedBlockId: data.imageBlockCreate.id
        })
      }
    }
  }

  return (
    <Button
      icon={<Image3Icon />}
      value={t('Image')}
      onClick={handleClick}
      testId="NewImageButton"
      disabled={loading}
    />
  )
}

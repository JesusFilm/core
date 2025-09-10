import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { v4 as uuid } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Image3Icon from '@core/shared/ui/icons/Image3'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock
} from '../../../../../../../../__generated__/BlockFields'
import { ImageBlockCreate } from '../../../../../../../../__generated__/ImageBlockCreate'
import { blockCreateUpdate } from '../../../../../utils/blockCreateUpdate'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand'
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
    state: { selectedStep }
  } = useEditor()
  const { addBlock } = useBlockCreateCommand()

  function handleClick(): void {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    if (card == null || journey == null) return

    const imageBlock: ImageBlock = {
      id: uuid(),
      parentBlockId: card.id,
      parentOrder: card.children.length ?? 0,
      src: null,
      alt: t('Default Image Icon'),
      width: 0,
      height: 0,
      blurhash: '',
      __typename: 'ImageBlock',
      scale: null,
      focalLeft: 50,
      focalTop: 50
    }
    addBlock({
      block: imageBlock,
      execute() {
        void imageBlockCreate({
          variables: {
            input: {
              id: imageBlock.id,
              journeyId: journey.id,
              parentBlockId: imageBlock.parentBlockId,
              src: imageBlock.src,
              alt: imageBlock.alt
            }
          },
          optimisticResponse: { imageBlockCreate: imageBlock },
          update(cache, { data }) {
            blockCreateUpdate(cache, journey?.id, data?.imageBlockCreate)
          }
        })
      }
    })
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

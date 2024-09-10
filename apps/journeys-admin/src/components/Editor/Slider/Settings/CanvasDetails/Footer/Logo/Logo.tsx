import { gql, useMutation } from '@apollo/client'
import Stack from '@mui/material/Stack'
import pick from 'lodash/pick'
import { useTranslation } from 'next-i18next'
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Type3 from '@core/shared/ui/icons/Type3'

import { BlockFields_ImageBlock as ImageBlock } from '../../../../../../../../__generated__/BlockFields'
import {
  ImageBlockCreateInput,
  ImageBlockUpdateInput,
  JourneyUpdateInput
} from '../../../../../../../../__generated__/globalTypes'
import {
  ImageBlockUpdate,
  ImageBlockUpdateVariables
} from '../../../../../../../../__generated__/ImageBlockUpdate'
import {
  LogoBlockCreate,
  LogoBlockCreateVariables
} from '../../../../../../../../__generated__/LogoBlockCreate'
import { blockCreateUpdate } from '../../../../../utils/blockCreateUpdate'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand'
import { ImageSource } from '../../../Drawer/ImageSource'
import { Accordion } from '../../Properties/Accordion'
import { IMAGE_BLOCK_UPDATE } from '../../Properties/blocks/Image/Options/ImageOptions'

export const LOGO_BLOCK_CREATE = gql`
  ${IMAGE_FIELDS}
  mutation LogoBlockCreate(
    $id: ID!
    $imageBlockCreateInput: ImageBlockCreateInput!
    $journeyUpdateInput: JourneyUpdateInput!
  ) {
    imageBlockCreate(input: $imageBlockCreateInput) {
      ...ImageFields
    }
    journeyUpdate(id: $id, input: $journeyUpdateInput) {
      id
      logoImageBlock {
        id
      }
    }
  }
`

export function Logo(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { journey } = useJourney()
  const { add } = useCommand()
  const { addBlock } = useBlockCreateCommand()

  const [logoBlockCreate] = useMutation<
    LogoBlockCreate,
    LogoBlockCreateVariables
  >(LOGO_BLOCK_CREATE)
  const [imageBlockUpdate] = useMutation<
    ImageBlockUpdate,
    ImageBlockUpdateVariables
  >(IMAGE_BLOCK_UPDATE)

  const imageBlock = journey?.logoImageBlock

  function createImageBlock(input: ImageBlockUpdateInput): void {
    if (journey == null) return

    const imageBlockCreateInput: ImageBlockCreateInput = {
      ...input,
      id: uuidv4(),
      journeyId: journey.id,
      parentBlockId: null,
      alt: input.alt ?? 'journey logo',
      scale: 1
    }

    const journeyUpdateInput: JourneyUpdateInput = {
      logoImageBlockId: imageBlockCreateInput.id
    }

    const newImageBlock: ImageBlock = {
      __typename: 'ImageBlock',
      id: imageBlockCreateInput.id ?? '',
      parentBlockId: null,
      parentOrder: null,
      src: imageBlockCreateInput.src ?? '',
      alt: imageBlockCreateInput.alt ?? '',
      width: imageBlockCreateInput.width ?? 0,
      height: imageBlockCreateInput.height ?? 0,
      blurhash: imageBlockCreateInput.blurhash ?? ''
    }

    addBlock({
      block: newImageBlock,
      execute() {
        void logoBlockCreate({
          variables: {
            id: journey.id,
            imageBlockCreateInput,
            journeyUpdateInput
          },
          optimisticResponse: {
            imageBlockCreate: newImageBlock,
            journeyUpdate: {
              __typename: 'Journey',
              id: journey.id,
              logoImageBlock: newImageBlock
            }
          },
          update(cache, { data }) {
            blockCreateUpdate(cache, journey.id, data?.imageBlockCreate)
          }
        })
      }
    })
  }

  function updateImageBlock(input: ImageBlockUpdateInput): void {
    if (imageBlock == null) return

    const block: ImageBlock = {
      ...imageBlock,
      ...input,
      alt: input.alt ?? imageBlock.alt,
      blurhash: input.blurhash ?? imageBlock.blurhash,
      height: input.height ?? imageBlock.height,
      width: input.width ?? imageBlock.width
    }

    add({
      parameters: {
        execute: block,
        undo: imageBlock
      },
      execute(block) {
        void imageBlockUpdate({
          variables: {
            id: imageBlock.id,
            input: pick(block, Object.keys(input))
          },
          optimisticResponse: {
            imageBlockUpdate: block
          }
        })
      }
    })
  }

  function handleChange(input: ImageBlockUpdateInput): void {
    if (imageBlock == null) {
      createImageBlock(input)
    } else {
      updateImageBlock(input)
    }
  }

  async function deleteImageBlock(): Promise<void> {
    await updateImageBlock({ src: null, alt: '' })
  }

  return (
    <Accordion id="logo" icon={<Type3 />} name={t('Logo')}>
      <Stack sx={{ p: 4, pt: 2 }} data-testid="Logo">
        <ImageSource
          selectedBlock={imageBlock}
          onChange={async (input) => handleChange(input)}
          onDelete={deleteImageBlock}
        />
      </Stack>
    </Accordion>
  )
}

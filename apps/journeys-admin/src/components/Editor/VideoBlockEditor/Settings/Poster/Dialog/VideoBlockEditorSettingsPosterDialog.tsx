import { gql, useMutation } from '@apollo/client'
import { Close } from '@mui/icons-material'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography
} from '@mui/material'
import { ReactElement } from 'react'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../__generated__/GetJourney'
import { BlockDeleteForPosterImage } from '../../../../../../../__generated__/BlockDeleteForPosterImage'
import { PosterImageBlockCreate } from '../../../../../../../__generated__/PosterImageBlockCreate'
import { PosterImageBlockUpdate } from '../../../../../../../__generated__/PosterImageBlockUpdate'
import { VideoBlockPosterImageUpdate } from '../../../../../../../__generated__/VideoBlockPosterImageUpdate'
import { useJourney } from '../../../../../../libs/context'
import { ImageBlockEditor } from '../../../../ImageBlockEditor'
import { blockDeleteUpdate } from '../../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'

export const BLOCK_DELETE_FOR_POSTER_IMAGE = gql`
  mutation BlockDeleteForPosterImage(
    $id: ID!
    $parentBlockId: ID!
    $journeyId: ID!
  ) {
    blockDelete(id: $id, parentBlockId: $parentBlockId, journeyId: $journeyId) {
      id
      parentOrder
    }
  }
`

export const VIDEO_BLOCK_POSTER_IMAGE_UPDATE = gql`
  mutation VideoBlockPosterImageUpdate(
    $id: ID!
    $journeyId: ID!
    $input: VideoBlockUpdateInput!
  ) {
    videoBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      posterBlockId
    }
  }
`

export const POSTER_IMAGE_BLOCK_CREATE = gql`
  mutation PosterImageBlockCreate($input: ImageBlockCreateInput!) {
    imageBlockCreate(input: $input) {
      id
      src
      alt
      parentBlockId
      width
      height
      parentOrder
      blurhash
    }
  }
`

export const POSTER_IMAGE_BLOCK_UPDATE = gql`
  mutation PosterImageBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ImageBlockUpdateInput!
  ) {
    imageBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      src
      alt
      width
      height
      parentOrder
      blurhash
    }
  }
`

interface VideoBlockEditorSettingsPosterDialogProps {
  selectedBlock: ImageBlock | null
  parentBlockId: string | undefined
  open: boolean
  onClose: () => void
}

export function VideoBlockEditorSettingsPosterDialog({
  selectedBlock,
  parentBlockId,
  open,
  onClose
}: VideoBlockEditorSettingsPosterDialogProps): ReactElement {
  const { id: journeyId } = useJourney()
  const [blockDelete, { error: blockDeleteError }] =
    useMutation<BlockDeleteForPosterImage>(BLOCK_DELETE_FOR_POSTER_IMAGE)
  const [videoBlockUpdate, { error: videoBlockUpdateError }] =
    useMutation<VideoBlockPosterImageUpdate>(VIDEO_BLOCK_POSTER_IMAGE_UPDATE)
  const [imageBlockCreate, { error: imageBlockCreateError }] =
    useMutation<PosterImageBlockCreate>(POSTER_IMAGE_BLOCK_CREATE)
  const [imageBlockUpdate, { error: imageBlockUpdateError }] =
    useMutation<PosterImageBlockUpdate>(POSTER_IMAGE_BLOCK_UPDATE)

  const deleteCoverBlock = async (): Promise<void> => {
    if (selectedBlock == null || parentBlockId == null) return

    await blockDelete({
      variables: {
        id: selectedBlock.id,
        parentBlockId: selectedBlock.parentBlockId,
        journeyId: journeyId
      },
      update(cache, { data }) {
        blockDeleteUpdate(selectedBlock, data?.blockDelete, cache, journeyId)
      }
    })
    if (blockDeleteError != null) return

    await videoBlockUpdate({
      variables: {
        id: parentBlockId,
        journeyId: journeyId,
        input: {
          posterBlockId: null
        }
      },
      optimisticResponse: {
        videoBlockUpdate: {
          id: parentBlockId,
          posterBlockId: null,
          __typename: 'VideoBlock'
        }
      }
    })
  }

  const createImageBlock = async (block): Promise<boolean> => {
    if (parentBlockId == null) return false

    const { data } = await imageBlockCreate({
      variables: {
        input: {
          journeyId: journeyId,
          parentBlockId: parentBlockId,
          src: block.src,
          alt: block.alt
        }
      },
      update(cache, { data }) {
        if (data?.imageBlockCreate != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journeyId }),
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

    if (imageBlockCreateError != null) return false

    await videoBlockUpdate({
      variables: {
        id: parentBlockId,
        journeyId: journeyId,
        input: {
          posterBlockId: data?.imageBlockCreate.id ?? null
        }
      },
      optimisticResponse: {
        videoBlockUpdate: {
          id: parentBlockId,
          posterBlockId: data?.imageBlockCreate.id ?? null,
          __typename: 'VideoBlock'
        }
      }
    })
    return videoBlockUpdateError == null
  }

  const updateImageBlock = async (block: ImageBlock): Promise<boolean> => {
    if (selectedBlock == null) return false

    await imageBlockUpdate({
      variables: {
        id: selectedBlock.id,
        journeyId: journeyId,
        input: {
          src: block.src,
          alt: block.alt
        }
      }
    })
    return imageBlockUpdateError == null
  }

  const handleChange = async (block: ImageBlock): Promise<void> => {
    if (block.src === '') return

    if (selectedBlock == null) {
      await createImageBlock(block)
    } else {
      await updateImageBlock(block)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="poster-dialog-title">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between">
          <Typography
            id="poster-dialog-title"
            variant="subtitle1"
            component="div"
            justifyContent="center"
            paddingTop={2}
          >
            Cover Image
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <ImageBlockEditor
          selectedBlock={selectedBlock}
          onChange={handleChange}
          onDelete={deleteCoverBlock}
        />
      </DialogContent>
    </Dialog>
  )
}

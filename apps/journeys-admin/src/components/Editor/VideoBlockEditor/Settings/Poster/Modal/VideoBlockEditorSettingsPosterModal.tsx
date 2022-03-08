import { gql, useMutation } from '@apollo/client'
import { Close } from '@mui/icons-material'
import { Box, Divider, IconButton, Stack, Typography } from '@mui/material'
import { reject } from 'lodash'
import { ReactElement } from 'react'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../../__generated__/GetJourney'
import { BlockDeleteForPosterImage } from '../../../../../../../__generated__/BlockDeleteForPosterImage'
import { PosterImageBlockCreate } from '../../../../../../../__generated__/PosterImageBlockCreate'
import { PosterImageBlockUpdate } from '../../../../../../../__generated__/PosterImageBlockUpdate'
import { VideoBlockPosterImageUpdate } from '../../../../../../../__generated__/VideoBlockPosterImageUpdate'
import { useJourney } from '../../../../../../libs/context'
import { ImageBlockEditor } from '../../../../ImageBlockEditor'

export const BLOCK_DELETE_FOR_POSTER_IMAGE = gql`
  mutation BlockDeleteForPosterImage(
    $id: ID!
    $parentBlockId: ID!
    $journeyId: ID!
  ) {
    blockDelete(id: $id, parentBlockId: $parentBlockId, journeyId: $journeyId) {
      id
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

interface VideoBlockEditorSettingsPosterModalProps {
  selectedBlock: ImageBlock | null
  parentBlockId: string | undefined
  onClose: () => void
}

export function VideoBlockEditorSettingsPosterModal({
  selectedBlock,
  parentBlockId,
  onClose
}: VideoBlockEditorSettingsPosterModalProps): ReactElement {
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
        if (data?.blockDelete != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journeyId }),
            fields: {
              blocks(existingBlockRefs = []) {
                const blockIds = data.blockDelete.map(
                  (deletedBlock) =>
                    `${deletedBlock.__typename}:${deletedBlock.id}`
                )
                return reject(existingBlockRefs, (block) => {
                  return blockIds.includes(block.__ref)
                })
              }
            }
          })
        }
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
    <Box
      sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 350,
        bgcolor: 'background.paper',
        border: '1px solid #000',
        boxShadow: 24,
        paddingBottom: 4
      }}
    >
      <Box sx={{ px: 6, py: 2 }}>
        <Stack direction="row" justifyContent="space-between">
          <Typography
            id="modal-modal-title"
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
      </Box>
      <Divider />
      <ImageBlockEditor
        selectedBlock={selectedBlock}
        onChange={handleChange}
        onDelete={deleteCoverBlock}
      />
    </Box>
  )
}

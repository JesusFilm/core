import { Create, Image as ImageIcon } from '@mui/icons-material'
import { Box, IconButton, Modal, Stack, Typography } from '@mui/material'
import Image from 'next/image'
import { ReactElement, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { reject } from 'lodash'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../__generated__/GetJourney'
import { ImageEditor } from '../../../ImageBlockEditor/ImageEditor'
import { useJourney } from '../../../../../libs/context'
import { BlockDeleteForPosterImage } from '../../../../../../__generated__/BlockDeleteForPosterImage'
import { VideoBlockPosterImageUpdate } from '../../../../../../__generated__/VideoBlockPosterImageUpdate'
import { PosterImageBlockCreate } from '../../../../../../__generated__/PosterImageBlockCreate'
import { PosterImageBlockUpdate } from '../../../../../../__generated__/PosterImageBlockUpdate'

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

interface BackgroundMediaCoverImageProps {
  selectedBlock: ImageBlock | null
  parentBlockId: string
}

export function VideoBlockEditorSettingsPoster({
  selectedBlock,
  parentBlockId
}: BackgroundMediaCoverImageProps): ReactElement {
  const { id: journeyId } = useJourney()
  const [blockDelete] = useMutation<BlockDeleteForPosterImage>(
    BLOCK_DELETE_FOR_POSTER_IMAGE
  )
  const [videoBlockUpdate, { error: videoBlockUpdateError }] =
    useMutation<VideoBlockPosterImageUpdate>(VIDEO_BLOCK_POSTER_IMAGE_UPDATE)
  const [imageBlockCreate, { error: imageBlockCreateError }] =
    useMutation<PosterImageBlockCreate>(POSTER_IMAGE_BLOCK_CREATE)
  const [imageBlockUpdate, { error: imageBlockUpdateError }] =
    useMutation<PosterImageBlockUpdate>(POSTER_IMAGE_BLOCK_UPDATE)

  const [open, setOpen] = useState(false)
  const handleOpen = (): void => setOpen(true)
  const handleClose = (): void => setOpen(false)

  const deleteCoverBlock = async (): Promise<void> => {
    if (selectedBlock == null) return

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
  }

  const createImageBlock = async (block): Promise<boolean> => {
    if (selectedBlock == null) return false

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
    <Stack direction="row" justifyContent="space-between">
      <Stack direction="column" justifyContent="center">
        <Typography variant="subtitle2">Cover Image</Typography>
        <Typography variant="caption">
          Appears while video is loading
        </Typography>
      </Stack>
      <Box
        width={95}
        height={62}
        sx={{ backgroundColor: 'rgba(0, 0, 0, 0.06)', py: 1 }}
        borderRadius={2}
      >
        <Stack direction="row" justifyContent="space-around">
          <div
            style={{
              overflow: 'hidden',
              borderRadius: 8,
              height: 55,
              width: 55
            }}
          >
            {selectedBlock?.src != null && (
              <Image
                src={selectedBlock.src}
                alt={selectedBlock.alt}
                width={55}
                height={55}
              ></Image>
            )}
            {selectedBlock?.src == null && (
              <Box
                borderRadius={2}
                sx={{
                  width: 55,
                  height: 55,
                  verticalAlign: 'center'
                }}
                justifyContent="center"
              >
                <ImageIcon sx={{ marginTop: 4, marginLeft: 4 }}></ImageIcon>
              </Box>
            )}
          </div>
          <Stack
            direction="column"
            justifyContent="center"
            sx={{ paddingRight: 1 }}
          >
            <IconButton onClick={handleOpen}>
              <Create color="primary"></Create>
            </IconButton>
            <Modal open={open} onClose={handleClose}>
              <ImageEditor
                selectedBlock={selectedBlock}
                onChange={handleChange}
                onDelete={deleteCoverBlock}
              />
            </Modal>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}

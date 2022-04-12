import { ReactElement, useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import ImageIcon from '@mui/icons-material/Image'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import { useJourney } from '../../../../../libs/context'
import { Dialog } from '../../../../Dialog'
import { ImageBlockEditor } from '../../../ImageBlockEditor'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../__generated__/GetJourney'
import { blockDeleteUpdate } from '../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { BlockDeletePrimaryImage } from '../../../../../../__generated__/BlockDeletePrimaryImage'
import { PrimaryImageBlockCreate } from '../../../../../../__generated__/PrimaryImageBlockCreate'
import { PrimaryImageBlockUpdate } from '../../../../../../__generated__/PrimaryImageBlockUpdate'
import { JourneyPrimaryImageUpdate } from '../../../../../../__generated__/JourneyPrimaryImageUpdate'

export const BLOCK_DELETE_PRIMARY_IMAGE = gql`
  mutation BlockDeletePrimaryImage(
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

export const PRIMARY_IMAGE_BLOCK_CREATE = gql`
  mutation PrimaryImageBlockCreate($input: ImageBlockCreateInput!) {
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

export const PRIMARY_IMAGE_BLOCK_UPDATE = gql`
  mutation PrimaryImageBlockUpdate(
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

export const JOURNEY_PRIMARY_IMAGE_UPDATE = gql`
  mutation JourneyPrimaryImageUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
    }
  }
`

export function ImageEdit(): ReactElement {
  const [blockDeletePrimaryImage] = useMutation<BlockDeletePrimaryImage>(
    BLOCK_DELETE_PRIMARY_IMAGE
  )
  const [primaryImageBlockCreate] = useMutation<PrimaryImageBlockCreate>(
    PRIMARY_IMAGE_BLOCK_CREATE
  )
  const [primaryImageBlockUpdate] = useMutation<PrimaryImageBlockUpdate>(
    PRIMARY_IMAGE_BLOCK_UPDATE
  )
  const [journeyPrimaryImageUpdate] = useMutation<JourneyPrimaryImageUpdate>(
    JOURNEY_PRIMARY_IMAGE_UPDATE
  )

  const { id, primaryImageBlock } = useJourney()
  const [open, setOpen] = useState(false)

  function handleOpen(): void {
    setOpen(true)
  }
  function handleClose(): void {
    setOpen(false)
  }

  async function createImageBlock(imageBlock: ImageBlock): Promise<void> {
    const { data } = await primaryImageBlockCreate({
      variables: {
        input: {
          journeyId: id,
          parentBlockId: id,
          src: imageBlock.src,
          alt: imageBlock.alt
        }
      },
      update(cache, { data }) {
        if (data?.imageBlockCreate != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id }),
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
      const imageData = data.imageBlockCreate
      await journeyPrimaryImageUpdate({
        variables: {
          id,
          input: {
            primaryImageBlockId: data?.imageBlockCreate.id
          }
        },
        update(cache, { data }) {
          if (data?.journeyUpdate != null) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id }),
              fields: {
                primaryImageBlock(existingBlockRefs = null) {
                  const newBlockRef = cache.writeFragment({
                    data: imageData,
                    fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                  })
                  return newBlockRef
                }
              }
            })
          }
        }
      })
    }
  }

  async function updateImageBlock(imageBlock: ImageBlock): Promise<void> {
    await primaryImageBlockUpdate({
      variables: {
        id: imageBlock.id,
        journeyId: id,
        input: {
          src: imageBlock.src,
          alt: imageBlock.alt
        }
      }
    })
  }

  async function handleDelete(): Promise<void> {
    if (primaryImageBlock == null) return

    const { data } = await blockDeletePrimaryImage({
      variables: {
        id: primaryImageBlock.id,
        parentBlockId: primaryImageBlock.parentBlockId,
        journeyId: id
      },
      update(cache, { data }) {
        blockDeleteUpdate(primaryImageBlock, data?.blockDelete, cache, id)
      }
    })
    if (data?.blockDelete != null) {
      await journeyPrimaryImageUpdate({
        variables: {
          id,
          input: {
            primaryImageBlockId: null
          }
        },
        optimisticResponse: {
          journeyUpdate: {
            __typename: 'Journey',
            id
          }
        }
      })
    }
  }

  async function handleChange(primaryImageBlock: ImageBlock): Promise<void> {
    if (primaryImageBlock.src === '') return

    if (primaryImageBlock.id == null) {
      await createImageBlock(primaryImageBlock)
    } else {
      await updateImageBlock(primaryImageBlock)
    }
  }

  return (
    <>
      <Box
        sx={{
          overflow: 'hidden',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          borderRadius: 2,
          width: '100%',
          height: 194,
          mb: 6,
          backgroundColor: '#EFEFEF'
        }}
      >
        {primaryImageBlock?.src != null ? (
          <Box
            component="img"
            src={primaryImageBlock.src}
            alt={primaryImageBlock.alt}
            sx={{
              width: '100%',
              height: '194px',
              objectFit: 'cover'
            }}
          />
        ) : (
          <ImageIcon fontSize="large" />
        )}
        <Button
          variant="contained"
          size="small"
          color="secondary"
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 10,
            borderRadius: 4
          }}
          startIcon={<ImageIcon fontSize="small" />}
          onClick={handleOpen}
        >
          <Typography variant="caption">Change</Typography>
        </Button>
      </Box>
      <Dialog
        open={open}
        handleClose={handleClose}
        dialogTitle={{ title: 'Social media image', closeButton: true }}
      >
        <ImageBlockEditor
          selectedBlock={primaryImageBlock}
          onChange={handleChange}
          onDelete={handleDelete}
        />
      </Dialog>
    </>
  )
}

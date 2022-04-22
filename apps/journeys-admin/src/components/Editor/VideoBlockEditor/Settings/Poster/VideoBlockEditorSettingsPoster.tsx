import Create from '@mui/icons-material/Create'
import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import { ReactElement, useState, useEffect } from 'react'
import { useJourney } from '../../../../../libs/context'
import { BlockDeleteForPosterImage } from '../../../../../../__generated__/BlockDeleteForPosterImage'
import { PosterImageBlockCreate } from '../../../../../../__generated__/PosterImageBlockCreate'
import { PosterImageBlockUpdate } from '../../../../../../__generated__/PosterImageBlockUpdate'
import { VideoBlockPosterImageUpdate } from '../../../../../../__generated__/VideoBlockPosterImageUpdate'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../__generated__/GetJourney'
import { ImageBlockThumbnail } from '../../../ImageBlockThumbnail'
import { Dialog } from '../../../../Dialog'
import { ImageBlockEditor } from '../../../ImageBlockEditor'
import { blockDeleteUpdate } from '../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'

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

interface BackgroundMediaCoverImageProps {
  selectedBlock: ImageBlock | null
  parentBlockId: string | undefined
  disabled?: boolean
}

export function VideoBlockEditorSettingsPoster({
  selectedBlock,
  parentBlockId,
  disabled = false
}: BackgroundMediaCoverImageProps): ReactElement {
  const [blockDelete, { error: blockDeleteError }] =
    useMutation<BlockDeleteForPosterImage>(BLOCK_DELETE_FOR_POSTER_IMAGE)
  const [videoBlockUpdate, { error: videoBlockUpdateError }] =
    useMutation<VideoBlockPosterImageUpdate>(VIDEO_BLOCK_POSTER_IMAGE_UPDATE)
  const [
    imageBlockCreate,
    { error: imageBlockCreateError, loading: createLoading }
  ] = useMutation<PosterImageBlockCreate>(POSTER_IMAGE_BLOCK_CREATE)
  const [
    imageBlockUpdate,
    { error: imageBlockUpdateError, loading: updateLoading }
  ] = useMutation<PosterImageBlockUpdate>(POSTER_IMAGE_BLOCK_UPDATE)

  const journey = useJourney()
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const handleOpen = (): void => setOpen(true)
  const handleClose = (): void => setOpen(false)

  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (createLoading || updateLoading) {
      setLoading(true)
    } else {
      setLoading(false)
    }
  }, [createLoading, updateLoading])

  const deleteCoverBlock = async (): Promise<void> => {
    if (selectedBlock == null || parentBlockId == null || journey == null)
      return

    await blockDelete({
      variables: {
        id: selectedBlock.id,
        parentBlockId: selectedBlock.parentBlockId,
        journeyId: journey.id
      },
      update(cache, { data }) {
        blockDeleteUpdate(selectedBlock, data?.blockDelete, cache, journey.id)
      }
    })
    if (blockDeleteError != null) return

    await videoBlockUpdate({
      variables: {
        id: parentBlockId,
        journeyId: journey.id,
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
    if (parentBlockId == null || journey == null) return false

    const { data } = await imageBlockCreate({
      variables: {
        input: {
          journeyId: journey.id,
          parentBlockId: parentBlockId,
          src: block.src,
          alt: block.alt
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

    if (imageBlockCreateError != null) return false

    await videoBlockUpdate({
      variables: {
        id: parentBlockId,
        journeyId: journey.id,
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
    if (selectedBlock == null || journey == null) return false

    await imageBlockUpdate({
      variables: {
        id: selectedBlock.id,
        journeyId: journey.id,
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
        <Typography
          variant="subtitle2"
          color={disabled ? theme.palette.action.disabled : ''}
          sx={{ letterSpacing: 0 }}
        >
          Cover Image
        </Typography>
        <Typography
          variant="caption"
          color={disabled ? theme.palette.action.disabled : ''}
        >
          Appears while video is loading
        </Typography>
      </Stack>
      <Box
        height={62}
        sx={{ backgroundColor: 'rgba(0, 0, 0, 0.06)', p: 1 }}
        borderRadius={2}
      >
        <Stack direction="row" justifyContent="space-around">
          <ImageBlockThumbnail
            selectedBlock={selectedBlock}
            loading={loading}
          />
          <Stack
            direction="column"
            justifyContent="center"
            sx={{ paddingRight: 1 }}
          >
            <IconButton
              onClick={handleOpen}
              disabled={disabled}
              data-testid="posterCreateButton"
            >
              <Create
                sx={{
                  color: disabled
                    ? theme.palette.action.disabled
                    : theme.palette.primary.main
                }}
              />
            </IconButton>
            <Dialog
              open={open}
              handleClose={handleClose}
              dialogTitle={{
                title: 'Cover Image',
                closeButton: true
              }}
            >
              <ImageBlockEditor
                selectedBlock={selectedBlock}
                onChange={handleChange}
                onDelete={deleteCoverBlock}
                loading={loading}
              />
            </Dialog>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  )
}

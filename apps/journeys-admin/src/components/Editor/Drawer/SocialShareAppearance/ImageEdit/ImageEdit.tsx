import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { ReactElement, useState } from 'react'

import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit2Icon from '@core/shared/ui/icons/Edit2'
import GridEmptyIcon from '@core/shared/ui/icons/GridEmpty'

import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../__generated__/GetJourney'
import {
  JourneyImageBlockAssociationUpdate,
  JourneyImageBlockAssociationUpdateVariables
} from '../../../../../../__generated__/JourneyImageBlockAssociationUpdate'
import {
  JourneyImageBlockCreate,
  JourneyImageBlockCreateVariables
} from '../../../../../../__generated__/JourneyImageBlockCreate'
import {
  JourneyImageBlockDelete,
  JourneyImageBlockDeleteVariables
} from '../../../../../../__generated__/JourneyImageBlockDelete'
import {
  JourneyImageBlockUpdate,
  JourneyImageBlockUpdateVariables
} from '../../../../../../__generated__/JourneyImageBlockUpdate'
import { blockDeleteUpdate } from '../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { ImageLibrary } from '../../../ImageLibrary'

export const JOURNEY_IMAGE_BLOCK_DELETE = gql`
  mutation JourneyImageBlockDelete($id: ID!, $journeyId: ID!) {
    blockDelete(id: $id, journeyId: $journeyId) {
      id
      parentOrder
    }
  }
`

export const JOURNEY_IMAGE_BLOCK_CREATE = gql`
  ${IMAGE_FIELDS}
  mutation JourneyImageBlockCreate($input: ImageBlockCreateInput!) {
    imageBlockCreate(input: $input) {
      ...ImageFields
    }
  }
`

export const JOURNEY_IMAGE_BLOCK_UPDATE = gql`
  ${IMAGE_FIELDS}
  mutation JourneyImageBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ImageBlockUpdateInput!
  ) {
    imageBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      ...ImageFields
    }
  }
`

export const JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE = gql`
  mutation JourneyImageBlockAssociationUpdate(
    $id: ID!
    $input: JourneyUpdateInput!
  ) {
    journeyUpdate(id: $id, input: $input) {
      id
      primaryImageBlock {
        id
      }
      creatorImageBlock {
        id
      }
    }
  }
`

interface ImageEditProps {
  variant?: 'primary' | 'creator'
}

export function ImageEdit({
  variant = 'primary'
}: ImageEditProps): ReactElement {
  const [journeyImageBlockDelete] = useMutation<
    JourneyImageBlockDelete,
    JourneyImageBlockDeleteVariables
  >(JOURNEY_IMAGE_BLOCK_DELETE)
  const [
    journeyImageBlockCreate,
    { loading: createLoading, error: createError }
  ] = useMutation<JourneyImageBlockCreate, JourneyImageBlockCreateVariables>(
    JOURNEY_IMAGE_BLOCK_CREATE
  )
  const [
    journeyImageBlockUpdate,
    { loading: updateLoading, error: updateError }
  ] = useMutation<JourneyImageBlockUpdate, JourneyImageBlockUpdateVariables>(
    JOURNEY_IMAGE_BLOCK_UPDATE
  )
  const [journeyImageBlockAssociationUpdate] = useMutation<
    JourneyImageBlockAssociationUpdate,
    JourneyImageBlockAssociationUpdateVariables
  >(JOURNEY_IMAGE_BLOCK_ASSOCIATION_UPDATE)
  const { journey } = useJourney()
  const [open, setOpen] = useState(false)
  const variantImageBlock =
    variant === 'primary'
      ? journey?.primaryImageBlock
      : journey?.creatorImageBlock

  function handleOpen(): void {
    setOpen(true)
  }
  function handleClose(): void {
    setOpen(false)
  }

  async function createImageBlock(imageBlock: ImageBlock): Promise<void> {
    if (journey == null) return

    const { data } = await journeyImageBlockCreate({
      variables: {
        input: {
          journeyId: journey.id,
          src: imageBlock.src,
          alt: imageBlock.alt,
          blurhash: imageBlock.blurhash,
          width: imageBlock.width,
          height: imageBlock.height
        }
      }
    })
    if (data?.imageBlockCreate != null) {
      await journeyImageBlockAssociationUpdate({
        variables: {
          id: journey.id,
          input:
            variant === 'primary'
              ? {
                  primaryImageBlockId: data.imageBlockCreate.id
                }
              : {
                  creatorImageBlockId: data.imageBlockCreate.id
                }
        }
      })
    }
  }

  async function updateImageBlock(imageBlock: ImageBlock): Promise<void> {
    if (journey == null) return

    await journeyImageBlockUpdate({
      variables: {
        id: imageBlock.id,
        journeyId: journey?.id,
        input: {
          src: imageBlock.src,
          alt: imageBlock.alt,
          blurhash: imageBlock.blurhash,
          width: imageBlock.width,
          height: imageBlock.height
        }
      }
    })
  }

  async function handleDelete(): Promise<void> {
    if (journey == null || variantImageBlock == null) return

    const { data } = await journeyImageBlockDelete({
      variables: {
        id: variantImageBlock.id,
        journeyId: journey.id
      },
      update(cache, { data }) {
        blockDeleteUpdate(
          variantImageBlock,
          data?.blockDelete,
          cache,
          journey.id
        )
      }
    })
    if (data?.blockDelete != null) {
      await journeyImageBlockAssociationUpdate({
        variables: {
          id: journey.id,
          input:
            variant === 'primary'
              ? {
                  primaryImageBlockId: null
                }
              : {
                  creatorImageBlockId: null
                }
        }
      })
    }
  }

  async function handleChange(imageBlock: ImageBlock): Promise<void> {
    if (imageBlock.src === '') return

    if (imageBlock.id == null) {
      await createImageBlock(imageBlock)
    } else {
      await updateImageBlock(imageBlock)
    }

    handleClose()
  }

  return (
    <>
      {journey != null ? (
        <Box
          overflow="hidden"
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="relative"
          borderRadius={2}
          width="100%"
          height={194}
          mb={6}
          bgcolor="#EFEFEF"
          sx={{
            cursor: 'pointer',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.1)' },
            '&:active:hover': { bgcolor: 'rgba(0, 0, 0, 0.2)' }
          }}
          data-testid="social-image-edit"
          onClick={handleOpen}
        >
          {variantImageBlock?.src != null ? (
            <Box
              component="img"
              src={variantImageBlock.src}
              alt={variantImageBlock.alt}
              sx={{
                width: '100%',
                height: '194px',
                objectFit: 'cover'
              }}
            />
          ) : (
            <GridEmptyIcon fontSize="large" />
          )}

          <Button
            variant="contained"
            size="small"
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 10,
              borderRadius: 4,
              backgroundColor: 'background.paper'
            }}
            startIcon={
              <Edit2Icon fontSize="small" sx={{ color: 'secondary.dark' }} />
            }
            onClick={handleOpen}
          >
            <Typography variant="caption" color="secondary.dark">
              Change
            </Typography>
          </Button>
        </Box>
      ) : (
        <Box
          sx={{ cursor: 'pointer' }}
          mb={6}
          position="relative"
          onClick={handleOpen}
        >
          <Skeleton
            variant="rectangular"
            width="100%"
            height={194}
            sx={{
              borderRadius: 2,
              root: { '&:hover': { backgroundColor: 'yellow' } }
            }}
          />
          <Button
            variant="contained"
            size="small"
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 10,
              borderRadius: 4,
              backgroundColor: 'background.paper'
            }}
            startIcon={
              <Edit2Icon fontSize="small" sx={{ color: 'secondary.dark' }} />
            }
            onClick={handleOpen}
            disabled
          >
            <Typography variant="caption" color="secondary.dark">
              Change
            </Typography>
          </Button>
        </Box>
      )}
      <ImageLibrary
        selectedBlock={variantImageBlock ?? null}
        open={open}
        onClose={handleClose}
        onChange={handleChange}
        onDelete={handleDelete}
        loading={createLoading || updateLoading}
        error={createError != null ?? updateError != null}
      />
    </>
  )
}

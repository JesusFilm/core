import { gql, useMutation } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { IMAGE_FIELDS } from '@core/journeys/ui/Image/imageFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import Edit2 from '@core/shared/ui/icons/Edit2'
import Image3 from '@core/shared/ui/icons/Image3'

import { BlockDeletePrimaryImage } from '../../../../../../__generated__/BlockDeletePrimaryImage'
import { GetJourney_journey_blocks_ImageBlock as ImageBlock } from '../../../../../../__generated__/GetJourney'
import { JourneyPrimaryImageUpdate } from '../../../../../../__generated__/JourneyPrimaryImageUpdate'
import { PrimaryImageBlockCreate } from '../../../../../../__generated__/PrimaryImageBlockCreate'
import { PrimaryImageBlockUpdate } from '../../../../../../__generated__/PrimaryImageBlockUpdate'
import { blockDeleteUpdate } from '../../../../../libs/blockDeleteUpdate/blockDeleteUpdate'
import { ImageLibrary } from '../../../ImageLibrary'
import { useSocialPreview } from '../../../SocialProvider'

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
  ${IMAGE_FIELDS}
  mutation PrimaryImageBlockCreate($input: ImageBlockCreateInput!) {
    imageBlockCreate(input: $input) {
      ...ImageFields
    }
  }
`

export const PRIMARY_IMAGE_BLOCK_UPDATE = gql`
  ${IMAGE_FIELDS}
  mutation PrimaryImageBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ImageBlockUpdateInput!
  ) {
    imageBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      ...ImageFields
    }
  }
`

export const JOURNEY_PRIMARY_IMAGE_UPDATE = gql`
  mutation JourneyPrimaryImageUpdate($id: ID!, $input: JourneyUpdateInput!) {
    journeyUpdate(id: $id, input: $input) {
      id
      primaryImageBlock {
        id
      }
    }
  }
`

export function ImageEdit(): ReactElement {
  const [blockDeletePrimaryImage] = useMutation<BlockDeletePrimaryImage>(
    BLOCK_DELETE_PRIMARY_IMAGE
  )
  const [
    primaryImageBlockCreate,
    { loading: createLoading, error: createError }
  ] = useMutation<PrimaryImageBlockCreate>(PRIMARY_IMAGE_BLOCK_CREATE)
  const [
    primaryImageBlockUpdate,
    { loading: updateLoading, error: updateError }
  ] = useMutation<PrimaryImageBlockUpdate>(PRIMARY_IMAGE_BLOCK_UPDATE)
  const [journeyPrimaryImageUpdate] = useMutation<JourneyPrimaryImageUpdate>(
    JOURNEY_PRIMARY_IMAGE_UPDATE
  )

  const { journey } = useJourney()

  const { primaryImageBlock, setPrimaryImageBlock } = useSocialPreview()
  const once = useRef(false)
  useEffect(() => {
    if (!once.current && journey != null) {
      setPrimaryImageBlock(journey?.primaryImageBlock)
      once.current = true
    }
  }, [journey, setPrimaryImageBlock])

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
          journeyId: journey?.id,
          src: imageBlock.src,
          alt: imageBlock.alt,
          blurhash: imageBlock.blurhash,
          width: imageBlock.width,
          height: imageBlock.height
        }
      },
      update(cache, { data }) {
        if (data?.imageBlockCreate != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey?.id }),
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
      await journeyPrimaryImageUpdate({
        variables: {
          id: journey?.id,
          input: {
            primaryImageBlockId: data?.imageBlockCreate.id
          }
        }
      })
      setPrimaryImageBlock(data.imageBlockCreate)
    }
  }

  async function updateImageBlock(imageBlock: ImageBlock): Promise<void> {
    await primaryImageBlockUpdate({
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
    setPrimaryImageBlock(imageBlock)
  }

  async function handleDelete(): Promise<void> {
    if (journey == null || primaryImageBlock == null) return

    const { data } = await blockDeletePrimaryImage({
      variables: {
        id: primaryImageBlock.id,
        journeyId: journey.id
      },
      update(cache, { data }) {
        blockDeleteUpdate(
          primaryImageBlock as ImageBlock,
          data?.blockDelete,
          cache,
          journey.id
        )
      }
    })
    if (data?.blockDelete != null) {
      await journeyPrimaryImageUpdate({
        variables: {
          id: journey.id,
          input: {
            primaryImageBlockId: null
          }
        }
      })
      setPrimaryImageBlock(null)
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
            <Image3 fontSize="large" />
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
              <Edit2 fontSize="small" sx={{ color: 'secondary.dark' }} />
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
              <Edit2 fontSize="small" sx={{ color: 'secondary.dark' }} />
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
        selectedBlock={(primaryImageBlock as ImageBlock) ?? null}
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

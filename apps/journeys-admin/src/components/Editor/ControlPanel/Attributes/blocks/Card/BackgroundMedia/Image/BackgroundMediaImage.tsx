import { ReactElement, useState, ChangeEvent } from 'react'
import Box from '@mui/material/Box'
import { gql, useMutation } from '@apollo/client'
import { InputAdornment, Stack, TextField, Typography } from '@mui/material'
import {
  CheckCircle,
  DeleteOutline,
  Image as ImageIcon,
  Link as LinkIcon
} from '@mui/icons-material'
import Image from 'next/image'
import { TreeBlock } from '@core/journeys/ui'
import { debounce, reject } from 'lodash'

import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/GetJourney'
import { useJourney } from '../../../../../../../../libs/context'
import { CardBlockBackgroundImageUpdate } from '../../../../../../../../../__generated__/CardBlockBackgroundImageUpdate'
import { CardBlockImageBlockCreate } from '../../../../../../../../../__generated__/CardBlockImageBlockCreate'
import { CardBlockImageBlockUpdate } from '../../../../../../../../../__generated__/CardBlockImageBlockUpdate'
import { BlockDeleteForBackgroundImage } from '../../../../../../../../../__generated__/BlockDeleteForBackgroundImage'

export const BLOCK_DELETE_FOR_BACKGROUND_IMAGE = gql`
  mutation BlockDeleteForBackgroundImage($id: ID!, $journeyId: ID!) {
    blockDelete(id: $id, journeyId: $journeyId) {
      id
    }
  }
`

export const CARD_BLOCK_COVER_IMAGE_UPDATE = gql`
  mutation CardBlockBackgroundImageUpdate(
    $id: ID!
    $journeyId: ID!
    $input: CardBlockUpdateInput!
  ) {
    cardBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      coverBlockId
    }
  }
`

export const CARD_BLOCK_COVER_IMAGE_BLOCK_CREATE = gql`
  mutation CardBlockImageBlockCreate($input: ImageBlockCreateInput!) {
    imageBlockCreate(input: $input) {
      id
      src
      alt
    }
  }
`

export const CARD_BLOCK_COVER_IMAGE_BLOCK_UPDATE = gql`
  mutation CardBlockImageBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: ImageBlockUpdateInput!
  ) {
    imageBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      src
      alt
    }
  }
`
interface BackgroundMediaImageProps {
  cardBlock: TreeBlock<CardBlock>
  debounceTime?: number
}

export function BackgroundMediaImage({
  cardBlock,
  debounceTime = 1000
}: BackgroundMediaImageProps): ReactElement {
  const coverBlock =
    (cardBlock?.children.find(
      (child) => child.id === cardBlock?.coverBlockId
    ) as TreeBlock<ImageBlock> | TreeBlock<VideoBlock>) ?? null

  const [cardBlockUpdate] = useMutation<CardBlockBackgroundImageUpdate>(
    CARD_BLOCK_COVER_IMAGE_UPDATE
  )
  const [imageBlockCreate] = useMutation<CardBlockImageBlockCreate>(
    CARD_BLOCK_COVER_IMAGE_BLOCK_CREATE
  )
  const [imageBlockUpdate] = useMutation<CardBlockImageBlockUpdate>(
    CARD_BLOCK_COVER_IMAGE_BLOCK_UPDATE
  )
  const [blockRemove] = useMutation<BlockDeleteForBackgroundImage>(
    BLOCK_DELETE_FOR_BACKGROUND_IMAGE
  )
  const { id: journeyId } = useJourney()
  const [imageBlock, setImageBlock] = useState(
    coverBlock?.__typename === 'ImageBlock' ? coverBlock : null
  )

  const handleImageChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const block = {
      ...imageBlock,
      src: event.target.value,
      alt: event.target.value // per Vlad 26/1/22, we are hardcoding the image alt for now
    }
    await handleChangeDebounced(block as ImageBlock)
    setImageBlock(block as TreeBlock<ImageBlock>)
  }

  const handleImageDelete = async (): Promise<void> => {
    await deleteCoverBlock()
  }

  const deleteCoverBlock = async (): Promise<void> => {
    await blockRemove({
      variables: {
        id: coverBlock.id,
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
    await cardBlockUpdate({
      variables: {
        id: cardBlock.id,
        journeyId: journeyId,
        input: {
          coverBlockId: null
        }
      },
      optimisticResponse: {
        cardBlockUpdate: {
          id: cardBlock.id,
          coverBlockId: null,
          __typename: 'CardBlock'
        }
      }
    })
  }

  const createImageBlock = async (block): Promise<void> => {
    const { data } = await imageBlockCreate({
      variables: {
        input: {
          journeyId: journeyId,
          parentBlockId: cardBlock.id,
          src: block.src,
          alt: block.alt
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
      }
    })
    await cardBlockUpdate({
      variables: {
        id: cardBlock.id,
        journeyId: journeyId,
        input: {
          coverBlockId: data?.imageBlockCreate.id ?? null
        }
      },
      optimisticResponse: {
        cardBlockUpdate: {
          id: cardBlock.id,
          coverBlockId: data?.imageBlockCreate.id ?? null,
          __typename: 'CardBlock'
        }
      }
    })
  }

  const updateImageBlock = async (block: ImageBlock): Promise<void> => {
    await imageBlockUpdate({
      variables: {
        id: coverBlock.id,
        journeyId: journeyId,
        input: {
          src: block.src,
          alt: block.alt
        }
      },
      optimisticResponse: {
        imageBlockUpdate: {
          id: cardBlock.id,
          __typename: 'ImageBlock',
          src: block.src,
          alt: block.alt
        }
      }
    })
  }
  const handleChange = async (block: ImageBlock): Promise<void> => {
    if (
      coverBlock != null &&
      coverBlock?.__typename.toString() !== 'ImageBlock'
    ) {
      // remove existing cover block if type changed
      await deleteCoverBlock()
    }
    if (imageBlock == null) {
      await createImageBlock(block)
    } else {
      await updateImageBlock(block)
    }
  }
  const handleChangeDebounced = debounce(handleChange, debounceTime)

  return (
    <>
      <Box sx={{ px: 6, py: 4 }}>
        {imageBlock?.src != null && (
          <Stack
            direction="row"
            spacing="3"
            justifyContent="space-between"
            data-testid="imageSrcStack"
          >
            <div
              style={{
                overflow: 'hidden',
                borderRadius: 8,
                height: 55,
                width: 55
              }}
            >
              <Image
                src={imageBlock.src}
                alt={imageBlock?.alt}
                width={55}
                height={55}
              ></Image>
            </div>
            <Stack direction="column" justifyContent="center">
              <Typography
                variant="body1"
                sx={{
                  maxWidth: 180,
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
              >
                {imageBlock.src}
              </Typography>
            </Stack>
            <Stack direction="column" justifyContent="center">
              <DeleteOutline
                data-testid="deleteImage"
                color="primary"
                onClick={handleImageDelete}
                style={{ cursor: 'pointer' }}
              ></DeleteOutline>
            </Stack>
          </Stack>
        )}
        {imageBlock?.src == null && (
          <Stack
            direction="row"
            spacing="3"
            justifyContent="center"
            data-testid="imagePlaceholderStack"
          >
            <Box sx={{ width: 55, height: 55 }}>
              <ImageIcon></ImageIcon>
            </Box>
            <Stack direction="column" justifyContent="center">
              <Typography variant="subtitle2">Select Image File</Typography>
              <Typography variant="caption">Min width 1024px</Typography>
            </Stack>
          </Stack>
        )}
      </Box>

      <Box sx={{ p: 3 }}>
        <Box sx={{ px: 'auto' }}>
          <Stack direction="column">
            <TextField
              id="imageSrc"
              name="src"
              variant="filled"
              value={imageBlock?.src}
              onChange={handleImageChange}
              data-testid="imgSrcTextField"
              label="Paste URL of image..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LinkIcon></LinkIcon>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <CheckCircle style={{ cursor: 'pointer' }}></CheckCircle>
                  </InputAdornment>
                )
              }}
            ></TextField>
            <Typography variant="caption">
              Make sure image address is permanent
            </Typography>
          </Stack>
        </Box>
      </Box>
    </>
  )
}

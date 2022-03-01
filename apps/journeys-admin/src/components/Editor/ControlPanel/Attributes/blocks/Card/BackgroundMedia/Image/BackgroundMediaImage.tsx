import { ReactElement, useState, ChangeEvent } from 'react'
import Box from '@mui/material/Box'
import { gql, useMutation } from '@apollo/client'
import {
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import {
  DeleteOutline,
  Image as ImageIcon,
  Link as LinkIcon
} from '@mui/icons-material'
import Image from 'next/image'
import { TreeBlock } from '@core/journeys/ui'
import { noop, reject } from 'lodash'
import { object, string } from 'yup'
import { Formik, Form } from 'formik'

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
  mutation BlockDeleteForBackgroundImage(
    $id: ID!
    $parentBlockId: ID!
    $journeyId: ID!
  ) {
    blockDelete(id: $id, parentBlockId: $parentBlockId, journeyId: $journeyId) {
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
      parentBlockId
      width
      height
      parentOrder
      blurhash
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
}

export function BackgroundMediaImage({
  cardBlock
}: BackgroundMediaImageProps): ReactElement {
  const coverBlock =
    (cardBlock?.children.find(
      (child) => child.id === cardBlock?.coverBlockId
    ) as TreeBlock<ImageBlock> | TreeBlock<VideoBlock>) ?? null

  const [cardBlockUpdate, { error: cardBlockUpdateError }] =
    useMutation<CardBlockBackgroundImageUpdate>(CARD_BLOCK_COVER_IMAGE_UPDATE)
  const [imageBlockCreate, { error: imageBlockCreateError }] =
    useMutation<CardBlockImageBlockCreate>(CARD_BLOCK_COVER_IMAGE_BLOCK_CREATE)
  const [imageBlockUpdate, { error: imageBlockUpdateError }] =
    useMutation<CardBlockImageBlockUpdate>(CARD_BLOCK_COVER_IMAGE_BLOCK_UPDATE)
  const [blockDelete, { error: blockDeleteError }] =
    useMutation<BlockDeleteForBackgroundImage>(
      BLOCK_DELETE_FOR_BACKGROUND_IMAGE
    )
  const { id: journeyId } = useJourney()
  const [imageBlock, setImageBlock] = useState(
    coverBlock?.__typename === 'ImageBlock' ? coverBlock : null
  )

  const srcSchema = object().shape({
    src: string().url('Please enter a valid url').required('Required')
  })

  const handleSrcChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const src = event.target.value

    const block = {
      ...imageBlock,
      src: src,
      alt: src.replace(/(.*\/)*/, '').replace(/\?.*/, '') // per Vlad 26/1/22, we are hardcoding the image alt for now
    }
    await handleChange(block as ImageBlock)
  }

  const handleImageDelete = async (): Promise<void> => {
    await deleteCoverBlock()
  }

  const deleteCoverBlock = async (): Promise<boolean> => {
    await blockDelete({
      variables: {
        id: coverBlock.id,
        parentBlockId: cardBlock.parentBlockId,
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

    if (blockDeleteError != null) return false

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
    return cardBlockUpdateError == null
  }

  const createImageBlock = async (block): Promise<boolean> => {
    const { data } = await imageBlockCreate({
      variables: {
        input: {
          journeyId: journeyId,
          parentBlockId: cardBlock.id,
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
    return cardBlockUpdateError == null
  }

  const updateImageBlock = async (block: ImageBlock): Promise<boolean> => {
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
    return imageBlockUpdateError == null
  }
  const handleChange = async (block: ImageBlock): Promise<void> => {
    let success = true
    if (
      coverBlock != null &&
      coverBlock?.__typename.toString() !== 'ImageBlock'
    ) {
      // remove existing cover block if type changed
      success = await deleteCoverBlock()
    }

    if (block.src === '' || !success) return

    if (imageBlock == null) {
      success = await createImageBlock(block)
    } else {
      success = await updateImageBlock(block)
    }
    if (success) {
      setImageBlock(block as TreeBlock<ImageBlock>)
    }
  }

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
                variant="subtitle2"
                sx={{
                  maxWidth: 180,
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}
              >
                {imageBlock.src.replace(/(.*\/)*/, '').replace(/\?.*/, '')}
              </Typography>
              {coverBlock != null && (
                <Typography variant="caption">
                  {coverBlock.width}x{coverBlock.height}
                </Typography>
              )}
            </Stack>
            <Stack direction="column" justifyContent="center">
              <IconButton onClick={handleImageDelete} data-testid="deleteImage">
                <DeleteOutline color="primary"></DeleteOutline>
              </IconButton>
            </Stack>
          </Stack>
        )}
        {imageBlock?.src == null && (
          <Stack
            direction="row"
            spacing="16px"
            data-testid="imagePlaceholderStack"
          >
            <Box borderRadius={2} bgcolor="#EFEFEF" height={55} width={55}>
              <div
                style={{
                  height: 55,
                  width: 55,
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  lineHeight: '55px',
                  padding: '5px'
                }}
              >
                <ImageIcon></ImageIcon>
              </div>
            </Box>
            <Stack direction="column" justifyContent="center">
              <Typography variant="subtitle2">Select Image File</Typography>
              <Typography variant="caption">Min width 1024px</Typography>
            </Stack>
          </Stack>
        )}
      </Box>

      <Box sx={{ py: 3, px: 6 }}>
        <Box sx={{ px: 'auto' }}>
          <Stack direction="column">
            <Formik
              initialValues={{
                src: imageBlock?.src ?? ''
              }}
              validationSchema={srcSchema}
              onSubmit={noop}
            >
              {({ values, touched, errors, handleChange, handleBlur }) => (
                <Form>
                  <TextField
                    id="src"
                    name="src"
                    variant="filled"
                    data-testid="imgSrcTextField"
                    label="Paste URL of image..."
                    fullWidth
                    value={values.src}
                    onChange={handleChange}
                    onBlur={(e) => {
                      handleBlur(e)
                      errors.src == null &&
                        handleSrcChange(e as ChangeEvent<HTMLInputElement>)
                    }}
                    helperText={
                      touched.src === true
                        ? errors.src
                        : 'Make sure image address is permanent'
                    }
                    error={touched.src === true && Boolean(errors.src)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon></LinkIcon>
                        </InputAdornment>
                      )
                    }}
                  ></TextField>
                </Form>
              )}
            </Formik>
          </Stack>
        </Box>
      </Box>
    </>
  )
}

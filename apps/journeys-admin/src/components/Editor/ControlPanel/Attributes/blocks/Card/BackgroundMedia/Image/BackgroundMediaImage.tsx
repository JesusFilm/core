import { ReactElement, useEffect, useState, ChangeEvent } from 'react'
import Box from '@mui/material/Box'
import { useMutation } from '@apollo/client'
import {
  InputAdornment,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material'
import {
  CheckCircle,
  DeleteOutline,
  Image as ImageIcon,
  Link as LinkIcon
} from '@mui/icons-material'
import Image from 'next/image'
import { TabPanel, tabProps } from '@core/shared/ui'
import { TreeBlock } from '@core/journeys/ui'

import {
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/GetJourney'
import { useJourney } from '../../../../../../../../libs/context'
import { CARD_BLOCK_UPDATE } from '../../CardBlockUpdate'
import {
  CardBlockUpdateInput,
  ImageBlockCreateInput,
  ImageBlockUpdateInput
} from '../../../../../../../../../__generated__/globalTypes'
import { IMAGE_BLOCK_UPDATE } from '../../../Image/ImageBlockUpdate'
import { BLOCK_REMOVE } from '../../../BlockRemove'
import { IMAGE_BLOCK_CREATE } from '../../../Image/ImageBlockCreate'

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

  const [tabValue, setTabValue] = useState(
    (coverBlock as TreeBlock<ImageBlock>)?.src == null ? 0 : 1
  )
  const [cardBlockUpdate] =
    useMutation<{ cardBlockUpdate: CardBlockUpdateInput }>(CARD_BLOCK_UPDATE)
  const [imageBlockCreate] =
    useMutation<{ imageBlockCreate: ImageBlockCreateInput }>(IMAGE_BLOCK_CREATE)
  const [imageBlockUpdate] =
    useMutation<{ imageBlockUpdate: ImageBlockUpdateInput }>(IMAGE_BLOCK_UPDATE)
  const [blockRemove] = useMutation(BLOCK_REMOVE)
  const journey = useJourney()
  const [imageBlock, setImageBlock] = useState(
    coverBlock.__typename === 'ImageBlock' ? coverBlock : null
  )

  useEffect(() => {
    setImageBlock(coverBlock.__typename === 'ImageBlock' ? coverBlock : null)
  }, [coverBlock, setImageBlock])

  const handleTabChange = (event, newValue): void => {
    setTabValue(newValue)
  }

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const block = {
      ...imageBlock,
      [event.target.name]: event.target.value
    }
    setImageBlock(block as TreeBlock<ImageBlock>)
  }

  const handleImageChangeClick = async (): Promise<void> => {
    await handleChange(imageBlock)
  }

  const handleImageDelete = async (): Promise<void> => {
    await handleChange(null)
  }

  const handleChange = async (block: ImageBlock | null): Promise<void> => {
    let blockTypeChanged = false
    if (
      coverBlock != null &&
      (block == null || coverBlock.__typename.toString() !== 'ImageBlock')
    ) {
      blockTypeChanged = true
      // Remove existing video poster block if it exists
      const posterBlock =
        coverBlock.__typename === 'VideoBlock'
          ? coverBlock.children.find(
              (child) => child.id === coverBlock.posterBlockId
            )
          : null
      if (posterBlock != null) {
        await blockRemove({
          variables: {
            id: posterBlock.id,
            journeyId: journey.id
          }
        })
      }
      // remove existing cover block if type changed
      await blockRemove({
        variables: {
          id: coverBlock.id,
          journeyId: journey.id
        }
      })
    }
    let data
    if (block != null && (coverBlock == null || blockTypeChanged)) {
      ;({ data } = await imageBlockCreate({
        variables: {
          input: {
            journeyId: journey.id,
            parentBlockId: cardBlock.id,
            src: block.src,
            alt: block.src // per Vlad 26/1/22, we are hardcoding the image alt for now
          }
        }
      }))
      ;({ data } = await cardBlockUpdate({
        variables: {
          id: cardBlock.id,
          journeyId: journey.id,
          input: {
            coverBlockId: data.id
          }
        }
      }))
    } else if (block != null) {
      ;({ data } = await imageBlockUpdate({
        variables: {
          id: coverBlock.id,
          journeyId: journey.id,
          input: {
            src: block.src,
            alt: block.src // per Vlad 26/1/22, we are hardcoding the image alt for now
          }
        }
      }))
    }
  }

  return (
    <>
      <Box sx={{ px: 6, py: 4 }}>
        {imageBlock?.src != null && (
          <Stack direction="row" spacing="3" justifyContent="space-between">
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
                color="primary"
                onClick={handleImageDelete}
                style={{ cursor: 'pointer' }}
              ></DeleteOutline>
            </Stack>
          </Stack>
        )}
        {imageBlock?.src == null && (
          <Stack direction="row" spacing="3" justifyContent="center">
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
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="background tabs"
        variant="fullWidth"
        centered
      >
        <Tab label="Upload" {...tabProps(0)}></Tab>
        <Tab label="By URL" {...tabProps(1)}></Tab>
      </Tabs>
      <TabPanel value={tabValue} index={0}>
        Not yet implemented
      </TabPanel>
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ py: 3 }}>
          <TextField
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
                  <CheckCircle
                    onClick={handleImageChangeClick}
                    style={{ cursor: 'pointer' }}
                  ></CheckCircle>
                </InputAdornment>
              )
            }}
          ></TextField>
          <Typography variant="caption">
            Make sure image address is permanent
          </Typography>
        </Box>
      </TabPanel>
    </>
  )
}

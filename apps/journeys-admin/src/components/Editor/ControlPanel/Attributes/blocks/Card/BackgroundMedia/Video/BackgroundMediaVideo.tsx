import { ReactElement, useState, ChangeEvent } from 'react'
import { TreeBlock } from '@core/journeys/ui'
import Box from '@mui/material/Box'
import { gql, useMutation } from '@apollo/client'
import {
  Divider,
  InputAdornment,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material'
import {
  CheckCircle,
  Create,
  DeleteOutline,
  Image as ImageIcon,
  Link as LinkIcon,
  PlayCircle,
  StopCircle
} from '@mui/icons-material'
import Image from 'next/image'
import { TabPanel, tabA11yProps } from '@core/shared/ui'
import TimeField from 'react-simple-timefield'
import { debounce, reject } from 'lodash'

import {
  GetJourney_journey_blocks_CardBlock as CardBlock,
  GetJourney_journey_blocks_ImageBlock as ImageBlock,
  GetJourney_journey_blocks_VideoBlock as VideoBlock
} from '../../../../../../../../../__generated__/GetJourney'
import { useJourney } from '../../../../../../../../libs/context'
import { VideoBlockUpdateInput } from '../../../../../../../../../__generated__/globalTypes'
import { BlockDeleteForBackgroundVideo } from '../../../../../../../../../__generated__/BlockDeleteForBackgroundVideo'
import { CardBlockBackgroundVideoUpdate } from '../../../../../../../../../__generated__/CardBlockBackgroundVideoUpdate'
import { CardBlockVideoBlockCreate } from '../../../../../../../../../__generated__/CardBlockVideoBlockCreate'
import { CardBlockVideoBlockUpdate } from '../../../../../../../../../__generated__/CardBlockVideoBlockUpdate'

export const BLOCK_DELETE_FOR_BACKGROUND_VIDEO = gql`
  mutation BlockDeleteForBackgroundVideo(
    $id: ID!
    $parentBlockId: ID!
    $journeyId: ID!
  ) {
    blockDelete(id: $id, parentBlockId: $parentBlockId, journeyId: $journeyId) {
      id
    }
  }
`

export const CARD_BLOCK_COVER_VIDEO_UPDATE = gql`
  mutation CardBlockBackgroundVideoUpdate(
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

export const CARD_BLOCK_COVER_VIDEO_BLOCK_CREATE = gql`
  mutation CardBlockVideoBlockCreate($input: VideoBlockCreateInput!) {
    videoBlockCreate(input: $input) {
      id
      title
      startAt
      endAt
      muted
      autoplay
      videoContent {
        src
      }
      posterBlockId
    }
  }
`

export const CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE = gql`
  mutation CardBlockVideoBlockUpdate(
    $id: ID!
    $journeyId: ID!
    $input: VideoBlockUpdateInput!
  ) {
    videoBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      title
      startAt
      endAt
      muted
      autoplay
      videoContent {
        src
      }
      posterBlockId
    }
  }
`

interface BackgroundMediaVideoProps {
  cardBlock: TreeBlock<CardBlock>
  debounceTime?: number
}

export function BackgroundMediaVideo({
  cardBlock,
  debounceTime = 1000
}: BackgroundMediaVideoProps): ReactElement {
  const coverBlock =
    (cardBlock?.children.find(
      (child) => child.id === cardBlock?.coverBlockId
    ) as TreeBlock<ImageBlock> | TreeBlock<VideoBlock>) ?? null

  const [tabValue, setTabValue] = useState(0)
  const [cardBlockUpdate] = useMutation<CardBlockBackgroundVideoUpdate>(
    CARD_BLOCK_COVER_VIDEO_UPDATE
  )
  const [VideoBlockCreate] = useMutation<CardBlockVideoBlockCreate>(
    CARD_BLOCK_COVER_VIDEO_BLOCK_CREATE
  )
  const [VideoBlockUpdate] = useMutation<CardBlockVideoBlockUpdate>(
    CARD_BLOCK_COVER_VIDEO_BLOCK_UPDATE
  )
  const [blockDelete] = useMutation<BlockDeleteForBackgroundVideo>(
    BLOCK_DELETE_FOR_BACKGROUND_VIDEO
  )
  const { id: journeyId } = useJourney()
  const [videoBlock, setVideoBlock] = useState(
    coverBlock?.__typename === 'VideoBlock' ? coverBlock : null
  )
  const [videoSrc, setVideoSrc] = useState(videoBlock?.videoContent?.src)
  const [saveState, setSaveState] = useState(false)

  const [imageBlock, setImageBlock] = useState(
    coverBlock?.children.find(
      (child) => child.id === (coverBlock as VideoBlock).posterBlockId
    ) as ImageBlock | null
  )

  const secondsToTimeFormat = (seconds: number): string => {
    const date = new Date(seconds * 1000)
    return date.toISOString().substring(11, 19)
  }

  const timeFormatToSeconds = (time: string): number => {
    const [hours, minutes, seconds] = time.split(':')
    return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
  }

  const [startAt] = useState(secondsToTimeFormat(videoBlock?.startAt ?? 0))

  const [endAt] = useState(secondsToTimeFormat(videoBlock?.endAt ?? 0))

  const handleTabChange = (event, newValue): void => {
    setTabValue(newValue)
  }

  const handleTimeChange = async (
    target: string,
    time: string
  ): Promise<void> => {
    const block = {
      ...videoBlock,
      [target]: timeFormatToSeconds(time)
    }
    setVideoBlock(block as TreeBlock<VideoBlock>)
    await handleChangeDebounced(block as TreeBlock<VideoBlock>)
  }

  const handleVideoSrcClick = async (): Promise<void> => {
    setSaveState(false)
    if (videoSrc == null) return
    const block =
      videoBlock == null
        ? {
            parentBlockId: cardBlock.id,
            __typename: 'VideoBlock',
            title: videoSrc,
            autoplay: true,
            muted: cardBlock.parentOrder === 0,
            startAt: 0,
            endAt: null,
            posterBlockId: null,
            videoContent: {
              src: videoSrc
            }
          }
        : {
            ...videoBlock,
            videoContent: { src: videoSrc }
          }
    setVideoBlock(block as TreeBlock<VideoBlock>)
    await handleChange(block as TreeBlock<VideoBlock>)
    setSaveState(true)
  }
  const handleVideoSrcChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    setVideoSrc(event.target.value)
  }

  const handleVideoDelete = async (): Promise<void> => {
    setImageBlock(null)
    setVideoBlock(null)
    setTabValue(0)
    await deleteCoverBlock()
  }

  const handleSwitchChange = async (
    event: ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const block = {
      ...videoBlock,
      [event.target.name]: event.target.checked
    }
    setVideoBlock(block as TreeBlock<VideoBlock>)
    await handleChange(block as TreeBlock<VideoBlock>)
  }

  const deleteCoverBlock = async (): Promise<void> => {
    await blockDelete({
      variables: {
        id: coverBlock.id,
        parentBlockId: coverBlock.parentBlockId,
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

  const createVideoBlock = async (block): Promise<void> => {
    const { data } = await VideoBlockCreate({
      variables: {
        input: {
          journeyId: journeyId,
          parentBlockId: cardBlock.id,
          title: block.title ?? block.videoContent.src,
          startAt: block.startAt,
          endAt: (block.endAt ?? 0) > (block.startAt ?? 0) ? block.endAt : null,
          muted: block.muted,
          autoplay: block.autoplay,
          posterBlockId: block.posterBlockId,
          videoContent: block.videoContent
        }
      },
      update(cache, { data }) {
        if (data?.videoBlockCreate != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journeyId }),
            fields: {
              blocks(existingBlockRefs = []) {
                const newBlockRef = cache.writeFragment({
                  id: `VideoBlock:${data.videoBlockCreate.id}`,
                  data: data.videoBlockCreate,
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
    await cardBlockUpdate({
      variables: {
        id: cardBlock.id,
        journeyId: journeyId,
        input: {
          coverBlockId: data?.videoBlockCreate?.id ?? null
        }
      },
      optimisticResponse: {
        cardBlockUpdate: {
          id: cardBlock.id,
          coverBlockId: data?.videoBlockCreate?.id ?? null,
          __typename: 'CardBlock'
        }
      }
    })
  }

  const updateVideoBlock = async (block): Promise<void> => {
    if (block == null) return

    const videoContent = {
      src: block.videoContent.src,
      __typename: block.videoContent.__typename ?? 'VideoGeneric'
    }
    let variables: {
      id: string
      journeyId: string
      input: VideoBlockUpdateInput
    } = {
      id: coverBlock.id,
      journeyId: journeyId,
      input: {
        title: block.title,
        startAt: block.startAt,
        endAt: (block.endAt ?? 0) > (block.startAt ?? 0) ? block.endAt : null,
        muted: block.muted,
        autoplay: block.autoplay,
        posterBlockId: block.posterBlockId
      }
    }
    // Don't update Arclight with src
    if (
      videoContent.src !==
      (coverBlock as TreeBlock<VideoBlock>).videoContent.src
    ) {
      variables = {
        ...variables,
        input: { ...variables.input, videoContent: { src: videoContent.src } }
      }
    }
    await VideoBlockUpdate({
      variables,
      optimisticResponse: {
        videoBlockUpdate: {
          id: coverBlock.id,
          __typename: 'VideoBlock',
          title: block.title,
          startAt: block.startAt,
          endAt: (block.endAt ?? 0) > (block.startAt ?? 0) ? block.endAt : null,
          muted: block.muted,
          autoplay: block.autoplay,
          posterBlockId: block.posterBlockId,
          videoContent: videoContent
        }
      }
    })
  }

  const handleChange = async (block: TreeBlock<VideoBlock>): Promise<void> => {
    if (
      coverBlock != null &&
      coverBlock?.__typename.toString() !== 'VideoBlock'
    ) {
      // remove existing cover block if type changed
      await deleteCoverBlock()
    }
    if (videoBlock == null) {
      await createVideoBlock(block)
    } else {
      await updateVideoBlock(block)
    }
  }

  const handleChangeDebounced = debounce(handleChange, debounceTime)

  return (
    <>
      <Box sx={{ px: 6, py: 4 }}>
        {(coverBlock as TreeBlock<VideoBlock>)?.videoContent?.src != null && (
          <Stack
            direction="row"
            spacing="3"
            justifyContent="space-between"
            data-testid="videoSrcStack"
          >
            <div
              style={{
                overflow: 'hidden',
                borderRadius: 8,
                height: 55,
                width: 55
              }}
            >
              {imageBlock?.src != null && (
                <Image
                  src={imageBlock.src}
                  alt={imageBlock.alt}
                  width={55}
                  height={55}
                ></Image>
              )}
              {imageBlock?.src == null && (
                <Box
                  borderRadius={2}
                  sx={{
                    width: 55,
                    height: 55,
                    bgcolor: '#DCDDE5',
                    verticalAlign: 'center'
                  }}
                  justifyContent="center"
                >
                  <ImageIcon sx={{ marginTop: 4, marginLeft: 4 }}></ImageIcon>
                </Box>
              )}
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
                {(coverBlock as TreeBlock<VideoBlock>)?.videoContent.src}
              </Typography>
            </Stack>
            <Stack direction="column" justifyContent="center">
              <DeleteOutline
                data-testid="deleteVideo"
                color="primary"
                onClick={handleVideoDelete}
                style={{ cursor: 'pointer' }}
              ></DeleteOutline>
            </Stack>
          </Stack>
        )}
        {(coverBlock as TreeBlock<VideoBlock>)?.videoContent?.src == null && (
          <Stack
            direction="row"
            spacing={3}
            data-testid="videoPlaceholderStack"
          >
            <Box
              borderRadius={2}
              sx={{
                width: 55,
                height: 55,
                bgcolor: '#DCDDE5',
                verticalAlign: 'center'
              }}
              justifyContent="center"
            >
              <ImageIcon sx={{ marginTop: 4, marginLeft: 4 }}></ImageIcon>
            </Box>
            <Stack direction="column" justifyContent="center">
              <Typography variant="subtitle2">Select Video File</Typography>
              <Typography variant="caption">Formats: MP4, HLS</Typography>
            </Stack>
          </Stack>
        )}
      </Box>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="background tabs"
        centered
        variant="fullWidth"
      >
        <Tab label="Source" {...tabA11yProps('videSrc', 0)}></Tab>
        <Tab
          label="Settings"
          {...tabA11yProps('videoSettings', 1)}
          disabled={
            (coverBlock as TreeBlock<VideoBlock>)?.videoContent?.src == null
          }
        ></Tab>
      </Tabs>
      <TabPanel name="videoSrc" value={tabValue} index={0}>
        <Box sx={{ py: 3, width: '100%', textAlign: 'center' }}>
          <TextField
            variant="filled"
            value={videoSrc}
            onChange={handleVideoSrcChange}
            data-testid="videoSrcTextField"
            label="Paste URL of video..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon></LinkIcon>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <CheckCircle
                    style={{ cursor: 'pointer' }}
                    onClick={handleVideoSrcClick}
                    color={saveState ? 'primary' : 'secondary'}
                    data-testid="checkCircle"
                  ></CheckCircle>
                </InputAdornment>
              )
            }}
          ></TextField>
        </Box>
      </TabPanel>
      <TabPanel name="videoSettings" value={tabValue} index={1}>
        <Box sx={{ p: 3, width: '100%' }}>
          <Stack direction="column" spacing={3}>
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="column">
                <Typography variant="subtitle2">Autoplay</Typography>
                <Typography variant="caption">
                  Start video automatically when card appears
                </Typography>
              </Stack>
              <Switch
                checked={
                  (coverBlock as TreeBlock<VideoBlock>)?.autoplay ?? true
                }
                name="autoplay"
                onChange={handleSwitchChange}
              ></Switch>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="column">
                <Typography variant="subtitle2">Muted</Typography>
                <Typography variant="caption">
                  Video always muted on the first card
                </Typography>
              </Stack>
              <Switch
                checked={
                  (coverBlock as TreeBlock<VideoBlock>)?.muted ??
                  cardBlock?.parentOrder === 0
                }
                name="muted"
                onChange={handleSwitchChange}
              ></Switch>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-around">
              <TimeField
                showSeconds
                value={startAt}
                style={{ width: 120 }}
                onChange={async (event, time: string) =>
                  await handleTimeChange('startAt', time)
                }
                input={
                  <TextField
                    label="Starts At"
                    value={startAt}
                    variant="filled"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PlayCircle></PlayCircle>
                        </InputAdornment>
                      )
                    }}
                  />
                }
              />
              <TimeField
                showSeconds
                value={endAt}
                onChange={async (event, time: string) =>
                  await handleTimeChange('endAt', time)
                }
                style={{ width: 120 }}
                input={
                  <TextField
                    label="Ends At"
                    value={endAt}
                    variant="filled"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <StopCircle></StopCircle>
                        </InputAdornment>
                      )
                    }}
                  />
                }
              />
            </Stack>
            <Divider />
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
                    {imageBlock?.src != null && (
                      <Image
                        src={imageBlock.src}
                        alt={imageBlock.alt}
                        width={55}
                        height={55}
                      ></Image>
                    )}
                    {imageBlock?.src == null && (
                      <Box
                        borderRadius={2}
                        sx={{
                          width: 55,
                          height: 55,
                          verticalAlign: 'center'
                        }}
                        justifyContent="center"
                      >
                        <ImageIcon
                          sx={{ marginTop: 4, marginLeft: 4 }}
                        ></ImageIcon>
                      </Box>
                    )}
                  </div>
                  <Stack
                    direction="column"
                    justifyContent="center"
                    sx={{ paddingRight: 1 }}
                  >
                    <Create color="primary"></Create>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Stack>
        </Box>
      </TabPanel>
    </>
  )
}

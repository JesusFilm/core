import {} from '@apollo/client'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { styled } from '@mui/material/styles'
import { useTranslation } from 'next-i18next'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { ReactElement, useEffect, useState } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import type { TreeBlock } from '@core/journeys/ui/block'
import { setBeaconPageViewed } from '@core/journeys/ui/setBeaconPageViewed'
import Image3Icon from '@core/shared/ui/icons/Image3'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'
import { palette } from '@core/shared/ui/themes/journeysAdmin/tokens/colors'

import {
  BlockFields_CardBlock as CardBlock,
  BlockFields_ImageBlock as ImageBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../../../__generated__/BlockFields'
import { blockDeleteUpdate } from '../../../../../../../../../libs/blockDeleteUpdate'
import { blockRestoreUpdate } from '../../../../../../../../../libs/useBlockRestoreMutation'
import { useCoverBlockDeleteMutation } from '../../../../../../../../../libs/useCoverBlockDeleteMutation'
import { useCoverBlockRestoreMutation } from '../../../../../../../../../libs/useCoverBlockRestoreMutation'
import { BackgroundMediaVideo } from './Video/BackgroundMediaVideo'

const BackgroundMediaImage = dynamic(
  async () =>
    await import(
      /* webpackChunkName: "Editor/ControlPanel/Attributes/blocks/Card/BackgroundMedia/Image/BackgroundMediaImage" */ './Image/BackgroundMediaImage'
    ).then((mod) => mod.BackgroundMediaImage),
  { ssr: false }
)

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  '& .MuiToggleButtonGroup-grouped': {
    paddingLeft: 30,
    paddingRight: 30,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 8,
    backgroundColor: theme.palette[0],
    '&.Mui-selected': {
      backgroundColor: theme.palette[100],
      color: palette.error
    }
  }
}))

type BackgroundMediaBlockType = 'VideoBlock' | 'ImageBlock'

export function BackgroundMedia(): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const { add } = useCommand()
  const { journey } = useJourney()
  const router = useRouter()
  const {
    state: { selectedBlock }
  } = useEditor()
  const [deleteBlock] = useCoverBlockDeleteMutation()
  const [restoreBlock] = useCoverBlockRestoreMutation()

  const cardBlock = (
    selectedBlock?.__typename === 'CardBlock'
      ? selectedBlock
      : selectedBlock?.children.find(
          (child) => child.__typename === 'CardBlock'
        )
  ) as TreeBlock<CardBlock>
  const coverBlock = cardBlock?.children.find(
    (child) => child.id === cardBlock?.coverBlockId
  ) as TreeBlock<ImageBlock> | TreeBlock<VideoBlock> | undefined
  const [blockType, setBlockType] = useState<BackgroundMediaBlockType>(
    coverBlock?.__typename ?? 'VideoBlock'
  )

  useEffect(() => {
    if (coverBlock?.__typename === 'VideoBlock') {
      setBlockType('VideoBlock')
    } else if (coverBlock?.__typename === 'ImageBlock') {
      setBlockType('ImageBlock')
    }
  }, [coverBlock?.__typename])

  async function handleTypeChange(
    _,
    newBlockType: BackgroundMediaBlockType | null
  ): Promise<void> {
    if (newBlockType == null || journey == null) return

    setBlockType(newBlockType)

    if (coverBlock != null) {
      await add({
        parameters: {
          execute: {},
          undo: {}
        },
        async execute() {
          await deleteBlock({
            variables: {
              id: coverBlock.id,
              cardBlockId: cardBlock.id
            },
            optimisticResponse: {
              blockDelete: [coverBlock],
              cardBlockUpdate: {
                id: cardBlock.id,
                coverBlockId: null,
                __typename: 'CardBlock'
              }
            },
            update(cache, { data }) {
              blockDeleteUpdate(
                coverBlock,
                data?.blockDelete,
                cache,
                journey.id
              )
            }
          })
        },
        async undo() {
          await restoreBlock({
            variables: {
              id: coverBlock.id,
              cardBlockId: cardBlock.id
            },
            optimisticResponse: {
              blockRestore: [coverBlock],
              cardBlockUpdate: {
                id: cardBlock.id,
                coverBlockId: coverBlock.id,
                __typename: 'CardBlock'
              }
            },
            update(cache, { data }) {
              blockRestoreUpdate(
                coverBlock,
                data?.blockRestore,
                cache,
                journey.id
              )
            }
          })
        }
      })
    }

    const param =
      newBlockType === 'VideoBlock' ? 'background-video' : 'background-image'
    void router.push({ query: { ...router.query, param } }, undefined, {
      shallow: true
    })
    router.events.on('routeChangeComplete', () => {
      setBeaconPageViewed(param)
    })
  }

  return (
    <>
      <Box sx={{ width: '100%', textAlign: 'center', pb: 3, px: 4 }}>
        <StyledToggleButtonGroup
          value={blockType}
          onChange={handleTypeChange}
          aria-label="block type"
          exclusive
          fullWidth
        >
          <ToggleButton
            value="VideoBlock"
            aria-label="video"
            data-testid="bgvideo-video-tab"
          >
            <Stack direction="row" spacing="8px">
              <VideoOnIcon />
              <span>{t('Video')}</span>
            </Stack>
          </ToggleButton>
          <ToggleButton
            value="ImageBlock"
            aria-label="image"
            data-testid="bgvideo-image-tab"
          >
            <Stack direction="row" spacing="8px">
              <Image3Icon />
              <span>{t('Image')}</span>
            </Stack>
          </ToggleButton>
        </StyledToggleButtonGroup>
      </Box>
      {blockType === 'ImageBlock' && (
        <Box sx={{ p: 4, pt: 0 }}>
          <BackgroundMediaImage cardBlock={cardBlock} />
        </Box>
      )}
      {blockType === 'VideoBlock' && (
        <BackgroundMediaVideo cardBlock={cardBlock} />
      )}
    </>
  )
}

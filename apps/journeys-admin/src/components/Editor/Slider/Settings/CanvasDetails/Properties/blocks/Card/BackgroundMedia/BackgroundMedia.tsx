import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { ReactElement, useEffect, useState } from 'react'

import { setBeaconPageViewed } from '@core/journeys/ui/beaconHooks'
import type { TreeBlock } from '@core/journeys/ui/block'
import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
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
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: theme.palette[0],
    '&.Mui-selected': {
      backgroundColor: theme.palette[100],
      color: palette.error
    },
    '&.MuiToggleButtonGroup-firstButton': {
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8
    },
    '&.MuiToggleButtonGroup-lastButton': {
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8
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
  ) as TreeBlock<CardBlock> | undefined
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

  function handleTypeChange(
    _,
    newBlockType: BackgroundMediaBlockType | null
  ): void {
    if (newBlockType == null || journey == null || cardBlock == null) return

    setBlockType(newBlockType)

    if (coverBlock != null) {
      add({
        parameters: {
          execute: {},
          undo: {}
        },
        execute() {
          void deleteBlock({
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
        undo() {
          void restoreBlock({
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
            {t('Video')}
          </ToggleButton>
          <ToggleButton
            value="ImageBlock"
            aria-label="image"
            data-testid="bgvideo-image-tab"
          >
            {t('Image')}
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

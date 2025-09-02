import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

import type {
  BlockFields_CardBlock as CardBlock,
  BlockFields_VideoBlock as VideoBlock
} from '../../../../../../../../__generated__/BlockFields'
import { VideoBlockSource } from '../../../../../../../../__generated__/globalTypes'
import type { VideoBlockCreate } from '../../../../../../../../__generated__/VideoBlockCreate'
import { blockCreateUpdate } from '../../../../../utils/blockCreateUpdate'
import { useBlockCreateCommand } from '../../../../../utils/useBlockCreateCommand'
import { Button } from '../Button'

interface NewVideoButtonProps {
  disabled?: boolean
}

export const VIDEO_BLOCK_CREATE = gql`
  ${VIDEO_FIELDS}
  mutation VideoBlockCreate($input: VideoBlockCreateInput!) {
    videoBlockCreate(input: $input) {
      ...VideoFields
    }
  }
`

export function NewVideoButton({
  disabled = false
}: NewVideoButtonProps): ReactElement {
  const { t } = useTranslation('apps-journeys-admin')
  const [videoBlockCreate, { loading }] =
    useMutation<VideoBlockCreate>(VIDEO_BLOCK_CREATE)
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()
  const { addBlock } = useBlockCreateCommand()

  function handleClick(): void {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    if (card == null || journey == null) return

    const video: TreeBlock<VideoBlock> = {
      id: uuidv4(),
      parentBlockId: card.id,
      parentOrder: 0,
      muted: false,
      autoplay: true,
      startAt: null,
      endAt: null,
      posterBlockId: null,
      fullsize: true,
      videoId: null,
      videoVariantLanguageId: null,
      source: VideoBlockSource.internal,
      title: null,
      description: null,
      image: null,
      duration: null,
      objectFit: null,
      mediaVideo: null,
      action: null,
      __typename: 'VideoBlock',
      children: []
    }
    addBlock({
      block: video,
      execute() {
        void videoBlockCreate({
          variables: {
            input: {
              id: video.id,
              journeyId: journey.id,
              parentBlockId: video.parentBlockId,
              autoplay: video.autoplay,
              muted: video.muted,
              fullsize: video.fullsize
            }
          },
          optimisticResponse: {
            videoBlockCreate: video
          },
          update(cache, { data }) {
            blockCreateUpdate(cache, journey?.id, data?.videoBlockCreate)
          }
        })
      }
    })
  }

  return (
    <Button
      icon={<VideoOnIcon />}
      value={t('Video')}
      onClick={handleClick}
      testId="NewVideoButton"
      disabled={disabled || loading}
    />
  )
}

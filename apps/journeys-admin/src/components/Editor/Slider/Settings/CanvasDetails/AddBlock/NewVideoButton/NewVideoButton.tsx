import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'
import type { TreeBlock } from '@core/journeys/ui/block'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

import { VideoBlockSource } from 'libs/journeys/ui/__generated__/globalTypes'
import type { BlockFields_CardBlock as CardBlock } from '../../../../../../../../__generated__/BlockFields'
import type { VideoBlockCreate } from '../../../../../../../../__generated__/VideoBlockCreate'
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
    state: { selectedStep },
    dispatch
  } = useEditor()
  const { addBlock } = useBlockCreateCommand()

  async function handleClick(): Promise<void> {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    if (card != null && journey != null) {
      const id = uuidv4()
      dispatch({
        type: 'SetSelectedBlockByIdAction',
        selectedBlockId: id
      })
      await addBlock({
        async execute() {
          const { data } = await videoBlockCreate({
            variables: {
              input: {
                id,
                journeyId: journey.id,
                parentBlockId: card.id,
                autoplay: true,
                muted: false,
                fullsize: true
              }
            },
            optimisticResponse: {
              videoBlockCreate: {
                id,
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
                video: null,
                action: null,
                __typename: 'VideoBlock'
              }
            },
            update(cache, { data }) {
              if (data?.videoBlockCreate != null) {
                cache.modify({
                  id: cache.identify({ __typename: 'Journey', id: journey.id }),
                  fields: {
                    blocks(existingBlockRefs = []) {
                      const newBlockRef = cache.writeFragment({
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
          return data?.videoBlockCreate
        }
      })
    }
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

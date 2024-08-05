import { gql, useMutation } from '@apollo/client'
import { useTranslation } from 'next-i18next'
import type { ReactElement } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'
import VideoOnIcon from '@core/shared/ui/icons/VideoOn'

import type { BlockFields_CardBlock as CardBlock } from '../../../../../../../../__generated__/BlockFields'
import type { VideoBlockCreate } from '../../../../../../../../__generated__/VideoBlockCreate'
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

  const handleClick = async (): Promise<void> => {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    if (card != null && journey != null) {
      const { data } = await videoBlockCreate({
        variables: {
          input: {
            journeyId: journey.id,
            parentBlockId: card.id,
            autoplay: true,
            muted: false,
            fullsize: true
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
      if (data?.videoBlockCreate != null) {
        dispatch({
          type: 'SetSelectedBlockByIdAction',
          selectedBlockId: data.videoBlockCreate.id
        })
      }
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

import { gql, useMutation } from '@apollo/client'
import ButtonBase from '@mui/material/ButtonBase'
import Image from 'next/image'
import type { ReactElement } from 'react'

import { useEditor } from '@core/journeys/ui/EditorProvider'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { VIDEO_FIELDS } from '@core/journeys/ui/Video/videoFields'

import type {
  CardVideoCreate,
  CardVideoCreateVariables
} from '../../../../../../../../../__generated__/CardVideoCreate'
import { VideoBlockSource } from '../../../../../../../../../__generated__/globalTypes'

import cardVideoImage from './cardVideo.svg'

export const CARD_VIDEO_CREATE = gql`
  ${VIDEO_FIELDS}
  mutation CardVideoCreate($videoInput: VideoBlockCreateInput!) {
    video: videoBlockCreate(input: $videoInput) {
      ...VideoFields
    }
  }
`

export function CardVideo(): ReactElement {
  const { journey } = useJourney()
  const {
    state: { selectedStep }
  } = useEditor()

  const [cardVideoCreate] = useMutation<
    CardVideoCreate,
    CardVideoCreateVariables
  >(CARD_VIDEO_CREATE)

  const handleClick = async (): Promise<void> => {
    const cardId = selectedStep?.children[0].id
    if (journey == null || cardId == null) return
    await cardVideoCreate({
      variables: {
        videoInput: {
          journeyId: journey.id,
          parentBlockId: cardId,
          videoId: '1_jf-0-0',
          videoVariantLanguageId: '529',
          startAt: 2048,
          endAt: 2058,
          autoplay: true,
          muted: false,
          source: VideoBlockSource.internal
        }
      },
      update(cache, { data }) {
        if (data != null) {
          cache.modify({
            id: cache.identify({ __typename: 'Journey', id: journey.id }),
            fields: {
              blocks(existingBlockRefs = []) {
                const NEW_BLOCK_FRAGMENT = gql`
                  fragment NewBlock on Block {
                    id
                  }
                `
                return [
                  ...existingBlockRefs,
                  cache.writeFragment({
                    data: data.video,
                    fragment: NEW_BLOCK_FRAGMENT
                  })
                ]
              }
            }
          })
        }
      }
    })
  }

  return (
    <ButtonBase sx={{ borderRadius: 5 }} onClick={handleClick}>
      <Image
        width={128}
        height={192}
        layout="responsive"
        src={cardVideoImage}
        alt="Card Video Template"
        draggable={false}
      />
    </ButtonBase>
  )
}

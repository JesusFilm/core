import { ReactElement } from 'react'
import { gql, useMutation } from '@apollo/client'
import {
  ActiveTab,
  useEditor,
  TreeBlock,
  VIDEO_FIELDS
} from '@core/journeys/ui'
import VideocamRounded from '@mui/icons-material/VideocamRounded'
import { useJourney } from '../../../../../libs/context'
import { Button } from '../../Button'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../__generated__/GetJourney'
import { VideoBlockCreate } from '../../../../../../__generated__/VideoBlockCreate'

export const VIDEO_BLOCK_CREATE = gql`
  ${VIDEO_FIELDS}
  mutation VideoBlockCreate($input: VideoBlockCreateInput!) {
    videoBlockCreate(input: $input) {
      ...VideoFields
    }
  }
`

export function NewVideoButton(): ReactElement {
  const [videoBlockCreate] = useMutation<VideoBlockCreate>(VIDEO_BLOCK_CREATE)
  const journey = useJourney()
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
          id: data.videoBlockCreate.id
        })
        dispatch({
          type: 'SetActiveTabAction',
          activeTab: ActiveTab.Properties
        })
      }
    }
  }

  return (
    <Button icon={<VideocamRounded />} value="Video" onClick={handleClick} />
  )
}

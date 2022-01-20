import { ReactElement, useContext } from 'react'
import { gql, useMutation } from '@apollo/client'
import {
  ActiveTab,
  EditorContext,
  transformer,
  TreeBlock,
  VIDEO_FIELDS
} from '@core/journeys/ui'
import VideocamRounded from '@mui/icons-material/VideocamRounded'
import { Button } from '../../Button'
import { GetJourneyForEdit_journey_blocks_CardBlock as CardBlock } from '../../../../../../__generated__/GetJourneyForEdit'
import { VideoBlockCreate } from '../../../../../../__generated__/VideoBlockCreate'

const VIDEO_BLOCK_CREATE = gql`
  ${VIDEO_FIELDS}
  mutation VideoBlockCreate($input: VideoBlockCreateInput!) {
    videoBlockCreate(input: $input) {
      id
      parentBlockId
      journeyId
      ...VideoFields
    }
  }
`

export function Video(): ReactElement {
  const [videoBlockCreate] = useMutation<VideoBlockCreate>(VIDEO_BLOCK_CREATE)
  const {
    state: { journey, selectedStep },
    dispatch
  } = useContext(EditorContext)

  const handleClick = async (): Promise<void> => {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    if (card != null) {
      const { data } = await videoBlockCreate({
        variables: {
          input: {
            journeyId: journey.id,
            parentBlockId: card.id,
            autoplay: true,
            muted: false,
            videoContent: {
              src: null
            },
            title: ''
          }
        }
      })
      console.log(data)
      if (data?.videoBlockCreate != null) {
        dispatch({
          type: 'SetActiveTabAction',
          activeTab: ActiveTab.Properties
        })
        dispatch({
          type: 'SetSelectedBlockAction',
          block: transformer([data.videoBlockCreate])[0]
        })
      }
    }
  }

  return (
    <Button icon={<VideocamRounded />} value="Video" onClick={handleClick} />
  )
}

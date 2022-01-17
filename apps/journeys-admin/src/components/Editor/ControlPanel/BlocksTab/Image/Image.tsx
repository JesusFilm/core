import { gql, useMutation } from '@apollo/client'
import {
  ActiveTab,
  EditorContext,
  IMAGE_FIELDS,
  transformer,
  TreeBlock
} from '@core/journeys/ui'
import InsertPhotoRounded from '@mui/icons-material/InsertPhotoRounded'
import { GetJourneyForEdit_journey_blocks_ImageBlock as ImageBlock } from 'apps/journeys-admin/__generated__/GetJourneyForEdit'
import { ImageBlockCreate } from '../../../../../../__generated__/ImageBlockCreate'
import { ReactElement, useContext } from 'react'
import { Button } from '../../Button'

const IMAGE_BLOCK_CREATE = gql`
  mutation ImageBlockCreate($input: ImageBlockCreateInput!) {
    ${IMAGE_FIELDS}
    imageBlockCreate(input: $input) {
      id
      journeyId
      parentBlockId
      ...ImageFields
    }
  }
`

export function Image(): ReactElement {
  const [imageBlockCreate] = useMutation<ImageBlockCreate>(IMAGE_BLOCK_CREATE)
  const {
    state: { selectedStep },
    dispatch
  } = useContext(EditorContext)

  const handleClick = async (): Promise<void> => {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'ImageBlock'
    ) as TreeBlock<ImageBlock> | undefined
    if (card != null) {
      imageBlockCreate({
        variables: {
          input: {
            journeyId: card.journeyId,
            parentBlockId: card.id,
            src: '',
            alt: ''
          }
        }
      }).then(({ data }) => {
        if (data?.imageBlockCreate != null) {
          dispatch({
            type: 'SetActiveTabAction',
            activeTab: ActiveTab.Properties
          })
          dispatch({
            type: 'SetSelectedBlockAction',
            block: transformer([data.imageBlockCreate])[0]
          })
        }
      })
    }
  }

  return (
    <Button icon={<InsertPhotoRounded />} value="Image" onClick={handleClick} />
  )
}

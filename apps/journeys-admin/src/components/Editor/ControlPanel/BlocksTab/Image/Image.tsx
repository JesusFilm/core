import { gql, useMutation } from '@apollo/client'
import {
  ActiveTab,
  EditorContext,
  IMAGE_FIELDS,
  transformer,
  TreeBlock
} from '@core/journeys/ui'
import InsertPhotoRounded from '@mui/icons-material/InsertPhotoRounded'
import { GetJourneyForEdit_journey_blocks_CardBlock as CardBlock } from '../../../../../../__generated__/GetJourneyForEdit'
import { ImageBlockCreate } from '../../../../../../__generated__/ImageBlockCreate'
import { ReactElement, useContext } from 'react'
import { Button } from '../../Button'
import DefaultImageIcon from '../../../../../../public/DefaultImageIcon.svg'
const IMAGE_BLOCK_CREATE = gql`
  ${IMAGE_FIELDS}
  mutation ImageBlockCreate($input: ImageBlockCreateInput!) {
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
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    // Do I pass this in as a src prop?
    // DefaultImageIcon
    if (card != null) {
      const { data } = await imageBlockCreate({
        variables: {
          input: {
            journeyId: card.journeyId,
            parentBlockId: card.id,
            src: 'Insert image URL',
            alt: 'Default Image Icon'
          }
        }
      })
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
    }
  }

  return (
    <Button icon={<InsertPhotoRounded />} value="Image" onClick={handleClick} />
  )
}

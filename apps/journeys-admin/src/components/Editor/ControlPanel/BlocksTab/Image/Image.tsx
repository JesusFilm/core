import { gql, useMutation } from '@apollo/client'
import {
  ActiveTab,
  EditorContext,
  IMAGE_FIELDS,
  transformer,
  TreeBlock
} from '@core/journeys/ui'
import InsertPhotoRounded from '@mui/icons-material/InsertPhotoRounded'
import { useJourney } from '../../../../../libs/context'
import { ReactElement, useContext } from 'react'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../__generated__/GetJourney'
import { ImageBlockCreate } from '../../../../../../__generated__/ImageBlockCreate'
import { Button } from '../../Button'

export const IMAGE_BLOCK_CREATE = gql`
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
  const { id: journeyId } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useContext(EditorContext)

  const handleClick = async (): Promise<void> => {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    if (card != null) {
      const { data } = await imageBlockCreate({
        variables: {
          input: {
            journeyId,
            parentBlockId: card.id,
            src: null,
            alt: 'Default Image Icon'
          }
        },
        update(cache, { data }) {
          if (data?.imageBlockCreate != null) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journeyId }),
              fields: {
                blocks(existingBlockRefs = []) {
                  const newBlockRef = cache.writeFragment({
                    data: data.imageBlockCreate,
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

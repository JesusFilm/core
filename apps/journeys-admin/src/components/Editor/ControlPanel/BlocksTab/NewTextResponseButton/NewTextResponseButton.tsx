import { gql, useMutation } from '@apollo/client'
import Crop169RoundedIcon from '@mui/icons-material/Crop169Rounded' // icon-replace: no icon serves similar purpose
import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'

import type { TreeBlock } from '@core/journeys/ui/block'
import { ActiveTab, useEditor } from '@core/journeys/ui/EditorProvider'
import { ICON_FIELDS } from '@core/journeys/ui/Icon/iconFields'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { TEXT_RESPONSE_FIELDS } from '@core/journeys/ui/TextResponse/textResponseFields'

import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../__generated__/GetJourney'
import { TextResponseBlockCreate } from '../../../../../../__generated__/TextResponseBlockCreate'
import { Button } from '../../Button'

export const TEXT_RESPONSE_BLOCK_CREATE = gql`
  ${TEXT_RESPONSE_FIELDS}
  ${ICON_FIELDS}
  mutation TextResponseBlockCreate(
    $input: TextResponseBlockCreateInput!
    $iconBlockCreateInput: IconBlockCreateInput!
    $id: ID!
    $journeyId: ID!
    $updateInput: TextResponseBlockUpdateInput!
  ) {
    textResponseBlockCreate(input: $input) {
      id
      parentBlockId
      parentOrder
      ...TextResponseFields
    }
    submitIcon: iconBlockCreate(input: $iconBlockCreateInput) {
      id
      parentBlockId
      ...IconFields
    }
    textResponseBlockUpdate(
      id: $id
      journeyId: $journeyId
      input: $updateInput
    ) {
      ...TextResponseFields
    }
  }
`

export function NewTextResponseButton(): ReactElement {
  const [textResponseBlockCreate] = useMutation<TextResponseBlockCreate>(
    TEXT_RESPONSE_BLOCK_CREATE
  )
  const { journey } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()

  const handleClick = async (): Promise<void> => {
    const id = uuidv4()
    const submitIconId = uuidv4()
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined

    if (card != null && journey != null) {
      const { data } = await textResponseBlockCreate({
        variables: {
          input: {
            id,
            journeyId: journey.id,
            parentBlockId: card.id,
            label: 'Your answer here',
            submitLabel: 'Submit'
          },
          iconBlockCreateInput: {
            id: submitIconId,
            journeyId: journey.id,
            parentBlockId: id,
            name: null
          },
          id,
          journeyId: journey.id,
          updateInput: {
            submitIconId
          }
        },
        update(cache, { data }) {
          if (data?.textResponseBlockUpdate != null) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journey.id }),
              fields: {
                blocks(existingBlockRefs = []) {
                  const newSubmitIconBlockRef = cache.writeFragment({
                    data: data.submitIcon,
                    fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                  })

                  const newBlockRef = cache.writeFragment({
                    data: data.textResponseBlockUpdate,
                    fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                  })

                  return [
                    ...existingBlockRefs,
                    newBlockRef,
                    newSubmitIconBlockRef
                  ]
                }
              }
            })
          }
        }
      })

      if (data?.textResponseBlockCreate != null) {
        dispatch({
          type: 'SetSelectedBlockByIdAction',
          id: data.textResponseBlockCreate.id
        })
        dispatch({
          type: 'SetActiveTabAction',
          activeTab: ActiveTab.Properties
        })
      }
    }
  }
  return (
    <Button
      icon={<Crop169RoundedIcon />}
      value="Feedback"
      onClick={handleClick}
    />
  )
}

import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'
import TouchAppRounded from '@mui/icons-material/TouchAppRounded'
import {
  ActiveTab,
  BUTTON_FIELDS,
  ICON_FIELDS,
  TreeBlock,
  useEditor
} from '@core/journeys/ui'
import { gql, useMutation } from '@apollo/client'
import { Button } from '../../Button'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../__generated__/GetJourney'
import { ButtonBlockCreate } from '../../../../../../__generated__/ButtonBlockCreate'
import {
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  IconName
} from '../../../../../../__generated__/globalTypes'
import { useJourney } from '../../../../../libs/context'

export const BUTTON_BLOCK_CREATE = gql`
  ${BUTTON_FIELDS}
  ${ICON_FIELDS}
  mutation ButtonBlockCreate(
    $input: ButtonBlockCreateInput!
    $iconBlockCreateInput1: IconBlockCreateInput!
    $iconBlockCreateInput2: IconBlockCreateInput!
    $id: ID!
    $journeyId: ID!
    $updateInput: ButtonBlockUpdateInput!
  ) {
    buttonBlockCreate(input: $input) {
      id
    }
    startIcon: iconBlockCreate(input: $iconBlockCreateInput1) {
      ...IconFields
    }
    endIcon: iconBlockCreate(input: $iconBlockCreateInput2) {
      ...IconFields
    }
    buttonBlockUpdate(id: $id, journeyId: $journeyId, input: $updateInput) {
      ...ButtonFields
    }
  }
`

export function NewButtonButton(): ReactElement {
  const [buttonBlockCreate] =
    useMutation<ButtonBlockCreate>(BUTTON_BLOCK_CREATE)
  const { id: journeyId } = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()

  const handleClick = async (): Promise<void> => {
    const id = uuidv4()
    const startId = uuidv4()
    const endId = uuidv4()
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    if (card != null) {
      const { data } = await buttonBlockCreate({
        variables: {
          input: {
            id,
            journeyId,
            parentBlockId: card.id,
            label: 'Edit Text...',
            variant: ButtonVariant.contained,
            color: ButtonColor.primary,
            size: ButtonSize.medium
          },
          iconBlockCreateInput1: {
            id: startId,
            journeyId,
            parentBlockId: id,
            name: IconName.None
          },
          iconBlockCreateInput2: {
            id: endId,
            journeyId,
            parentBlockId: id,
            name: IconName.None
          },
          id,
          journeyId,
          updateInput: {
            startIconId: startId,
            endIconId: endId
          }
        },
        update(cache, { data }) {
          if (data?.buttonBlockUpdate != null) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journeyId }),
              fields: {
                blocks(existingBlockRefs = []) {
                  const newStartIconBlockRef = cache.writeFragment({
                    data: data.startIcon,
                    fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                  })
                  const newEndIconBlockRef = cache.writeFragment({
                    data: data.endIcon,
                    fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                  })
                  const newBlockRef = cache.writeFragment({
                    data: data.buttonBlockUpdate,
                    fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                  })
                  return [
                    ...existingBlockRefs,
                    newBlockRef,
                    newStartIconBlockRef,
                    newEndIconBlockRef
                  ]
                }
              }
            })
          }
        }
      })
      if (data?.buttonBlockUpdate != null) {
        dispatch({
          type: 'SetSelectedBlockByIdAction',
          id: data.buttonBlockCreate.id
        })
        dispatch({
          type: 'SetActiveTabAction',
          activeTab: ActiveTab.Properties
        })
      }
    }
  }

  return (
    <Button icon={<TouchAppRounded />} value="Button" onClick={handleClick} />
  )
}

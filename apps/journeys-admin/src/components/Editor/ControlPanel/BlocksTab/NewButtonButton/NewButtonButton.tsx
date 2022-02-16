import { ReactElement } from 'react'
import RadioButtonCheckedRounded from '@mui/icons-material/RadioButtonCheckedRounded'
import {
  ActiveTab,
  BUTTON_FIELDS,
  TreeBlock,
  useEditor
} from '@core/journeys/ui'
import { gql, useMutation } from '@apollo/client'
import { Button } from '../../Button'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../__generated__/GetJourney'
import { ButtonBlockCreate } from '../../../../../../__generated__/ButtonBlockCreate'
import { ButtonVariant, ButtonColor, ButtonSize } from '../../../../../../__generated__/globalTypes'
import { useJourney } from '../../../../../libs/context'

export const BUTTON_BLOCK_CREATE = gql`
  ${BUTTON_FIELDS}
  mutation ButtonBlockCreate($input: ButtonBlockCreateInput!) {
    buttonBlockCreate(input: $input) {
      id
      parentBlockId
      parentOrder
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
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    if (card != null) {
      const { data } = await buttonBlockCreate({
        variables: {
          input: {
            journeyId,
            parentBlockId: card.id,
            label: 'Edit Text...',
            variant: ButtonVariant.contained,
            color: ButtonColor.primary,
            size: ButtonSize.medium
          }
        },
        update(cache, { data }) {
          if (data?.buttonBlockCreate != null) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journeyId }),
              fields: {
                blocks(existingBlockRefs = []) {
                  const newBlockRef = cache.writeFragment({
                    data: data.buttonBlockCreate,
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
      if (data?.buttonBlockCreate != null) {
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
    <Button
      icon={<RadioButtonCheckedRounded />}
      value="Button"
      onClick={handleClick}
    />
  )
}

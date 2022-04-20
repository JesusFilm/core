import { ReactElement } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { gql, useMutation } from '@apollo/client'
import {
  ActiveTab,
  useEditor,
  ICON_FIELDS,
  SIGN_UP_FIELDS,
  TreeBlock
} from '@core/journeys/ui'
import DraftsRounded from '@mui/icons-material/DraftsRounded'
import { useJourney } from '../../../../../libs/context'
import { GetJourney_journey_blocks_CardBlock as CardBlock } from '../../../../../../__generated__/GetJourney'
import { SignUpBlockCreate } from '../../../../../../__generated__/SignUpBlockCreate'
import { Button } from '../../Button'

export const SIGN_UP_BLOCK_CREATE = gql`
  ${SIGN_UP_FIELDS}
  ${ICON_FIELDS}
  mutation SignUpBlockCreate(
    $input: SignUpBlockCreateInput!
    $iconBlockCreateInput: IconBlockCreateInput!
    $id: ID!
    $journeyId: ID!
    $updateInput: SignUpBlockUpdateInput!
  ) {
    signUpBlockCreate(input: $input) {
      id
    }
    submitIcon: iconBlockCreate(input: $iconBlockCreateInput) {
      id
      parentBlockId
      ...IconFields
    }
    signUpBlockUpdate(id: $id, journeyId: $journeyId, input: $updateInput) {
      ...SignUpFields
    }
  }
`

export function NewSignUpButton(): ReactElement {
  const [signUpBlockCreate] =
    useMutation<SignUpBlockCreate>(SIGN_UP_BLOCK_CREATE)
  const journey = useJourney()
  const {
    state: { selectedStep },
    dispatch
  } = useEditor()

  const handleClick = async (): Promise<void> => {
    const id = uuidv4()
    const submitId = uuidv4()
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    if (card != null && journey != null) {
      const { data } = await signUpBlockCreate({
        variables: {
          input: {
            id,
            journeyId: journey.id,
            parentBlockId: card.id,
            submitLabel: 'Submit'
          },
          iconBlockCreateInput: {
            id: submitId,
            journeyId: journey.id,
            parentBlockId: id,
            name: null
          },
          id,
          journeyId: journey.id,
          updateInput: {
            submitIconId: submitId
          }
        },
        update(cache, { data }) {
          if (data?.signUpBlockUpdate != null) {
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
                    data: data.signUpBlockUpdate,
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
      if (data?.signUpBlockUpdate != null) {
        dispatch({
          type: 'SetSelectedBlockByIdAction',
          id: data.signUpBlockCreate.id
        })
        dispatch({
          type: 'SetActiveTabAction',
          activeTab: ActiveTab.Properties
        })
      }
    }
  }

  return (
    <Button icon={<DraftsRounded />} value="Subscribe" onClick={handleClick} />
  )
}

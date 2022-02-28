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
import { IconName } from '../../../../../../__generated__/globalTypes'
import { Button } from '../../Button'

export const SIGN_UP_BLOCK_CREATE = gql`
  ${SIGN_UP_FIELDS}
  ${ICON_FIELDS}
  mutation SignUpBlockCreate(
    $input: SignUpBlockCreateInput!
    $iconBlockCreateInput: IconBlockCreateInput!
  ) {
    signUpBlockCreate(input: $input) {
      id
      parentBlockId
      journeyId
      ...SignUpFields
    }
    submitIcon: iconBlockCreate(input: $iconBlockCreateInput) {
      id
      parentBlockId
      ...IconFields
    }
  }
`

export function NewSignUpButton(): ReactElement {
  const [signUpBlockCreate] =
    useMutation<SignUpBlockCreate>(SIGN_UP_BLOCK_CREATE)
  const { id: journeyId } = useJourney()
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
    if (card != null) {
      const { data } = await signUpBlockCreate({
        variables: {
          input: {
            id,
            journeyId,
            parentBlockId: card.id,
            submitLabel: 'Submit'
          },
          iconBlockCreateInput: {
            id: submitId,
            journeyId,
            parentBlockId: id,
            name: IconName.None
          }
        },
        update(cache, { data }) {
          if (data?.signUpBlockCreate != null) {
            cache.modify({
              id: cache.identify({ __typename: 'Journey', id: journeyId }),
              fields: {
                blocks(existingBlockRefs = []) {
                  const newBlockRef = cache.writeFragment({
                    data: data.signUpBlockCreate,
                    fragment: gql`
                      fragment NewBlock on Block {
                        id
                      }
                    `
                  })
                  const newSubmitIconBlockRef = cache.writeFragment({
                    data: data.endIcon,
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
      if (data?.signUpBlockCreate != null) {
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

import { gql, useMutation } from '@apollo/client'
import {
  ActiveTab,
  EditorContext,
  SIGN_UP_FIELDS,
  transformer,
  TreeBlock
} from '@core/journeys/ui'
import DraftsRounded from '@mui/icons-material/DraftsRounded'
import { ReactElement, useContext } from 'react'
import { GetJourneyForEdit_journey_blocks_CardBlock as CardBlock } from '../../../../../../__generated__/GetJourneyForEdit'
import { SignUpBlockCreate } from '../../../../../../__generated__/SignUpBlockCreate'
import { Button } from '../../Button'

const SIGN_UP_BLOCK_CREATE = gql`
  ${SIGN_UP_FIELDS}
  mutation SignUpBlockCreate($input: SignUpBlockCreateInput!) {
    signUpBlockCreate(input: $input) {
      id
      parentBlockId
      journeyId
      ...SignUpFields
    }
  }
`

export function SignUp(): ReactElement {
  const [signUpBlockCreate] =
    useMutation<SignUpBlockCreate>(SIGN_UP_BLOCK_CREATE)
  const {
    state: { journey, selectedStep },
    dispatch
  } = useContext(EditorContext)

  const handleClick = async (): Promise<void> => {
    const card = selectedStep?.children.find(
      (block) => block.__typename === 'CardBlock'
    ) as TreeBlock<CardBlock> | undefined
    if (card != null) {
      const { data } = await signUpBlockCreate({
        variables: {
          input: {
            journeyId: journey.id,
            parentBlockId: card.id,
            submitLabel: 'Submit'
          }
        }
      })
      if (data?.signUpBlockCreate != null) {
        dispatch({
          type: 'SetActiveTabAction',
          activeTab: ActiveTab.Properties
        })
        dispatch({
          type: 'SetSelectedBlockAction',
          block: transformer([data.signUpBlockCreate])[0]
        })
      }
    }
  }

  return (
    <Button icon={<DraftsRounded />} value="Subscribe" onClick={handleClick} />
  )
}

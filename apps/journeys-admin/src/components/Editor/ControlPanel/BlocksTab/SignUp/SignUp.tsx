import { gql } from '@apollo/client'
import { SIGN_UP_FIELDS } from '@core/journeys/ui'
import DraftsRounded from '@mui/icons-material/DraftsRounded'
import { ReactElement } from 'react'
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
  const handleClick = () => {
    console.log('SignUp')
  }

  return (
    <Button icon={<DraftsRounded />} value="Subscribe" onClick={handleClick} />
  )
}

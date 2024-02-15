import { gql, useMutation } from '@apollo/client'
import { ReactElement, useState } from 'react'

import type { TreeBlock } from '@core/journeys/ui/block'
import { useJourney } from '@core/journeys/ui/JourneyProvider'
import { SignUp } from '@core/journeys/ui/SignUp'

import { SignUpBlockUpdateContent } from '../../../../../../__generated__/SignUpBlockUpdateContent'
import { SignUpFields } from '../../../../../../__generated__/SignUpFields'
import { InlineEditInput } from '../InlineEditInput'
import { useOnClickOutside } from '../useOnClickOutside/useOnClickOutside'

export const SIGN_UP_BLOCK_UPDATE_CONTENT = gql`
  mutation SignUpBlockUpdateContent(
    $id: ID!
    $journeyId: ID!
    $input: SignUpBlockUpdateInput!
  ) {
    signUpBlockUpdate(id: $id, journeyId: $journeyId, input: $input) {
      id
      submitLabel
    }
  }
`
interface SignUpEditProps extends TreeBlock<SignUpFields> {}

export function SignUpEdit({
  id,
  submitLabel,
  ...signUpProps
}: SignUpEditProps): ReactElement {
  const [signUpBlockUpdate] = useMutation<SignUpBlockUpdateContent>(
    SIGN_UP_BLOCK_UPDATE_CONTENT
  )

  const { journey } = useJourney()
  const [value, setValue] = useState(submitLabel ?? '')

  async function handleSaveBlock(): Promise<void> {
    const currentSubmitLabel = value.trim().replace(/\n/g, '')
    if (journey == null || submitLabel === currentSubmitLabel) return

    await signUpBlockUpdate({
      variables: {
        id,
        journeyId: journey.id,
        input: { submitLabel: currentSubmitLabel }
      },
      optimisticResponse: {
        signUpBlockUpdate: {
          id,
          __typename: 'SignUpBlock',
          submitLabel: currentSubmitLabel
        }
      }
    })
  }
  const inputRef = useOnClickOutside(async () => await handleSaveBlock())

  const input = (
    <InlineEditInput
      name={`edit-${id}`}
      ref={inputRef}
      fullWidth
      multiline
      autoFocus
      onBlur={handleSaveBlock}
      value={value}
      onChange={(e) => {
        setValue(e.currentTarget.value)
      }}
      onClick={(e) => e.stopPropagation()}
    />
  )

  return (
    <SignUp
      {...signUpProps}
      id={id}
      submitLabel={submitLabel}
      editableSubmitLabel={input}
      sx={{
        '&:hover': {
          backgroundColor: 'primary.main'
        }
      }}
    />
  )
}

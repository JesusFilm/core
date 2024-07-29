import { gql, useMutation } from '@apollo/client'
import { Formik } from 'formik'
import { ReactElement } from 'react'

import { useCommand } from '@core/journeys/ui/CommandProvider'
import { useEditor } from '@core/journeys/ui/EditorProvider'
import { SignUp } from '@core/journeys/ui/SignUp'
import type { TreeBlock } from '@core/journeys/ui/block'
import { SubmitListener } from '@core/shared/ui/SubmitListener'

import {
  SignUpBlockUpdateContent,
  SignUpBlockUpdateContentVariables
} from '../../../../../../../../__generated__/SignUpBlockUpdateContent'
import { SignUpFields } from '../../../../../../../../__generated__/SignUpFields'
import { InlineEditInput } from '../InlineEditInput'

export const SIGN_UP_BLOCK_UPDATE_CONTENT = gql`
  mutation SignUpBlockUpdateContent(
    $id: ID!
    $input: SignUpBlockUpdateInput!
  ) {
    signUpBlockUpdate(id: $id, input: $input) {
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
  const [signUpBlockUpdate] = useMutation<
    SignUpBlockUpdateContent,
    SignUpBlockUpdateContentVariables
  >(SIGN_UP_BLOCK_UPDATE_CONTENT)

  const { add } = useCommand()
  const {
    state: { selectedBlock, selectedStep },
    dispatch
  } = useEditor()

  const initialValues: { [key: string]: string } = {
    [`edit-${id}`]: submitLabel ?? ''
  }

  type InitialValuesType = typeof initialValues

  async function handleSaveBlock(values: InitialValuesType): Promise<void> {
    const fieldValue = values[`edit-${id}`]
    const currentSubmitLabel = fieldValue.trim().replace(/\n/g, '')

    await add({
      parameters: {
        execute: {
          submitLabel: currentSubmitLabel
        },
        undo: {
          submitLabel
        }
      },
      async execute({ submitLabel }) {
        dispatch({
          type: 'SetEditorFocusAction',
          selectedBlock,
          selectedStep
        })

        await signUpBlockUpdate({
          variables: {
            id,
            input: { submitLabel }
          },
          optimisticResponse: {
            signUpBlockUpdate: {
              id,
              __typename: 'SignUpBlock',
              submitLabel
            }
          }
        })
      }
    })
  }

  const input = (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSaveBlock}
      enableReinitialize
    >
      {({ values, handleChange, setStatus }) => (
        <>
          <InlineEditInput
            name={`edit-${id}`}
            fullWidth
            multiline
            autoFocus
            onBlur={() => setStatus({ onBlurSubmit: true })}
            value={values[`edit-${id}`]}
            onChange={handleChange}
            onClick={(e) => e.stopPropagation()}
          />
          <SubmitListener />
        </>
      )}
    </Formik>
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

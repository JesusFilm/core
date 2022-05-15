import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock, JourneyProvider } from '@core/journeys/ui'
import { SnackbarProvider } from 'notistack'
import { SignUpFields } from '../../../../../../__generated__/SignUpFields'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { SignUpEdit, SIGN_UP_BLOCK_UPDATE_CONTENT } from '.'

describe('SignUpEdit', () => {
  const props: TreeBlock<SignUpFields> = {
    id: 'signUp.id',
    __typename: 'SignUpBlock',
    parentBlockId: 'card0.id',
    parentOrder: 1,
    submitLabel: 'Submit',
    submitIconId: null,
    action: null,
    children: []
  }
  it('selects the input on click', async () => {
    const { getByRole } = render(
      <MockedProvider>
        <SnackbarProvider>
          <SignUpEdit {...props} />
        </SnackbarProvider>
      </MockedProvider>
    )
    const input = getByRole('textbox', { name: '' })
    fireEvent.click(input)
    await waitFor(() => expect(input).toHaveFocus())
  })

  it('saves the signUp label on blur', async () => {
    const result = jest.fn(() => ({
      data: {
        signUpBlockUpdate: [
          {
            __typename: 'SignUpBlock',
            id: 'signUp.id',
            submitLabel: 'updated label'
          }
        ]
      }
    }))

    const { getByRole } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: SIGN_UP_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'signUp.id',
                journeyId: 'journeyId',
                input: {
                  submitLabel: 'updated label'
                }
              }
            },
            result
          }
        ]}
      >
        <SnackbarProvider>
          <JourneyProvider
            value={{
              journey: { id: 'journeyId' } as unknown as Journey,
              admin: true
            }}
          >
            <EditorProvider>
              <SignUpEdit {...props} />
            </EditorProvider>
          </JourneyProvider>
        </SnackbarProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox', { name: '' })
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '    updated label    ' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})

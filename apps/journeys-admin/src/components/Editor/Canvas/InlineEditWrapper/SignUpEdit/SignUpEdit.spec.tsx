import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { SignUpFields } from '../../../../../../__generated__/SignUpFields'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../../../libs/context'
import { SignUpEdit, SIGN_UP_BLOCK_UPDATE_CONTENT } from '.'

describe('SignUpEdit', () => {
  const props: TreeBlock<SignUpFields> = {
    id: 'signUpBlockId1',
    __typename: 'SignUpBlock',
    parentBlockId: 'card0.id',
    parentOrder: 1,
    submitLabel: 'Submit',
    submitIconId: null,
    action: null,
    children: []
  }
  it('selects the input on click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <SignUpEdit {...props} />
      </MockedProvider>
    )
    const input = getByRole('textbox')
    fireEvent.click(input)
    expect(input).toHaveFocus()
  })

  it('saves the signUp label on blur', async () => {
    const result = jest.fn(() => ({
      data: {
        signUpBlockUpdate: [
          {
            __typename: 'SignUpBlock',
            id: 'signUp.id',
            label: 'updated label'
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
                  label: 'updated label'
                }
              }
            },
            result
          }
        ]}
      >
        <JourneyProvider value={{ id: 'journeyId' } as unknown as Journey}>
          <EditorProvider>
            <SignUpEdit {...props} />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )

    const input = getByRole('textbox')
    fireEvent.click(input)
    fireEvent.change(input, { target: { value: '    updated label    ' } })
    fireEvent.blur(input)
    await waitFor(() => expect(result).toHaveBeenCalled())
  })
})

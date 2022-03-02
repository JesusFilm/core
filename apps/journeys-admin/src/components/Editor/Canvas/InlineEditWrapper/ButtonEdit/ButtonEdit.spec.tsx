import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { ButtonVariant } from '../../../../../../__generated__/globalTypes'
import { ButtonFields } from '../../../../../../__generated__/ButtonFields'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../../../libs/context'
import { ButtonEdit, BUTTON_BLOCK_UPDATE_CONTENT } from '.'

describe('ButtonEdit', () => {
  const props: TreeBlock<ButtonFields> = {
    __typename: 'ButtonBlock',
    id: 'button.id',
    label: 'test label',
    parentBlockId: 'card',
    parentOrder: 0,
    buttonVariant: ButtonVariant.contained,
    buttonColor: null,
    size: null,
    startIconId: null,
    endIconId: null,
    action: null,
    children: []
  }
  it('selects the input on click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <ButtonEdit {...props} />
      </MockedProvider>
    )
    const input = getByRole('textbox')
    fireEvent.click(input)
    expect(input).toHaveFocus()
  })

  it('saves the button label on blur', async () => {
    const result = jest.fn(() => ({
      data: {
        buttonBlockUpdate: [
          {
            __typename: 'ButtonBlock',
            id: 'button.id',
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
              query: BUTTON_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'button.id',
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
            <ButtonEdit {...props} />
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

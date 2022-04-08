import { render, fireEvent, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { EditorProvider, TreeBlock } from '@core/journeys/ui'
import { RadioOptionFields } from '../../../../../../__generated__/RadioOptionFields'
import { GetJourney_journey as Journey } from '../../../../../../__generated__/GetJourney'
import { JourneyProvider } from '../../../../../libs/context'
import { RadioOptionEdit, RADIO_OPTION_BLOCK_UPDATE_CONTENT } from '.'

describe('RadioOptionEdit', () => {
  const props: TreeBlock<RadioOptionFields> = {
    __typename: 'RadioOptionBlock',
    id: 'option.id',
    label: 'test label',
    parentBlockId: 'card',
    parentOrder: 0,
    action: null,
    children: []
  }

  it('selects the input on click', () => {
    const { getByRole } = render(
      <MockedProvider>
        <RadioOptionEdit {...props} />
      </MockedProvider>
    )
    const input = getByRole('textbox')
    fireEvent.click(input)
    expect(input).toHaveFocus()
    expect(input).toHaveAttribute('placeholder', 'Type your text here...')
  })

  it('saves the option label on blur', async () => {
    const result = jest.fn(() => ({
      data: {
        radioOptionBlockUpdate: [
          {
            __typename: 'RadioOptionBlock',
            id: 'option.id',
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
              query: RADIO_OPTION_BLOCK_UPDATE_CONTENT,
              variables: {
                id: 'option.id',
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
            <RadioOptionEdit {...props} />
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

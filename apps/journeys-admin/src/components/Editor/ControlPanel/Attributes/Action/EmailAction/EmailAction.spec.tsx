import { MockedProvider } from '@apollo/client/testing'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { InMemoryCache } from '@apollo/client'
import { steps } from '../data'
import { GetJourney_journey as Journey } from '../../../../../../../__generated__/GetJourney'
import { EmailAction, EMAIL_ACTION_UPDATE } from './EmailAction'

describe('EmailAction', () => {
  const selectedBlock = steps[1].children[0].children[4]
  const result = jest.fn(() => ({
    data: {
      blockUpdateEmailAction: {
        id: selectedBlock.id,
        gtmEventName: 'gtmEventName',
        email: 'edmondwashere@gmail.com'
      }
    }
  }))

  const mocks = [
    {
      request: {
        query: EMAIL_ACTION_UPDATE,
        variables: {
          id: selectedBlock.id,
          journeyId: 'journeyId',
          input: {
            email: 'edmondwashere@gmail.com'
          }
        }
      },
      result
    }
  ]
  it('defaults to place holder text', () => {
    const { getByLabelText } = render(
      <MockedProvider>
        <EmailAction />
      </MockedProvider>
    )
    expect(getByLabelText('Paste Email here...')).toBeInTheDocument()
  })

  it('displays the action email', async () => {
    const { getByDisplayValue } = render(
      <MockedProvider>
        <EditorProvider initialState={{ selectedBlock }}>
          <EmailAction />
        </EditorProvider>
      </MockedProvider>
    )
    expect(getByDisplayValue('imissedmondshen@gmail.com')).toBeInTheDocument()
  })

  it('updates action email', async () => {
    const cache = new InMemoryCache()
    cache.restore({
      'Journey:journeyId': {
        blocks: [{ __ref: 'ButtonBlock:button2.id' }],
        id: 'journeyId',
        __typename: 'Journey'
      },
      'ButtonBlock:button2.id': {
        ...selectedBlock
      }
    })

    const { getByRole } = render(
      <MockedProvider mocks={mocks} cache={cache}>
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            admin: true
          }}
        >
          <EditorProvider initialState={{ selectedBlock }}>
            <EmailAction />
          </EditorProvider>
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'edmondwashere@gmail.com' }
    })
    console.log(selectedBlock.id)
    fireEvent.submit(getByRole('textbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())

    expect(cache.extract()['ButtonBlock:button2.id']?.action).toEqual({
      gtmEventName: 'gtmEventName',
      email: 'edmondwashere@gmail.com'
    })
  })

  it('is a required field', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <EditorProvider>
          <EmailAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: '' }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(getByText('Invalid Email')).toBeInTheDocument())
  })
})

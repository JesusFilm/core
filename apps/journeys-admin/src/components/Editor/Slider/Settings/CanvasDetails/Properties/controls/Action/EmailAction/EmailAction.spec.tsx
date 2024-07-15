import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { EditorProvider } from '@core/journeys/ui/EditorProvider'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { GetJourney_journey as Journey } from '../../../../../../../../../../__generated__/GetJourney'
import { EMAIL_ACTION_UPDATE } from '../../../../../../../../../libs/useEmailActionUpdateMutation'
import { steps } from '../data'

import { EmailAction } from '.'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('EmailAction', () => {
  const selectedBlock = steps[1].children[0].children[4]
  const result = jest.fn(() => ({
    data: {
      blockUpdateEmailAction: {
        parentBlockId: selectedBlock.id,
        gtmEventName: 'gtmEventName',
        email: 'edmondwashere@gmail.com'
      }
    }
  }))

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

    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <JourneyProvider
          value={{
            journey: { id: 'journeyId' } as unknown as Journey,
            variant: 'admin'
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
    fireEvent.submit(getByRole('textbox'))
    await waitFor(() => expect(result).toHaveBeenCalled())
  })

  it('is a required field', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <EditorProvider>
          <EmailAction />
        </EditorProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox', { name: 'Paste Email here...' }), {
      target: { value: '' }
    })
    fireEvent.blur(getByRole('textbox', { name: 'Paste Email here...' }))
    await waitFor(() => expect(getByText('Invalid Email')).toBeInTheDocument())
  })

  it('should validate on incorrect email format', async () => {
    const { getByText, getByRole } = render(
      <MockedProvider>
        <EditorProvider>
          <EmailAction />
        </EditorProvider>
      </MockedProvider>
    )

    fireEvent.change(getByRole('textbox'), {
      target: { value: 'edmondshen-atgmail.com' }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() =>
      expect(getByText('Email must be a valid email')).toBeInTheDocument()
    )
  })
})

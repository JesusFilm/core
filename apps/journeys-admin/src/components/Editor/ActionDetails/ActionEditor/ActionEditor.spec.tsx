import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { journey } from '../data'

import { MULTIPLE_LINK_ACTION_UPDATE } from './ActionEditor'

import { ActionEditor } from '.'

describe('ActionDetails', () => {
  const url =
    'https://www.youtube.com/watch?v=ga057VTHdP0&list=RDga057VTHdP0&start_radio=1'

  const buttonBlock = journey.blocks?.[2]
  const signUpBlock = journey.blocks?.[6]

  const result1 = jest.fn(() => ({
    data: {
      blockUpdateLinkAction: {
        id: buttonBlock?.id,
        gtmEventName: 'gtmEventName',
        url
      }
    }
  }))

  const result2 = jest.fn(() => ({
    data: {
      blockUpdateLinkAction: {
        id: signUpBlock?.id,
        gtmEventName: 'gtmEventName',
        url
      }
    }
  }))

  const mocks = [
    {
      request: {
        query: MULTIPLE_LINK_ACTION_UPDATE,
        variables: {
          id: buttonBlock?.id,
          journeyId: 'journeyId',
          input: {
            url
          }
        }
      },
      result: result1
    },
    {
      request: {
        query: MULTIPLE_LINK_ACTION_UPDATE,
        variables: {
          id: signUpBlock?.id,
          journeyId: 'journeyId',
          input: {
            url
          }
        }
      },
      result: result2
    }
  ]

  it('should call the mutation for all the affected blocks', async () => {
    const { getByRole } = render(
      <MockedProvider mocks={mocks}>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <ActionEditor url="https://www.google.com/" goalLabel={jest.fn()} />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: url }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() => expect(result1).toHaveBeenCalled())
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('accept links without protocol as a URL', async () => {
    const { getByRole, queryByText } = render(
      <MockedProvider mocks={mocks}>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <ActionEditor url={url} goalLabel={jest.fn()} />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), { target: { value: 'google.com' } })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() =>
      expect(queryByText('Invalid URL')).not.toBeInTheDocument()
    )
    await waitFor(() => expect(result1).toHaveBeenCalled())
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('accept deep links as a URL', async () => {
    const { getByRole, queryByText } = render(
      <MockedProvider mocks={mocks}>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <ActionEditor url={url} goalLabel={jest.fn()} />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'messenger://' }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() =>
      expect(queryByText('Invalid URL')).not.toBeInTheDocument()
    )
    await waitFor(() => expect(result1).toHaveBeenCalled())
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('rejects mailto links as a URL', async () => {
    const { getByRole, queryByText } = render(
      <MockedProvider mocks={mocks}>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <ActionEditor url={url} goalLabel={jest.fn()} />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: 'mailto:test@test.com' }
    })
    fireEvent.blur(getByRole('textbox'))
    await waitFor(() =>
      expect(queryByText('Invalid URL')).not.toBeInTheDocument()
    )
    await waitFor(() => expect(result1).toHaveBeenCalled())
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })

  it('should submit when enter is pressed', async () => {
    const { getByRole, queryByText } = render(
      <MockedProvider mocks={mocks}>
        <JourneyProvider value={{ journey, variant: 'admin' }}>
          <ActionEditor url="https://www.google.com/" goalLabel={jest.fn()} />
        </JourneyProvider>
      </MockedProvider>
    )
    fireEvent.change(getByRole('textbox'), {
      target: { value: url }
    })
    fireEvent.submit(getByRole('textbox'), { target: { value: url } })
    await waitFor(() =>
      expect(queryByText('Invalid URL')).not.toBeInTheDocument()
    )
    await waitFor(() => expect(result1).toHaveBeenCalled())
    await waitFor(() => expect(result2).toHaveBeenCalled())
  })
})

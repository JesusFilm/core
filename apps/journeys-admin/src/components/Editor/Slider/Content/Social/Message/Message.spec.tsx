import { MockedProvider } from '@apollo/client/testing'
import { render, screen, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields as Journey } from '../../../../../../../__generated__/JourneyFields'

import { Message } from '.'

describe('Message', () => {
  it('should display blank socialpreviewmessage', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journey.id'
            } as unknown as Journey
          }}
        >
          <Message />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByTestId('social-preview-message-empty')).toBeInTheDocument()
  })

  it('should display socialpreviewmessage', () => {
    const { getByRole, getByText } = render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journey.id',
              primaryImageBlock: {
                src: 'https://images.unsplash.com/photo-1616488000000-000000000000?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
              },
              seoDescription: 'journey description',
              seoTitle: 'journey title'
            } as unknown as Journey
          }}
        >
          <Message />
        </JourneyProvider>
      </MockedProvider>
    )
    expect(getByRole('img')).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1616488000000-000000000000?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    )
    expect(getByText('journey title')).toBeInTheDocument()
    expect(getByText('journey description')).toBeInTheDocument()
  })

  it('should render social image tooltip', async () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journey.id'
            } as unknown as Journey
          }}
        >
          <Message />
        </JourneyProvider>
      </MockedProvider>
    )

    const preview = screen.getByTestId('social-preview-message-empty')

    await userEvent.hover(preview)

    const tip = await screen.findByRole('tooltip')
    expect(within(tip).getByText('Social Image')).toBeVisible()
  })

  it('should render headline tooltip', async () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journey.id'
            } as unknown as Journey
          }}
        >
          <Message />
        </JourneyProvider>
      </MockedProvider>
    )

    const headline = screen.getByTestId('HeadlineSkeleton')

    await userEvent.hover(headline)

    const tip = await screen.findByRole('tooltip')
    expect(within(tip).getByText('Headline')).toBeVisible()
  })

  it('should render secondary text tooltip on hover', async () => {
    render(
      <MockedProvider>
        <JourneyProvider
          value={{
            journey: {
              id: 'journey.id'
            } as unknown as Journey
          }}
        >
          <Message />
        </JourneyProvider>
      </MockedProvider>
    )

    const message = screen.getByTestId('SecondaryTextSkeleton')

    await userEvent.hover(message)

    const tip = await screen.findByRole('tooltip')
    expect(within(tip).getByText('Secondary Text')).toBeVisible()
  })
})

import { render } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'

import { JourneyFields as Journey } from '../../../../../__generated__/JourneyFields'

import { SocialPreviewMessage } from './SocialPreviewMessage'

describe('SocialPreviewMessage', () => {
  it('should display blank socialpreviewmessage', () => {
    const { getByTestId } = render(
      <JourneyProvider
        value={{
          journey: {
            id: 'journey.id'
          } as unknown as Journey
        }}
      >
        <SocialPreviewMessage />
      </JourneyProvider>
    )
    expect(getByTestId('social-preview-message-empty')).toBeInTheDocument()
  })

  it('should display socialpreviewmessage', () => {
    const { getByRole, getByText } = render(
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
        <SocialPreviewMessage />
      </JourneyProvider>
    )
    expect(getByRole('img')).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1616488000000-000000000000?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    )
    expect(getByText('journey title')).toBeInTheDocument()
    expect(getByText('journey description')).toBeInTheDocument()
  })
})

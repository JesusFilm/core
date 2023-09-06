import { render } from '@testing-library/react'

import { JourneyFields as Journey } from '../../../../../__generated__/JourneyFields'
import { ThemeProvider } from '../../../ThemeProvider'
import { SocialProvider } from '../../SocialProvider'

import { SocialPreviewMessage } from './SocialPreviewMessage'

describe('SocialPreviewMessage', () => {
  it('should display blank socialpreviewmessage', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <SocialPreviewMessage
          journey={
            {
              id: 'journey.id'
            } as unknown as Journey
          }
        />
      </ThemeProvider>
    )
    expect(getByTestId('social-preview-message-empty')).toBeInTheDocument()
  })

  it('should display socialpreviewmessage', () => {
    const { getByRole, getByText } = render(
      <ThemeProvider>
        <SocialProvider
          initialValues={{
            primaryImageBlock: {
              src: 'https://images.unsplash.com/photo-1616488000000-000000000000?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
            },
            seoDescription: 'journey description',
            seoTitle: 'journey title'
          }}
        >
          <SocialPreviewMessage
            journey={
              {
                id: 'journey.id'
              } as unknown as Journey
            }
          />
        </SocialProvider>
      </ThemeProvider>
    )
    expect(getByRole('img')).toHaveAttribute(
      'src',
      'https://images.unsplash.com/photo-1616488000000-000000000000?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'
    )
    expect(getByText('journey title')).toBeInTheDocument()
    expect(getByText('journey description')).toBeInTheDocument()
  })
})

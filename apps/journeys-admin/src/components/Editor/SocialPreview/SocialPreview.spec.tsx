// unit tests for SocialPreview

import { render } from '@testing-library/react'
import { ThemeProvider } from '../../ThemeProvider'
import { SocialPreview } from './SocialPreview'

describe('SocialPreview', () => {
  it('should display socialpreviewpost', () => {
    const { getAllByText } = render(
      <ThemeProvider>
        <SocialPreview />
      </ThemeProvider>
    )
    expect(getAllByText('Shared on social media')[0]).toBeInTheDocument()
  })
  it('should display socialpreviewmessage', () => {
    const { getAllByText } = render(
      <ThemeProvider>
        <SocialPreview />
      </ThemeProvider>
    )
    expect(getAllByText('Shared in the messenger')[0]).toBeInTheDocument()
  })
})

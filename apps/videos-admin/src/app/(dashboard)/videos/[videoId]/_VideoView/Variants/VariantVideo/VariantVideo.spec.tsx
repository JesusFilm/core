import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'

import { VariantVideo } from './VariantVideo'

describe('VariantVideo', () => {
  it('should display video of variant with HLS', async () => {
    const hlsSrc = 'https://arc.gt/hls/english/master.m3u8'
    render(
      <MockedProvider>
        <VariantVideo hlsSrc={hlsSrc} />
      </MockedProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('VideoSource')).toHaveAttribute('src', hlsSrc)
    )
  })

  it('should display fallback when HLS is not available', async () => {
    render(
      <MockedProvider>
        <VariantVideo hlsSrc={null} />
      </MockedProvider>
    )

    expect(screen.getByText('HLS stream not available')).toBeInTheDocument()
  })
})

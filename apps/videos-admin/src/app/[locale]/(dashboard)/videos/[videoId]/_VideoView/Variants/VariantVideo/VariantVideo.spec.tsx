import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { VariantVideo } from './VariantVideo'

describe('VariantVideo', () => {
  it('should display video of variant with HLS', async () => {
    const hlsSrc = 'https://arc.gt/hls/english/master.m3u8'
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VariantVideo hlsSrc={hlsSrc} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('VideoSource')).toHaveAttribute('src', hlsSrc)
    )
  })

  it('should display fallback when HLS is not available', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VariantVideo hlsSrc={null} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('HLS stream not available')).toBeInTheDocument()
  })
})

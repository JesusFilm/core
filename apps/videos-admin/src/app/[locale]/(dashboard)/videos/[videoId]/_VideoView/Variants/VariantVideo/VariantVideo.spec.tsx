import { MockedProvider } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { VariantVideo } from './VariantVideo'

describe('VariantVideo', () => {
  it('should display video of variant', async () => {
    const videoSrc = 'https://arc.gt/z1sal'
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VariantVideo videoSrc={videoSrc} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    await waitFor(() =>
      expect(screen.getByTestId('VideoSource')).toHaveAttribute('src', videoSrc)
    )
  })
})

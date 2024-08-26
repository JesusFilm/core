import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { VideoList } from './VideoList'

describe('VideoList', () => {
  it('should show loading icon when loading', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoList />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should show all videos', async () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <VideoList />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    console.log(await screen.debug())
    screen.debug()
  })
})

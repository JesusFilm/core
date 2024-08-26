import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

// import { VideoList } from './VideoList'

describe('VideoList', () => {
  it('should display all videos', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>{/* <VideoList /> */}</MockedProvider>
      </NextIntlClientProvider>
    )

    screen.debug()
  })
})

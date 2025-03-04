import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideoVariant } from '../../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

import { VariantCard } from './VariantCard'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

const variant: GetAdminVideoVariant =
  useAdminVideoMock?.['result']?.['data']['adminVideo']['variants'][0]

describe('VariantCard', () => {
  it('should display language and languageId of variant', () => {
    const onClick = jest.fn()
    render(
      <NextIntlClientProvider locale="en">
        <VariantCard variant={variant} onClick={onClick} />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Munukutuba')).toBeInTheDocument()
  })

  it('should handle card click', async () => {
    const onClick = jest.fn()
    render(
      <NextIntlClientProvider locale="en">
        <VariantCard variant={variant} onClick={onClick} />
      </NextIntlClientProvider>
    )

    fireEvent.click(screen.getByRole('listitem'))
    await waitFor(() =>
      expect(onClick).toHaveBeenCalledWith({
        downloads: [
          {
            height: 360,
            id: '529a0228-67ce-4b08-bc78-cecf1b7ec358',
            quality: 'high',
            size: 2248469346,
            url: 'https://arc.gt/4d9ez',
            width: 640
          },
          {
            height: 180,
            id: 'de3c0487-1ab5-488e-b4f0-03001e21579c',
            quality: 'low',
            size: 197621170,
            url: 'https://arc.gt/f4rc6',
            width: 320
          }
        ],
        id: '1_4334-jf-0-0',
        language: {
          id: '4334',
          name: [{ primary: true, value: 'Munukutuba' }],
          slug: 'munukutuba'
        },
        slug: 'jesus/munukutuba',
        hls: 'https://arc.gt/hls/munukutuba/master.m3u8',
        videoId: '1_jf-0-0'
      })
    )
  })
})

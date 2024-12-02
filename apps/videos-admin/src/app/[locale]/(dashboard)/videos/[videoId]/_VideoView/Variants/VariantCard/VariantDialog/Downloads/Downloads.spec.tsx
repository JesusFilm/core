import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideoVariant_Downloads as VariantDownloads } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { EditProvider } from '../../../../_EditProvider'

import { Downloads } from './Downloads'

describe('Downloads', () => {
  const mockVariantDownloads: VariantDownloads =
    useAdminVideoMock['result']?.['data']?.['adminVideo']?.['variants']?.[0]?.[
      'downloads'
    ]

  it('should show downloads', () => {
    render(
      <NextIntlClientProvider locale="en">
        <EditProvider>
          <Downloads downloads={mockVariantDownloads} />
        </EditProvider>
      </NextIntlClientProvider>
    )

    expect(
      screen.getByRole('heading', { level: 4, name: 'Downloads' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('cell', { name: 'https://arc.gt/4d9ez' })
    ).toBeInTheDocument()
  })

  it('should show message if no downloads available', () => {
    render(
      <NextIntlClientProvider locale="en">
        <EditProvider>
          <Downloads downloads={[]} />
        </EditProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('No downloads available')).toBeInTheDocument()
  })
})

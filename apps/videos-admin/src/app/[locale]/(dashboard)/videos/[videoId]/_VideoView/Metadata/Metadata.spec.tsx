import { MockedProvider } from '@apollo/client/testing'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideo_AdminVideo as AdminVideo } from '../../../../../../../libs/useAdminVideo/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { EditProvider } from '../../_EditProvider'

import { Metadata } from './Metadata'

describe('Metadata', () => {
  const mockAdminVideo: AdminVideo =
    useAdminVideoMock['result']?.['data']?.['adminVideo']

  it('should render loading fallback', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <EditProvider>
            <Metadata loading video={mockAdminVideo} />
          </EditProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('should render with data', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <EditProvider>
            <Metadata loading={false} video={mockAdminVideo} />
          </EditProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Information')).toBeInTheDocument()
    expect(screen.getByText('Image')).toBeInTheDocument()
    expect(screen.getByText('Snippet')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Study Questions')).toBeInTheDocument()
  })
})
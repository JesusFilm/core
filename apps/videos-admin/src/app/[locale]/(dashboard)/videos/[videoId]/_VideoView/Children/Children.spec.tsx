import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { usePathname, useRouter } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideo_AdminVideo_Children as VideoChildren } from '../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'
import { EditProvider } from '../../_EditProvider'

import { Children } from './Children'

const childVideos: VideoChildren =
  useAdminVideoMock['result']?.['data']?.['adminVideo']?.['children']

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn()
}))

const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('Children', () => {
  it('should render', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <EditProvider>
            <Children childVideos={childVideos} />
          </EditProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByTestId('OrderedItem-0')).toBeInTheDocument()
    expect(screen.getByTestId('OrderedItem-1')).toBeInTheDocument()
    expect(screen.getByTestId('OrderedItem-2')).toBeInTheDocument()
  })

  it('should handle view click', async () => {
    const push = jest.fn()
    mockRouter.mockReturnValue({ push } as unknown as AppRouterInstance)
    mockUsePathname.mockReturnValue('/en/videos/1_jf6101-0-0')
    const oneChildVideo = [childVideos[0]]
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <EditProvider initialState={{ isEdit: true }}>
            <Children childVideos={oneChildVideo} />
          </EditProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByTestId('OrderedItem-0')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'View' }))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/en/videos/1_jf6101-0-0')
    )
  })

  it('should handle edit click', async () => {
    const push = jest.fn()
    mockRouter.mockReturnValue({ push } as unknown as AppRouterInstance)
    mockUsePathname.mockReturnValue('/en/videos/1_jf6101-0-0')
    const oneChildVideo = [childVideos[0]]
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <EditProvider initialState={{ isEdit: true }}>
            <Children childVideos={oneChildVideo} />
          </EditProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByTestId('OrderedItem-0')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/en/videos/1_jf6101-0-0?isEdit=true')
    )
  })

  it('should show fall back if no children', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <EditProvider>
            <Children childVideos={[]} />
          </EditProvider>
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('No children to show')).toBeInTheDocument()
  })
})
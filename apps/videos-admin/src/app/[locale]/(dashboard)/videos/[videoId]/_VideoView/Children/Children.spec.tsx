import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { usePathname, useRouter } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'

import { GetAdminVideo_AdminVideo_Children as VideoChildren } from '../../../../../../../libs/useAdminVideo'
import { useAdminVideoMock } from '../../../../../../../libs/useAdminVideo/useAdminVideo.mock'

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
          <Children childVideos={childVideos} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByTestId('OrderedItem-0')).toBeInTheDocument()
    expect(screen.getByTestId('OrderedItem-1')).toBeInTheDocument()
    expect(screen.getByTestId('OrderedItem-2')).toBeInTheDocument()
  })

  it('should direct to video view of the child video on click', async () => {
    const push = jest.fn()
    mockRouter.mockReturnValue({ push } as unknown as AppRouterInstance)
    mockUsePathname.mockReturnValue('/en/videos/1_jf6101-0-0')
    const oneChildVideo = [childVideos[0]]
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <Children childVideos={oneChildVideo} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByTestId('OrderedItem-0')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('OrderedItem-0'))
    await waitFor(() =>
      expect(push).toHaveBeenCalledWith('/en/videos/1_jf6101-0-0')
    )
  })

  it('should show fall back if no children', () => {
    render(
      <NextIntlClientProvider locale="en">
        <MockedProvider>
          <Children childVideos={[]} />
        </MockedProvider>
      </NextIntlClientProvider>
    )

    expect(screen.getByText('No children to show')).toBeInTheDocument()
  })
})

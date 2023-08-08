import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { useHostUpdate } from '../../../../../../../../../libs/useHostUpdate'
import { UPDATE_HOST } from '../../../../../../../../../libs/useHostUpdate/useHostUpdate'
import { ThemeProvider } from '../../../../../../../../ThemeProvider'

import { HostAvatarsButton } from './HostAvatarsButton'

jest.mock('../../../../../../../../../libs/useHostUpdate', () => ({
  __esModule: true,
  useHostUpdate: jest.fn()
}))

const mockUseHostUpdate = useHostUpdate as jest.MockedFunction<
  typeof useHostUpdate
>

describe('HostAvatarsButton', () => {
  const updateHost = jest.fn()

  beforeEach(() => {
    mockUseHostUpdate.mockReturnValue({
      updateHost
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const defaultHost = {
    id: 'hostId',
    __typename: 'Host' as const,
    teamId: 'teamId',
    title: 'Cru International',
    location: null,
    src1: null,
    src2: null
  }

  const journey = {
    __typename: 'Journey',
    id: 'journeyId',
    seoTitle: 'My awesome journey',
    host: defaultHost
  } as unknown as Journey

  it('should display default icon if no avatars set', () => {
    const { getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: { ...journey, host: null },
              variant: 'admin'
            }}
          >
            <HostAvatarsButton />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getByTestId('avatar1').firstChild).toHaveAttribute(
      'data-testid',
      'UserProfileAddIcon'
    )
    expect(getByTestId('avatar2').firstChild).toHaveAttribute(
      'data-testid',
      'UserProfileAddIcon'
    )
  })

  it('should display avatar image if set', () => {
    const { getByAltText } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: {
                ...journey,
                host: { ...defaultHost, src1: 'avatar1Src', src2: 'avatar2Src' }
              },
              variant: 'admin'
            }}
          >
            <HostAvatarsButton />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getByAltText('avatar1')).toHaveAttribute('src', 'avatar1Src')
    expect(getByAltText('avatar2')).toHaveAttribute('src', 'avatar2Src')
  })

  it('should disable avatar click', () => {
    const { getByTestId, queryByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider value={{ journey, variant: 'admin' }}>
            <HostAvatarsButton disabled />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('avatar1'))
    expect(queryByTestId('imageSrcStack')).not.toBeInTheDocument()
  })

  it('should open image edit library on avatar click', () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: {
                ...journey,
                host: { ...defaultHost, src1: 'avatar1Src' }
              },
              variant: 'admin'
            }}
          >
            <HostAvatarsButton />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('avatar1'))
    expect(getByTestId('imageSrcStack')).toBeInTheDocument()
    expect(getByRole('img')).toHaveAttribute('src', 'avatar1Src')
    fireEvent.click(getByRole('button', { name: 'close-image-library' }))

    fireEvent.click(getByTestId('avatar2'))
    expect(getByTestId('imageBlockThumbnailPlaceholder')).toBeInTheDocument()
  })

  // TODO: Add to E2E when can mock out unsplash

  it('should remove host image src on image delete', async () => {
    const result = jest.fn(() => ({
      data: {
        hostUpdate: {
          __typename: 'Host',
          id: 'hostId',
          title: 'Cru International',
          location: null,
          src1: null,
          src2: null
        }
      }
    }))

    const { getByTestId } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: UPDATE_HOST,
              variables: {
                id: 'hostId',
                teamId: 'teamId',
                input: {
                  src1: null
                }
              }
            },
            result
          }
        ]}
      >
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: {
                ...journey,
                host: {
                  ...defaultHost,

                  src1: 'avatar1Src'
                }
              },
              variant: 'admin'
            }}
          >
            <HostAvatarsButton />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('avatar1'))
    expect(getByTestId('imageSrcStack')).toBeInTheDocument()
    fireEvent.click(getByTestId('imageBlockHeaderDelete'))

    void waitFor(() => {
      expect(getByTestId('imageBlockThumbnailPlaceholder')).toBeInTheDocument()
    })
    void waitFor(() => expect(result).toHaveBeenCalled())
    void waitFor(() =>
      expect(getByTestId('avatar1').firstChild).toHaveAttribute(
        'data-testid',
        'UserProfileAddIcon'
      )
    )
  })

  it('should update order of avatar images on library close', () => {
    const deleteResult = jest.fn(() => ({
      data: {
        hostUpdate: {
          __typename: 'Host',
          id: 'hostId',
          title: 'Cru International',
          location: null,
          src1: null,
          src2: 'avatar2Src'
        }
      }
    }))

    const reorderResult = jest.fn(() => ({
      data: {
        hostUpdate: {
          __typename: 'Host',
          id: 'hostId',
          title: 'Cru International',
          location: null,
          src1: 'avatar2Src',
          src2: null
        }
      }
    }))

    const { getByRole, getByTestId, getByAltText } = render(
      <MockedProvider
        mocks={[
          {
            request: {
              query: UPDATE_HOST,
              variables: {
                id: 'hostId',
                teamId: 'teamId',
                input: {
                  src1: null
                }
              }
            },
            result: deleteResult
          },
          {
            request: {
              query: UPDATE_HOST,
              variables: {
                id: 'hostId',
                teamId: 'teamId',
                input: {
                  src1: 'avatar2Src'
                }
              }
            },
            result: reorderResult
          }
        ]}
      >
        <ThemeProvider>
          <JourneyProvider
            value={{
              journey: {
                ...journey,
                host: {
                  ...defaultHost,
                  src1: 'avatar1Src',
                  src2: 'avatar2Src'
                }
              },
              variant: 'admin'
            }}
          >
            <HostAvatarsButton />
          </JourneyProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('avatar1'))
    expect(getByTestId('imageSrcStack')).toBeInTheDocument()
    fireEvent.click(getByTestId('imageBlockHeaderDelete'))
    void waitFor(() => {
      expect(getByTestId('imageBlockThumbnailPlaceholder')).toBeInTheDocument()
    })
    fireEvent.click(getByRole('button', { name: 'close-image-library' }))

    void waitFor(() => {
      expect(getByAltText('avatar1')).toHaveAttribute('src', 'avatar2Src')
      expect(getByTestId('avatar2').firstChild).toHaveAttribute(
        'data-testid',
        'UserProfileAddIcon'
      )
    })
  })
})

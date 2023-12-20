import { MockedProvider } from '@apollo/client/testing'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { JourneyFields as Journey } from '@core/journeys/ui/JourneyProvider/__generated__/JourneyFields'

import { useHostUpdateMutation } from '../../../../../../../../../libs/useHostUpdateMutation'
import { UPDATE_HOST } from '../../../../../../../../../libs/useHostUpdateMutation/useHostUpdateMutation'
import { ThemeProvider } from '../../../../../../../../ThemeProvider'

import { HostAvatarsButton } from './HostAvatarsButton'

jest.mock('../../../../../../../../../libs/useHostUpdateMutation', () => ({
  __esModule: true,
  useHostUpdateMutation: jest.fn()
}))

const mockUseHostUpdateMutation = useHostUpdateMutation as jest.MockedFunction<
  typeof useHostUpdateMutation
>

describe('HostAvatarsButton', () => {
  const updateHost = jest.fn()

  beforeEach(() => {
    mockUseHostUpdateMutation.mockReturnValue({
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
          <SnackbarProvider>
            <JourneyProvider
              value={{
                journey: { ...journey, host: null },
                variant: 'admin'
              }}
            >
              <HostAvatarsButton />
            </JourneyProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    expect(getByTestId('avatar1').firstChild).toHaveAttribute(
      'data-testid',
      'UserProfile2Icon'
    )
    expect(getByTestId('avatar2').firstChild).toHaveAttribute(
      'data-testid',
      'Plus2Icon'
    )
  })

  it('should display avatar image if set', () => {
    const { getByAltText } = render(
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
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
          </SnackbarProvider>
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
          <SnackbarProvider>
            <JourneyProvider value={{ journey, variant: 'admin' }}>
              <HostAvatarsButton disabled />
            </JourneyProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('avatar1'))
    expect(queryByTestId('ImageBlockHeader')).not.toBeInTheDocument()
  })

  it('should open image edit library on avatar click', async () => {
    const { getByRole, getByTestId } = render(
      <MockedProvider>
        <ThemeProvider>
          <SnackbarProvider>
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
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('avatar1'))
    await waitFor(() =>
      expect(getByTestId('ImageBlockHeader')).toBeInTheDocument()
    )

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
          <SnackbarProvider>
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
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('avatar1'))
    expect(getByTestId('ImageBlockHeader')).toBeInTheDocument()
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
          <SnackbarProvider>
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
          </SnackbarProvider>
        </ThemeProvider>
      </MockedProvider>
    )

    fireEvent.click(getByTestId('avatar1'))
    expect(getByTestId('ImageBlockHeader')).toBeInTheDocument()
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

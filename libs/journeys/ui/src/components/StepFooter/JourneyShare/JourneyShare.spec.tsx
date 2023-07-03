import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { JourneyFields as Journey } from '../../../libs/JourneyProvider/__generated__/JourneyFields'
import { JourneyProvider } from '../../../libs/JourneyProvider'
import { JourneyShare } from '.'

describe('JourneyShare', () => {
  const originalNavigator = { ...global.navigator }
  const originalEnv = process.env
  beforeEach(() => {
    Object.assign(navigator, { ...originalNavigator, share: undefined })
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: 'http://localhost:4100'
    }
  })
  afterEach(() => {
    jest.resetAllMocks()
    Object.assign(navigator, originalNavigator)
  })

  it('should open native share dialog on mobile', () => {
    const navigatorMock = jest.fn()

    Object.assign(navigator, {
      share: navigatorMock
    })

    const { getByRole } = render(
      <SnackbarProvider>
        <JourneyProvider
          value={{
            journey: { slug: 'test-slug' } as unknown as Journey,
            admin: false
          }}
        >
          <JourneyShare />
        </JourneyProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Share' }))
    expect(navigatorMock).toHaveBeenCalled()
  })

  it('should open share dialog on desktop', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <JourneyProvider
          value={{
            journey: { slug: 'test-slug' } as unknown as Journey,
            admin: false
          }}
        >
          <JourneyShare />
        </JourneyProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Share' }))
    expect(getByRole('dialog', { name: 'Share' })).toBeInTheDocument()
  })

  it('should disable click on admin', () => {
    const { getByRole, queryByRole } = render(
      <SnackbarProvider>
        <JourneyProvider
          value={{
            journey: { slug: 'test-slug' } as unknown as Journey,
            admin: true
          }}
        >
          <JourneyShare />
        </JourneyProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Share' }))
    expect(queryByRole('dialog', { name: 'Share' })).not.toBeInTheDocument()
  })

  it('should copy link', () => {
    const mockPromise = Promise.resolve()
    const writeTextMock = jest.fn().mockReturnValue(mockPromise)

    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    })
    jest.spyOn(mockPromise, 'then').mockImplementation(writeTextMock)

    const { getByRole, getByTestId } = render(
      <SnackbarProvider>
        <JourneyProvider
          value={{
            journey: { slug: 'test-slug' } as unknown as Journey,
            admin: false
          }}
        >
          <JourneyShare />
        </JourneyProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Share' }))
    fireEvent.click(getByTestId('LinkAngledIcon'))
    expect(writeTextMock).toHaveBeenCalled()
  })

  it('should share to facebook', () => {
    const { getByRole, getAllByRole } = render(
      <SnackbarProvider>
        <JourneyProvider
          value={{
            journey: { slug: 'test-slug' } as unknown as Journey,
            admin: false
          }}
        >
          <JourneyShare />
        </JourneyProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Share' }))
    expect(getAllByRole('link')[0]).toHaveAttribute(
      'href',
      'https://www.facebook.com/sharer/sharer.php?u=http://localhost:4100/test-slug'
    )
  })

  it('should share to twitter', () => {
    const { getByRole, getAllByRole } = render(
      <SnackbarProvider>
        <JourneyProvider
          value={{
            journey: { slug: 'test-slug' } as unknown as Journey,
            admin: false
          }}
        >
          <JourneyShare />
        </JourneyProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button', { name: 'Share' }))
    expect(getAllByRole('link')[1]).toHaveAttribute(
      'href',
      'https://twitter.com/intent/tweet?url=http://localhost:4100/test-slug'
    )
  })
})

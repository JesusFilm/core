import { fireEvent, render } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { JourneyProvider } from '../../../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'
import { ShareButton } from './ShareButton'

jest.mock('react-i18next', () => ({
  __esModule: true,
  useTranslation: () => {
    return {
      t: (str: string) => str
    }
  }
}))

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

describe('ShareButton', () => {
  const originalNavigator = { ...global.navigator }
  beforeEach(() => {
    Object.assign(navigator, { ...originalNavigator, share: undefined })
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

    const { getAllByRole } = render(
      <SnackbarProvider>
        <JourneyProvider
          value={{
            journey: { slug: 'test-slug' } as unknown as Journey,
            admin: false
          }}
        >
          <ShareButton />
        </JourneyProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getAllByRole('button')[0])
    expect(navigatorMock).toHaveBeenCalled()
  })

  it('should open share dialog on desktop', () => {
    const { getByRole, getAllByRole } = render(
      <SnackbarProvider>
        <JourneyProvider
          value={{
            journey: { slug: 'test-slug' } as unknown as Journey,
            admin: false
          }}
        >
          <ShareButton />
        </JourneyProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getAllByRole('button')[0])
    expect(getByRole('dialog', { name: 'Share' })).toBeInTheDocument()
  })

  it('should disable click on admin', () => {
    const { getAllByRole, queryByRole } = render(
      <SnackbarProvider>
        <JourneyProvider
          value={{
            journey: { slug: 'test-slug' } as unknown as Journey,
            admin: true
          }}
        >
          <ShareButton />
        </JourneyProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getAllByRole('button')[0])
    expect(queryByRole('dialog', { name: 'Share' })).not.toBeInTheDocument()
  })
})

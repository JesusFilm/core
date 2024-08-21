import { fireEvent, render, screen } from '@testing-library/react'
import { usePlausible } from 'next-plausible'
import { SnackbarProvider } from 'notistack'

import { TreeBlock, blockHistoryVar } from '../../../../libs/block'
import { JourneyProvider } from '../../../../libs/JourneyProvider'
import { JourneyFields as Journey } from '../../../../libs/JourneyProvider/__generated__/JourneyFields'
import { keyify } from '../../../../libs/plausibleHelpers'
import { StepFields } from '../../../Step/__generated__/StepFields'

import { ShareButton } from './ShareButton'

jest.mock('@mui/material/useMediaQuery', () => ({
  __esModule: true,
  default: () => true
}))

jest.mock('next-plausible', () => ({
  __esModule: true,
  usePlausible: jest.fn()
}))

const mockUsePlausible = usePlausible as jest.MockedFunction<
  typeof usePlausible
>

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
    mockUsePlausible.mockReturnValue(jest.fn())
    const navigatorMock = jest.fn()

    Object.assign(navigator, {
      share: navigatorMock
    })

    const { getByRole } = render(
      <SnackbarProvider>
        <JourneyProvider
          value={{
            journey: { slug: 'test-slug' } as unknown as Journey
          }}
        >
          <ShareButton />
        </JourneyProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(navigatorMock).toHaveBeenCalled()
  })

  it('should open share dialog on desktop', () => {
    mockUsePlausible.mockReturnValue(jest.fn())
    const { getByRole } = render(
      <SnackbarProvider>
        <JourneyProvider
          value={{
            journey: { slug: 'test-slug' } as unknown as Journey
          }}
        >
          <ShareButton />
        </JourneyProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(getByRole('dialog', { name: 'Share' })).toBeInTheDocument()
  })

  it('should disable click on admin', () => {
    const { getByRole, queryByRole } = render(
      <SnackbarProvider>
        <JourneyProvider
          value={{
            journey: { slug: 'test-slug' } as unknown as Journey,
            variant: 'admin'
          }}
        >
          <ShareButton />
        </JourneyProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(queryByRole('dialog', { name: 'Share' })).not.toBeInTheDocument()
  })

  it('should add share event to plausible', async () => {
    const block = {
      id: 'block.id'
    } as unknown as TreeBlock<StepFields>
    const journey = {
      id: 'journey.id',
      slug: 'slug'
    } as unknown as Journey
    blockHistoryVar([block])
    const mockPlausible = jest.fn()
    mockUsePlausible.mockReturnValue(mockPlausible)
    const navigatorMock = jest.fn()

    Object.assign(navigator, {
      share: navigatorMock
    })

    render(
      <SnackbarProvider>
        <JourneyProvider value={{ journey }}>
          <ShareButton />
        </JourneyProvider>
      </SnackbarProvider>
    )

    fireEvent.click(screen.getByRole('button'))
    expect(mockPlausible).toHaveBeenCalledWith('shareButtonClick', {
      props: {
        blockId: 'block.id',
        key: keyify({
          stepId: 'block.id',
          event: 'shareButtonClick',
          blockId: 'block.id'
        }),
        simpleKey: keyify({
          stepId: 'block.id',
          event: 'shareButtonClick',
          blockId: 'block.id'
        })
      }
    })
  })
})

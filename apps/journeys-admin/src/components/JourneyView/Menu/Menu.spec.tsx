import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { JourneyProvider } from '@core/journeys/ui/JourneyProvider'
import { FlagsProvider } from '@core/shared/ui/FlagsProvider'
import { defaultJourney, publishedJourney } from '../data'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { Menu, JOURNEY_PUBLISH } from '.'

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
})

describe('JourneyView/Menu', () => {
  const originalEnv = process.env

  it('should open menu on click', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <FlagsProvider>
            <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
              <Menu />
            </JourneyProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    expect(menu).toHaveAttribute('aria-expanded', 'true')
  })

  it('should not preview if journey is draft', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <FlagsProvider>
            <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
              <Menu />
            </JourneyProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  it('should preview if journey is published', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <FlagsProvider>
            <JourneyProvider value={{ journey: publishedJourney, admin: true }}>
              <Menu />
            </JourneyProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'href',
      `/api/preview?slug=${publishedJourney.slug}`
    )
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'target',
      '_blank'
    )
  })

  it('should publish when clicked', async () => {
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider
          mocks={[
            {
              request: {
                query: JOURNEY_PUBLISH,
                variables: {
                  id: defaultJourney.id
                }
              },
              result: {
                data: {
                  journeyPublish: {
                    id: defaultJourney.id,
                    __typename: 'Journey',
                    status: JourneyStatus.published
                  }
                }
              }
            }
          ]}
        >
          <FlagsProvider>
            <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
              <Menu />
            </JourneyProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    fireEvent.click(getByRole('menuitem', { name: 'Publish' }))
    await waitFor(() => {
      expect(getByText('Journey Published')).toBeInTheDocument()
    })
    expect(menu).not.toHaveAttribute('aria-expanded')
  })

  it('should not publish if journey is published', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <FlagsProvider>
            <JourneyProvider value={{ journey: publishedJourney, admin: true }}>
              <Menu />
            </JourneyProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Publish' })).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  it('should handle edit journey title', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <FlagsProvider>
            <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
              <Menu />
            </JourneyProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    fireEvent.click(getByRole('menuitem', { name: 'Title' }))
    expect(getByRole('dialog')).toBeInTheDocument()
    expect(menu).not.toHaveAttribute('aria-expanded')
  })

  it('should handle edit journey description', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <FlagsProvider>
            <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
              <Menu />
            </JourneyProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    fireEvent.click(getByRole('menuitem', { name: 'Description' }))
    expect(getByRole('dialog')).toBeInTheDocument()
    expect(menu).not.toHaveAttribute('aria-expanded')
  })

  it('should handle edit journey language', () => {
    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <FlagsProvider>
            <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
              <Menu />
            </JourneyProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    fireEvent.click(getByRole('menuitem', { name: 'Language' }))
    expect(getByRole('dialog')).toBeInTheDocument()
    expect(getByText('Edit Language')).toBeInTheDocument()
    expect(menu).not.toHaveAttribute('aria-expanded')
  })

  it('should handle edit cards', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <FlagsProvider>
            <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
              <Menu />
            </JourneyProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    expect(getByRole('menuitem', { name: 'Edit Cards' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/edit'
    )
  })

  it('should handle copy url in development', async () => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: 'http://localhost:4100'
    }

    jest.spyOn(navigator.clipboard, 'writeText')

    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <FlagsProvider>
            <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
              <Menu />
            </JourneyProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    fireEvent.click(getByRole('menuitem', { name: 'Copy Link' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `${process.env.NEXT_PUBLIC_JOURNEYS_URL as string}/${defaultJourney.slug}`
    )
    await waitFor(() => {
      expect(getByText('Link Copied')).toBeInTheDocument()
    })
    expect(menu).not.toHaveAttribute('aria-expanded')

    process.env = originalEnv
  })

  it('should handle copy url in production', async () => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_JOURNEYS_URL: undefined
    }

    jest.spyOn(navigator.clipboard, 'writeText')

    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <FlagsProvider>
            <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
              <Menu />
            </JourneyProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    fireEvent.click(getByRole('menuitem', { name: 'Copy Link' }))
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      `https://your.nextstep.is/${defaultJourney.slug}`
    )
    await waitFor(() => {
      expect(getByText('Link Copied')).toBeInTheDocument()
    })
    expect(menu).not.toHaveAttribute('aria-expanded')

    process.env = originalEnv
  })

  it('should handle reports', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <FlagsProvider flags={{ reports: true }}>
            <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
              <Menu />
            </JourneyProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    expect(getByRole('menuitem', { name: 'Report' })).toHaveAttribute(
      'href',
      '/journeys/journey-id/reports'
    )
  })

  it('should hide reports', () => {
    const { getByRole, queryByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <FlagsProvider flags={{ reports: false }}>
            <JourneyProvider value={{ journey: defaultJourney, admin: true }}>
              <Menu />
            </JourneyProvider>
          </FlagsProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    expect(queryByRole('menuitem', { name: 'Report' })).toBeNull()
  })
})

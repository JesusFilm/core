import { MockedProvider } from '@apollo/client/testing'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { JourneyProvider } from '../../../libs/context'
import { defaultJourney, publishedJourney } from '../data'
import { JourneyStatus } from '../../../../__generated__/globalTypes'
import { Menu, JOURNEY_PUBLISH } from '.'

Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
})

describe('JourneyView/Menu', () => {
  it('should open menu on click', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <JourneyProvider value={defaultJourney}>
            <Menu />
          </JourneyProvider>
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
          <JourneyProvider value={defaultJourney}>
            <Menu />
          </JourneyProvider>
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
          <JourneyProvider value={publishedJourney}>
            <Menu />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    fireEvent.click(getByRole('button'))
    expect(getByRole('menuitem', { name: 'Preview' })).toHaveAttribute(
      'href',
      `https://your.nextstep.is/${publishedJourney.slug}`
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
          <JourneyProvider value={defaultJourney}>
            <Menu />
          </JourneyProvider>
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
          <JourneyProvider value={publishedJourney}>
            <Menu />
          </JourneyProvider>
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
          <JourneyProvider value={defaultJourney}>
            <Menu />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    fireEvent.click(getByRole('menuitem', { name: 'Title' }))
    expect(getByRole('dialog')).toBeInTheDocument()
    expect(
      getByRole('group', { name: 'form-update-title' })
    ).toBeInTheDocument()
    expect(menu).not.toHaveAttribute('aria-expanded')
  })

  it('should handle edit journey description', () => {
    const { getByRole } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <JourneyProvider value={defaultJourney}>
            <Menu />
          </JourneyProvider>
        </MockedProvider>
      </SnackbarProvider>
    )

    const menu = getByRole('button')
    fireEvent.click(menu)
    fireEvent.click(getByRole('menuitem', { name: 'Description' }))
    expect(getByRole('dialog')).toBeInTheDocument()
    expect(
      getByRole('group', { name: 'form-update-description' })
    ).toBeInTheDocument()
    expect(menu).not.toHaveAttribute('aria-expanded')
  })

  it('should handle copy url', async () => {
    jest.spyOn(navigator.clipboard, 'writeText')

    const { getByRole, getByText } = render(
      <SnackbarProvider>
        <MockedProvider mocks={[]}>
          <JourneyProvider value={defaultJourney}>
            <Menu />
          </JourneyProvider>
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
  })
})

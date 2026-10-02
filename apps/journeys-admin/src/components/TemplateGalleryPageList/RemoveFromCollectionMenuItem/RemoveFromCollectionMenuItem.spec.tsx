import { MockedProvider } from '@apollo/client/testing/react'
import MenuList from '@mui/material/MenuList'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SnackbarProvider } from 'notistack'
import { type MockedFunction } from 'vitest'

import { sendCollectionTemplateRemoveEvent } from '../../../libs/sendCollectionEvent'
import { getTemplateGalleryPageRemoveJourneyMock } from '../../../libs/useTemplateGalleryPageRemoveJourneyMutation/useTemplateGalleryPageRemoveJourneyMutation.mock'
import { InCollectionContext } from '../InCollectionContext'

import { RemoveFromCollectionMenuItem } from './RemoveFromCollectionMenuItem'

import '../../../../test/i18n'

vi.mock('../../../libs/sendCollectionEvent', () => ({
  sendCollectionTemplateRemoveEvent: vi.fn()
}))

const mockSendCollectionTemplateRemoveEvent =
  sendCollectionTemplateRemoveEvent as MockedFunction<
    typeof sendCollectionTemplateRemoveEvent
  >

describe('RemoveFromCollectionMenuItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing outside a collection', () => {
    render(
      <MockedProvider mocks={[]}>
        <SnackbarProvider>
          <RemoveFromCollectionMenuItem id="j1" handleCloseMenu={vi.fn()} />
        </SnackbarProvider>
      </MockedProvider>,
      { wrapper: MenuList }
    )
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument()
  })

  it('removes the template from the collection and confirms', async () => {
    const handleCloseMenu = vi.fn()
    const removeMock = getTemplateGalleryPageRemoveJourneyMock(
      { journeyId: 'j1', pageId: 'page-A' },
      [{ id: 'page-A', title: 'Easter', templates: [], memberships: [] }]
    )
    render(
      <MockedProvider mocks={[removeMock]}>
        <SnackbarProvider>
          <InCollectionContext.Provider
            value={{ collectionId: 'page-A', collectionTitle: 'Easter' }}
          >
            <RemoveFromCollectionMenuItem
              id="j1"
              handleCloseMenu={handleCloseMenu}
            />
          </InCollectionContext.Provider>
        </SnackbarProvider>
      </MockedProvider>,
      { wrapper: MenuList }
    )

    fireEvent.click(
      screen.getByRole('menuitem', { name: 'Remove from collection' })
    )

    expect(handleCloseMenu).toHaveBeenCalled()
    await waitFor(() => expect(removeMock.result).toHaveBeenCalled())
    expect(mockSendCollectionTemplateRemoveEvent).toHaveBeenCalledWith({
      collectionId: 'page-A',
      templateId: 'j1',
      via: 'menu'
    })
    await waitFor(() =>
      expect(screen.getByText('Removed from Easter')).toBeInTheDocument()
    )
  })

  it('names the promoted home when the removed membership was the home', async () => {
    const removeMock = getTemplateGalleryPageRemoveJourneyMock(
      { journeyId: 'j1', pageId: 'page-A' },
      [
        { id: 'page-A', title: 'Easter', templates: [], memberships: [] },
        {
          id: 'page-B',
          title: 'Youth',
          memberships: [
            {
              __typename: 'TemplateGalleryPageMembership',
              journeyId: 'j1',
              isHome: true
            }
          ]
        }
      ]
    )
    render(
      <MockedProvider mocks={[removeMock]}>
        <SnackbarProvider>
          <InCollectionContext.Provider
            value={{ collectionId: 'page-A', collectionTitle: 'Easter' }}
          >
            <RemoveFromCollectionMenuItem id="j1" handleCloseMenu={vi.fn()} />
          </InCollectionContext.Provider>
        </SnackbarProvider>
      </MockedProvider>,
      { wrapper: MenuList }
    )

    fireEvent.click(
      screen.getByRole('menuitem', { name: 'Remove from collection' })
    )

    await waitFor(() =>
      expect(
        screen.getByText('Removed from Easter. Its home is now Youth.')
      ).toBeInTheDocument()
    )
  })

  it('surfaces an error snackbar when the mutation fails', async () => {
    const failingMock = {
      ...getTemplateGalleryPageRemoveJourneyMock({
        journeyId: 'j1',
        pageId: 'page-A'
      }),
      result: undefined,
      error: new Error('boom')
    }
    render(
      <MockedProvider mocks={[failingMock]}>
        <SnackbarProvider>
          <InCollectionContext.Provider
            value={{ collectionId: 'page-A', collectionTitle: 'Easter' }}
          >
            <RemoveFromCollectionMenuItem id="j1" handleCloseMenu={vi.fn()} />
          </InCollectionContext.Provider>
        </SnackbarProvider>
      </MockedProvider>,
      { wrapper: MenuList }
    )

    fireEvent.click(
      screen.getByRole('menuitem', { name: 'Remove from collection' })
    )

    await waitFor(() => expect(screen.getByText('boom')).toBeInTheDocument())
    expect(mockSendCollectionTemplateRemoveEvent).not.toHaveBeenCalled()
  })
})

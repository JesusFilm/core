import { fireEvent, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'

import '../../../../test/i18n'

import {
  activeJourneysMock,
  archiveActiveJourneysMutationMock,
  archiveActiveTemplatesMutationMock,
  archivedJourneysMock,
  archivedTemplatesMock,
  deleteTrashedJourneysMutationMock,
  deleteTrashedTemplatesMutationMock,
  noArchivedMock,
  noArchivedTemplatesMock,
  noJourneysMock,
  noTemplatesMock,
  noTrashedMock,
  noTrashedTemplatesMock,
  restoreArchivedJourneysMutationMock,
  restoreArchivedTemplatesMutationMock,
  restoreTrashedJourneysMutationMock,
  restoreTrashedTemplatesMutationMock,
  templatesMock,
  trashActiveJourneysMutationMock,
  trashActiveTemplatesMutationMock,
  trashArchivedJourneysMutationMock,
  trashArchivedTemplatesMutationMock,
  trashedJourneysMock,
  trashedTemplatesMock,
  user
} from './JourneyListContent.mocks'
import { renderJourneyListContent } from './JourneyListContent.testUtils'

jest.mock('@core/journeys/ui/useNavigationState', () => ({
  useNavigationState: jest.fn(() => false)
}))

jest.mock('next/router', () => ({
  __esModule: true,
  useRouter: jest.fn()
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('JourneyListContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseRouter.mockReturnValue({
      query: {},
      replace: jest.fn()
    } as any)
  })

  it('should render "Learn more" as an external link that opens in a new tab', async () => {
    renderJourneyListContent({
      mocks: [noTemplatesMock],
      contentType: 'templates',
      status: 'active'
    })

    const learnMoreLink = screen.getByRole('link', { name: 'Learn more' })
    expect(learnMoreLink).toHaveAttribute(
      'href',
      'https://support.nextstep.is/'
    )
    expect(learnMoreLink).toHaveAttribute('target', '_blank')
    expect(learnMoreLink).toHaveAttribute(
      'rel',
      expect.stringContaining('noopener')
    )
    expect(learnMoreLink).toHaveAttribute(
      'rel',
      expect.stringContaining('noreferrer')
    )
  })

  describe('Active Journeys', () => {
    it('should render journeys list', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [activeJourneysMock],
        contentType: 'journeys',
        status: 'active',
        user
      })

      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
      expect(getByText('An Old Journey Heading')).toBeInTheDocument()
    })

    it('should display empty state message when no journeys', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [noJourneysMock],
        contentType: 'journeys',
        status: 'active',
        user
      })

      await waitFor(() =>
        expect(getByText('No journeys to display.')).toBeInTheDocument()
      )
    })

    it('should open archive dialog when event is archiveAllActive', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [activeJourneysMock],
        contentType: 'journeys',
        status: 'active',
        user,
        event: 'archiveAllActive'
      })

      await waitFor(() =>
        expect(getByText('Archive Journeys')).toBeInTheDocument()
      )
    })

    it('should open trash dialog when event is trashAllActive', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [activeJourneysMock],
        contentType: 'journeys',
        status: 'active',
        user,
        event: 'trashAllActive'
      })

      await waitFor(() =>
        expect(getByText('Trash Journeys')).toBeInTheDocument()
      )
    })
  })

  describe('Active Templates', () => {
    it('should render templates list', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [templatesMock],
        contentType: 'templates',
        status: 'active'
      })

      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
    })

    it('should display empty state message when no templates', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [noTemplatesMock],
        contentType: 'templates',
        status: 'active'
      })

      await waitFor(() =>
        expect(getByText('Make your first template.')).toBeInTheDocument()
      )
    })

    it('should open archive dialog with template-specific message', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [templatesMock],
        contentType: 'templates',
        status: 'active',
        event: 'archiveAllActive'
      })

      await waitFor(() => {
        expect(getByText('Archive Templates')).toBeInTheDocument()
        expect(
          getByText('This will archive all active templates you own.')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Archived Journeys', () => {
    it('should render archived journeys', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [archivedJourneysMock],
        contentType: 'journeys',
        status: 'archived',
        user
      })

      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
    })

    it('should display empty state for archived journeys', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [noArchivedMock],
        contentType: 'journeys',
        status: 'archived',
        user
      })

      await waitFor(() =>
        expect(getByText('No archived journeys.')).toBeInTheDocument()
      )
    })

    it('should open restore dialog when event is restoreAllArchived', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [archivedJourneysMock],
        contentType: 'journeys',
        status: 'archived',
        user,
        event: 'restoreAllArchived'
      })

      await waitFor(() =>
        expect(getByText('Unarchive Journeys')).toBeInTheDocument()
      )
    })

    it('should open trash dialog when event is trashAllArchived', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [archivedJourneysMock],
        contentType: 'journeys',
        status: 'archived',
        user,
        event: 'trashAllArchived'
      })

      await waitFor(() => {
        expect(getByText('Trash Journeys')).toBeInTheDocument()
        expect(
          getByText('This will trash all archived journeys you own.')
        ).toBeInTheDocument()
        expect(
          getByText('Are you sure you want to proceed?')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Trashed Journeys', () => {
    it('should render trashed journeys', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [trashedJourneysMock],
        contentType: 'journeys',
        status: 'trashed',
        user
      })

      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
    })

    it('should display empty state for trashed journeys', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [noTrashedMock],
        contentType: 'journeys',
        status: 'trashed',
        user
      })

      await waitFor(() =>
        expect(
          getByText('Your trashed journeys will appear here.')
        ).toBeInTheDocument()
      )
    })

    it('should open restore dialog when event is restoreAllTrashed', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [trashedJourneysMock],
        contentType: 'journeys',
        status: 'trashed',
        user,
        event: 'restoreAllTrashed'
      })

      await waitFor(() =>
        expect(getByText('Restore Journeys')).toBeInTheDocument()
      )
    })

    it('should open delete dialog when event is deleteAllTrashed', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [trashedJourneysMock],
        contentType: 'journeys',
        status: 'trashed',
        user,
        event: 'deleteAllTrashed'
      })

      await waitFor(() =>
        expect(getByText('Delete Journeys Forever')).toBeInTheDocument()
      )
    })
  })

  describe('Archived Templates', () => {
    it('should render archived templates', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [archivedTemplatesMock],
        contentType: 'templates',
        status: 'archived'
      })

      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
    })

    it('should display empty state for archived templates', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [noArchivedTemplatesMock],
        contentType: 'templates',
        status: 'archived'
      })

      await waitFor(() =>
        expect(getByText('No archived templates.')).toBeInTheDocument()
      )
    })

    it('should open restore dialog when event is restoreAllArchived', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [archivedTemplatesMock],
        contentType: 'templates',
        status: 'archived',
        event: 'restoreAllArchived'
      })

      await waitFor(() => {
        expect(getByText('Unarchive Templates')).toBeInTheDocument()
        expect(
          getByText('This will unarchive all archived templates you own.')
        ).toBeInTheDocument()
        expect(
          getByText('Are you sure you want to proceed?')
        ).toBeInTheDocument()
      })
    })

    it('should open trash dialog when event is trashAllArchived', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [archivedTemplatesMock],
        contentType: 'templates',
        status: 'archived',
        event: 'trashAllArchived'
      })

      await waitFor(() => {
        expect(getByText('Trash Templates')).toBeInTheDocument()
        expect(
          getByText('This will trash all archived templates you own.')
        ).toBeInTheDocument()
        expect(
          getByText('Are you sure you want to proceed?')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Trashed Templates', () => {
    it('should render trashed templates', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [trashedTemplatesMock],
        contentType: 'templates',
        status: 'trashed'
      })

      await waitFor(() =>
        expect(getByText('Default Journey Heading')).toBeInTheDocument()
      )
    })

    it('should display empty state for trashed templates', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [noTrashedTemplatesMock],
        contentType: 'templates',
        status: 'trashed'
      })

      await waitFor(() =>
        expect(
          getByText('Your trashed templates will appear here.')
        ).toBeInTheDocument()
      )
    })

    it('should open restore dialog when event is restoreAllTrashed', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [trashedTemplatesMock],
        contentType: 'templates',
        status: 'trashed',
        event: 'restoreAllTrashed'
      })

      await waitFor(() => {
        expect(getByText('Restore Templates')).toBeInTheDocument()
        expect(
          getByText('This will restore all trashed templates you own.')
        ).toBeInTheDocument()
        expect(
          getByText('Are you sure you want to proceed?')
        ).toBeInTheDocument()
      })
    })

    it('should open delete dialog when event is deleteAllTrashed', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [trashedTemplatesMock],
        contentType: 'templates',
        status: 'trashed',
        event: 'deleteAllTrashed'
      })

      await waitFor(() => {
        expect(getByText('Delete Templates Forever')).toBeInTheDocument()
        expect(
          getByText(
            'This will permanently delete all trashed templates you own.'
          )
        ).toBeInTheDocument()
        expect(
          getByText('Are you sure you want to proceed?')
        ).toBeInTheDocument()
      })
    })
  })

  describe('Helper Text', () => {
    it('should display helper text for active journeys', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [activeJourneysMock],
        contentType: 'journeys',
        status: 'active',
        user
      })

      await waitFor(() =>
        expect(
          getByText(
            'You can archive a Journey to hide it from your active Journey list for better organization.'
          )
        ).toBeInTheDocument()
      )
    })

    it('should display helper text for archived journeys', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [archivedJourneysMock],
        contentType: 'journeys',
        status: 'archived',
        user
      })

      await waitFor(() =>
        expect(
          getByText(
            'You can archive a Journey to hide it from your active Journey list for better organization.'
          )
        ).toBeInTheDocument()
      )
    })

    it('should display helper text for trashed journeys', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [trashedJourneysMock],
        contentType: 'journeys',
        status: 'trashed',
        user
      })

      await waitFor(() =>
        expect(
          getByText('Trashed journeys are moved here for up to 40 days.')
        ).toBeInTheDocument()
      )
    })

    it('should display helper text for active templates', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [templatesMock],
        contentType: 'templates',
        status: 'active'
      })

      await waitFor(() => {
        expect(
          getByText('Templates let your team reuse and share projects.')
        ).toBeInTheDocument()
      })
    })

    it('should display helper text for archived templates', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [archivedTemplatesMock],
        contentType: 'templates',
        status: 'archived'
      })

      await waitFor(() =>
        expect(
          getByText('Archived templates are hidden from the Template Library.')
        ).toBeInTheDocument()
      )
    })

    it('should display helper text for trashed templates', async () => {
      const { getByText } = renderJourneyListContent({
        mocks: [trashedTemplatesMock],
        contentType: 'templates',
        status: 'trashed'
      })

      await waitFor(() =>
        expect(
          getByText('Trashed templates are moved here for up to 40 days.')
        ).toBeInTheDocument()
      )
    })
  })

  describe('Snackbar Messages', () => {
    it('should show "Journeys Archived" snackbar after archiving', async () => {
      const { getByText, getByRole } = renderJourneyListContent({
        mocks: [
          activeJourneysMock,
          archiveActiveJourneysMutationMock,
          activeJourneysMock
        ],
        contentType: 'journeys',
        status: 'active',
        user,
        event: 'archiveAllActive'
      })

      await waitFor(() =>
        expect(getByText('Archive Journeys')).toBeInTheDocument()
      )

      fireEvent.click(getByRole('button', { name: 'Archive' }))

      await waitFor(() =>
        expect(getByText('Journeys Archived')).toBeInTheDocument()
      )
    })

    it('should show "Journeys Trashed" snackbar after trashing', async () => {
      const { getByText, getByRole } = renderJourneyListContent({
        mocks: [
          activeJourneysMock,
          trashActiveJourneysMutationMock,
          activeJourneysMock
        ],
        contentType: 'journeys',
        status: 'active',
        user,
        event: 'trashAllActive'
      })

      await waitFor(() =>
        expect(getByText('Trash Journeys')).toBeInTheDocument()
      )

      fireEvent.click(getByRole('button', { name: 'Trash' }))

      await waitFor(() =>
        expect(getByText('Journeys Trashed')).toBeInTheDocument()
      )
    })

    it('should show "Templates Archived" snackbar after archiving', async () => {
      const { getByText, getByRole } = renderJourneyListContent({
        mocks: [
          templatesMock,
          archiveActiveTemplatesMutationMock,
          templatesMock
        ],
        contentType: 'templates',
        status: 'active',
        event: 'archiveAllActive'
      })

      await waitFor(() =>
        expect(getByText('Archive Templates')).toBeInTheDocument()
      )

      fireEvent.click(getByRole('button', { name: 'Archive' }))

      await waitFor(() =>
        expect(getByText('Templates Archived')).toBeInTheDocument()
      )
    })

    it('should show "Templates Trashed" snackbar after trashing', async () => {
      const { getByText, getByRole } = renderJourneyListContent({
        mocks: [templatesMock, trashActiveTemplatesMutationMock, templatesMock],
        contentType: 'templates',
        status: 'active',
        event: 'trashAllActive'
      })

      await waitFor(() =>
        expect(getByText('Trash Templates')).toBeInTheDocument()
      )

      fireEvent.click(getByRole('button', { name: 'Trash' }))

      await waitFor(() =>
        expect(getByText('Templates Trashed')).toBeInTheDocument()
      )
    })

    it('should show "Journeys Restored" snackbar after restoring', async () => {
      const { getByText, getByRole } = renderJourneyListContent({
        mocks: [
          archivedJourneysMock,
          restoreArchivedJourneysMutationMock,
          archivedJourneysMock
        ],
        contentType: 'journeys',
        status: 'archived',
        user,
        event: 'restoreAllArchived'
      })

      await waitFor(() =>
        expect(getByText('Unarchive Journeys')).toBeInTheDocument()
      )

      fireEvent.click(getByRole('button', { name: 'Unarchive' }))

      await waitFor(() =>
        expect(getByText('Journeys Restored')).toBeInTheDocument()
      )
    })

    it('should show "Journeys Trashed" snackbar after trashing', async () => {
      const { getByText, getByRole } = renderJourneyListContent({
        mocks: [
          archivedJourneysMock,
          trashArchivedJourneysMutationMock,
          archivedJourneysMock
        ],
        contentType: 'journeys',
        status: 'archived',
        user,
        event: 'trashAllArchived'
      })

      await waitFor(() =>
        expect(getByText('Trash Journeys')).toBeInTheDocument()
      )

      fireEvent.click(getByRole('button', { name: 'Trash' }))

      await waitFor(() =>
        expect(getByText('Journeys Trashed')).toBeInTheDocument()
      )
    })

    it('should show "Templates Restored" snackbar after restoring', async () => {
      const { getByText, getByRole } = renderJourneyListContent({
        mocks: [
          archivedTemplatesMock,
          restoreArchivedTemplatesMutationMock,
          archivedTemplatesMock
        ],
        contentType: 'templates',
        status: 'archived',
        event: 'restoreAllArchived'
      })

      await waitFor(() =>
        expect(getByText('Unarchive Templates')).toBeInTheDocument()
      )

      fireEvent.click(getByRole('button', { name: 'Unarchive' }))

      await waitFor(() =>
        expect(getByText('Templates Restored')).toBeInTheDocument()
      )
    })

    it('should show "Templates Trashed" snackbar after trashing', async () => {
      const { getByText, getByRole } = renderJourneyListContent({
        mocks: [
          archivedTemplatesMock,
          trashArchivedTemplatesMutationMock,
          archivedTemplatesMock
        ],
        contentType: 'templates',
        status: 'archived',
        event: 'trashAllArchived'
      })

      await waitFor(() =>
        expect(getByText('Trash Templates')).toBeInTheDocument()
      )

      fireEvent.click(getByRole('button', { name: 'Trash' }))

      await waitFor(() =>
        expect(getByText('Templates Trashed')).toBeInTheDocument()
      )
    })

    it('should show "Journeys Restored" snackbar after restoring', async () => {
      const { getByText, getByRole } = renderJourneyListContent({
        mocks: [
          trashedJourneysMock,
          restoreTrashedJourneysMutationMock,
          trashedJourneysMock
        ],
        contentType: 'journeys',
        status: 'trashed',
        user,
        event: 'restoreAllTrashed'
      })

      await waitFor(() =>
        expect(getByText('Restore Journeys')).toBeInTheDocument()
      )

      fireEvent.click(getByRole('button', { name: 'Restore' }))

      await waitFor(() =>
        expect(getByText('Journeys Restored')).toBeInTheDocument()
      )
    })

    it('should show "Journeys Deleted" snackbar after deleting', async () => {
      const { getByText, getByRole } = renderJourneyListContent({
        mocks: [
          trashedJourneysMock,
          deleteTrashedJourneysMutationMock,
          trashedJourneysMock
        ],
        contentType: 'journeys',
        status: 'trashed',
        user,
        event: 'deleteAllTrashed'
      })

      await waitFor(() =>
        expect(getByText('Delete Journeys Forever')).toBeInTheDocument()
      )

      fireEvent.click(getByRole('button', { name: 'Delete Forever' }))

      await waitFor(() =>
        expect(getByText('Journeys Deleted')).toBeInTheDocument()
      )
    })

    it('should show "Templates Restored" snackbar after restoring', async () => {
      const { getByText, getByRole } = renderJourneyListContent({
        mocks: [
          trashedTemplatesMock,
          restoreTrashedTemplatesMutationMock,
          trashedTemplatesMock
        ],
        contentType: 'templates',
        status: 'trashed',
        event: 'restoreAllTrashed'
      })

      await waitFor(() =>
        expect(getByText('Restore Templates')).toBeInTheDocument()
      )

      fireEvent.click(getByRole('button', { name: 'Restore' }))

      await waitFor(() =>
        expect(getByText('Templates Restored')).toBeInTheDocument()
      )
    })

    it('should show "Templates Deleted" snackbar after deleting', async () => {
      const { getByText, getByRole } = renderJourneyListContent({
        mocks: [
          trashedTemplatesMock,
          deleteTrashedTemplatesMutationMock,
          trashedTemplatesMock
        ],
        contentType: 'templates',
        status: 'trashed',
        event: 'deleteAllTrashed'
      })

      await waitFor(() =>
        expect(getByText('Delete Templates Forever')).toBeInTheDocument()
      )

      fireEvent.click(getByRole('button', { name: 'Delete Forever' }))

      await waitFor(() =>
        expect(getByText('Templates Deleted')).toBeInTheDocument()
      )
    })

  })

  describe('Refresh Query Param', () => {
    it('should refetch and remove refresh param when refresh query param is present', async () => {
      const replace = jest.fn()
      const pathname = '/'
      mockUseRouter.mockReturnValue({
        query: { refresh: 'true' },
        pathname,
        replace
      } as any)

      renderJourneyListContent({
        mocks: [activeJourneysMock],
        contentType: 'journeys',
        status: 'active',
        user
      })

      // Wait for useEffect to process refresh param
      await waitFor(() => {
        expect(replace).toHaveBeenCalledWith(
          {
            pathname,
            query: {}
          },
          undefined,
          { shallow: true }
        )
      })
    })

    it('should preserve other query params when removing refresh param', async () => {
      const replace = jest.fn()
      const pathname = '/'
      mockUseRouter.mockReturnValue({
        query: { refresh: 'true', type: 'journeys', status: 'active' },
        pathname,
        replace
      } as any)

      renderJourneyListContent({
        mocks: [activeJourneysMock],
        contentType: 'journeys',
        status: 'active',
        user
      })

      // Wait for useEffect to process refresh param
      await waitFor(() => {
        expect(replace).toHaveBeenCalledWith(
          {
            pathname,
            query: { type: 'journeys', status: 'active' }
          },
          undefined,
          { shallow: true }
        )
      })
    })

    it('should not call replace when refresh param is not present', async () => {
      const replace = jest.fn()
      mockUseRouter.mockReturnValue({
        query: { type: 'journeys' },
        pathname: '/',
        replace
      } as any)

      renderJourneyListContent({
        mocks: [activeJourneysMock],
        contentType: 'journeys',
        status: 'active',
        user
      })

      // Wait a bit to ensure useEffect has run
      await waitFor(() => {
        expect(screen.getByText('Default Journey Heading')).toBeInTheDocument()
      })

      // Replace should not be called since refresh param is not present
      expect(replace).not.toHaveBeenCalled()
    })
  })
})

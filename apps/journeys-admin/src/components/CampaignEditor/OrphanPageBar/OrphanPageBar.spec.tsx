import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react'
import { SnackbarProvider } from 'notistack'

import { CampaignPageKind } from '../../../../__generated__/globalTypes'
import { CAMPAIGN_REGION_DELETE } from '../../../libs/useCampaignRegionDeleteMutation'
import { CAMPAIGN_REGION_UPDATE } from '../../../libs/useCampaignRegionUpdateMutation'
import { BottomBar } from '../BottomBar'
import { CampaignEditorState } from '../CampaignEditorProvider'
import { campaignWithRegions } from '../data'
import {
  CommandProbe,
  QueriedEditor,
  RegionsProbe,
  SelectionProbe
} from '../testing'

const deleteMock = {
  request: { query: CAMPAIGN_REGION_DELETE, variables: { id: 'afrRegionId' } },
  result: vi.fn(() => ({
    data: {
      campaignRegionDelete: { __typename: 'CampaignRegion', id: 'afrRegionId' }
    }
  }))
}

const listMock = {
  request: {
    query: CAMPAIGN_REGION_UPDATE,
    variables: { id: 'afrRegionId', input: { listed: true } }
  },
  result: vi.fn(() => ({
    data: {
      campaignRegionUpdate: {
        __typename: 'CampaignRegion',
        id: 'afrRegionId',
        name: 'Africa',
        slug: 'afr',
        listed: true
      }
    }
  }))
}

function renderBar(
  initialState: Partial<CampaignEditorState>
): ReturnType<typeof render> {
  return render(
    <SnackbarProvider>
      <QueriedEditor
        campaignProp={campaignWithRegions}
        initialState={initialState}
        mocks={[deleteMock, listMock]}
      >
        <SelectionProbe />
        <CommandProbe />
        <RegionsProbe />
        <BottomBar onSettingsClick={vi.fn()} onThemeClick={vi.fn()} />
      </QueriedEditor>
    </SnackbarProvider>
  )
}

describe('OrphanPageBar', () => {
  beforeEach(() => vi.clearAllMocks())

  it("offers List on switcher and Delete region on an unlisted region's page bar", async () => {
    renderBar({
      pageKind: CampaignPageKind.regionTemplate,
      regionId: 'afrRegionId'
    })

    await waitFor(() =>
      expect(screen.getByTestId('OrphanPageDelete')).toBeInTheDocument()
    )
    expect(
      screen.getByRole('button', { name: 'List on switcher' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Delete region' })
    ).toBeInTheDocument()
  })

  it("offers no delete on a listed region's page or on the landing page", async () => {
    const { unmount } = renderBar({
      pageKind: CampaignPageKind.regionTemplate,
      regionId: 'eurRegionId'
    })

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Settings' })
      ).toBeInTheDocument()
    )
    expect(screen.queryByTestId('OrphanPageDelete')).not.toBeInTheDocument()
    unmount()

    renderBar({ pageKind: CampaignPageKind.landing })
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Settings' })
      ).toBeInTheDocument()
    )
    expect(screen.queryByTestId('OrphanPageDelete')).not.toBeInTheDocument()
  })

  it('lists the region on the switcher as a Command', async () => {
    renderBar({
      pageKind: CampaignPageKind.regionTemplate,
      regionId: 'afrRegionId'
    })

    await waitFor(() =>
      expect(screen.getByTestId('OrphanPageList')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'List on switcher' }))

    await waitFor(() => expect(listMock.result).toHaveBeenCalled())
    expect(screen.getByTestId('Region-afrRegionId')).toHaveTextContent(
      'Africa|afr|1|true|'
    )
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    expect(screen.queryByTestId('OrphanPageDelete')).not.toBeInTheDocument()
  })

  it('confirms the delete naming what goes, hard-deletes without a Command and returns to the landing page', async () => {
    renderBar({
      pageKind: CampaignPageKind.regionTemplate,
      regionId: 'afrRegionId'
    })

    await waitFor(() =>
      expect(screen.getByTestId('OrphanPageDelete')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Delete region' }))

    const dialog = screen.getByTestId('RegionDeleteDialog')
    expect(dialog).toHaveTextContent('Delete Africa?')
    expect(dialog).toHaveTextContent('share languages')
    expect(dialog).toHaveTextContent('QR codes')
    expect(dialog).toHaveTextContent('countries')
    expect(dialog).toHaveTextContent('lines')
    expect(deleteMock.result).not.toHaveBeenCalled()

    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() => expect(deleteMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.queryByTestId('Region-afrRegionId')).not.toBeInTheDocument()
    )
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
    expect(screen.getByTestId('PageKind')).toHaveTextContent('landing')
  })

  it('does not delete when the confirmation is cancelled', async () => {
    renderBar({
      pageKind: CampaignPageKind.regionTemplate,
      regionId: 'afrRegionId'
    })

    await waitFor(() =>
      expect(screen.getByTestId('OrphanPageDelete')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByRole('button', { name: 'Delete region' }))
    fireEvent.click(
      within(screen.getByTestId('RegionDeleteDialog')).getByRole('button', {
        name: 'Cancel'
      })
    )

    await waitFor(() =>
      expect(screen.queryByTestId('RegionDeleteDialog')).not.toBeInTheDocument()
    )
    expect(deleteMock.result).not.toHaveBeenCalled()
    expect(screen.getByTestId('Region-afrRegionId')).toBeInTheDocument()
  })
})

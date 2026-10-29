import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { GraphQLError } from 'graphql'
import { ReactElement, useState } from 'react'

import {
  GetCampaign_campaign as Campaign,
  GetCampaign_campaign_regions_languages as CampaignRegionLanguage
} from '../../../../../__generated__/GetCampaign'
import { JourneyStatus } from '../../../../../__generated__/globalTypes'
import { CAMPAIGN_REGION_LANGUAGE_UPDATE } from '../../../../libs/useCampaignRegionLanguageUpdateMutation'
import { CommandRedoItem } from '../../../Editor/Toolbar/Items/CommandRedoItem'
import { CommandUndoItem } from '../../../Editor/Toolbar/Items/CommandUndoItem'
import { useCampaignEditor } from '../../CampaignEditorProvider'
import { campaignWithRegions, eurEnglish, eurFrench } from '../../data'
import { CommandProbe, QueriedEditor } from '../../testing'
import { messageOf } from '../messageOf'

import { useShareLanguageLinkCommand } from './useShareLanguageLinkCommand'

const FRENCH_URL = 'https://admin.nextstep.is/journeys/frJourneyId'
const REFUSED_URL = 'https://your.nextstep.is/noel-europe'

const frJourney = {
  __typename: 'Journey' as const,
  id: 'frJourneyId',
  slug: 'noel-europe',
  status: JourneyStatus.published,
  title: 'Campagne en Europe',
  description: null
}

/** Europe's English Share Language after the author retitled its snapshot by hand. */
const editedEnglish: CampaignRegionLanguage = {
  ...eurEnglish,
  title: 'My Outreach title',
  snapshotEdited: true
}

const editedCampaign: Campaign = {
  ...campaignWithRegions,
  regions: campaignWithRegions.regions.map((region) =>
    region.id === 'eurRegionId'
      ? { ...region, languages: [editedEnglish, eurFrench] }
      : region
  )
}

interface UpdateMock {
  delay?: number
  request: Record<string, unknown>
  result: ReturnType<typeof vi.fn>
}

function updateMock(
  id: string,
  input: Record<string, unknown>,
  row: CampaignRegionLanguage
): UpdateMock {
  return {
    request: {
      query: CAMPAIGN_REGION_LANGUAGE_UPDATE,
      variables: { id, input }
    },
    result: vi.fn(() => ({ data: { campaignRegionLanguageUpdate: row } }))
  }
}

function refusedMock(id: string, input: Record<string, unknown>): UpdateMock {
  return {
    request: {
      query: CAMPAIGN_REGION_LANGUAGE_UPDATE,
      variables: { id, input }
    },
    result: vi.fn(() => ({
      errors: [
        new GraphQLError('Journey not found or not published', {
          extensions: { code: 'BAD_USER_INPUT', field: 'url' }
        })
      ]
    }))
  }
}

/** French once linked: the journey, its snapshot text and a freshly minted Campaign QR Code. */
const linkedFrench: CampaignRegionLanguage = {
  ...eurFrench,
  journeyId: 'frJourneyId',
  journeyUrl: 'https://your.nextstep.is/noel-europe',
  title: 'Campagne en Europe',
  description: null,
  snapshotEdited: false,
  qrCodeId: 'frQrCodeId',
  journey: frJourney,
  qrCode: {
    __typename: 'QrCode',
    id: 'frQrCodeId',
    shortLink: {
      __typename: 'ShortLink',
      id: 'frShortLinkId',
      pathname: 'eur-fr',
      domain: { __typename: 'ShortLinkDomain', hostname: 'short.nextstep.is' }
    }
  }
}

/** French unlinked again, keeping the Campaign QR Code the link minted. */
const unlinkedFrench: CampaignRegionLanguage = {
  ...linkedFrench,
  journeyId: null,
  journeyUrl: null,
  title: null,
  description: null,
  journey: null
}

/** English swapped to the French journey: the snapshot is reset to that journey's text. */
const swappedEnglish: CampaignRegionLanguage = {
  ...eurEnglish,
  journeyId: 'frJourneyId',
  journeyUrl: 'https://your.nextstep.is/noel-europe',
  title: 'Campagne en Europe',
  description: null,
  snapshotEdited: false,
  journey: frJourney
}

/** One paste field per Share Language: pasting a link calls `link`. */
function Harness(): ReactElement {
  const { campaign: current } = useCampaignEditor()
  const { link } = useShareLanguageLinkCommand()
  const [error, setError] = useState<string>()
  const languages =
    current.regions.find((region) => region.id === 'eurRegionId')?.languages ??
    []
  const french = languages.find((language) => language.id === eurFrench.id)
  const english = languages.find((language) => language.id === eurEnglish.id)

  function paste(regionLanguage: CampaignRegionLanguage, url: string): void {
    setError(undefined)
    link(regionLanguage, url).catch((linkError: unknown) =>
      setError(messageOf(linkError))
    )
  }

  return (
    <>
      {french != null && (
        <>
          <button onClick={() => paste(french, FRENCH_URL)}>Link French</button>
          <button onClick={() => paste(french, REFUSED_URL)}>
            Link French to an unpublished journey
          </button>
          <span data-testid="French">
            {[french.journeyId ?? '', french.qrCodeId ?? ''].join('|')}
          </span>
        </>
      )}
      {english != null && (
        <>
          <button onClick={() => paste(english, FRENCH_URL)}>
            Swap English
          </button>
          <span data-testid="English">
            {[
              english.journeyId ?? '',
              english.title ?? '',
              String(english.snapshotEdited)
            ].join('|')}
          </span>
        </>
      )}
      {error != null && <span data-testid="PasteError">{error}</span>}
    </>
  )
}

function renderHarness(
  mocks: UpdateMock[],
  campaignProp: Campaign = campaignWithRegions
): ReturnType<typeof render> {
  return render(
    <QueriedEditor campaignProp={campaignProp} mocks={mocks as never}>
      <CommandUndoItem variant="button" />
      <CommandRedoItem variant="button" />
      <CommandProbe />
      <Harness />
    </QueriedEditor>
  )
}

describe('useShareLanguageLinkCommand', () => {
  beforeEach(() => vi.clearAllMocks())

  it('links a Share Language as one Command; undo unlinks it and redo links the same journey by id', async () => {
    const linkMock = updateMock(eurFrench.id, { url: FRENCH_URL }, linkedFrench)
    const unlinkMock = updateMock(
      eurFrench.id,
      { journeyId: null },
      unlinkedFrench
    )
    const relinkMock = updateMock(
      eurFrench.id,
      { journeyId: 'frJourneyId' },
      linkedFrench
    )
    renderHarness([linkMock, unlinkMock, relinkMock])
    expect(await screen.findByTestId('French')).toHaveTextContent(/^\|$/)

    fireEvent.click(screen.getByRole('button', { name: 'Link French' }))

    await waitFor(() =>
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    )
    expect(linkMock.result).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('French')).toHaveTextContent(
      'frJourneyId|frQrCodeId'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(unlinkMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getByTestId('French')).toHaveTextContent(/^\|frQrCodeId$/)
    )

    fireEvent.click(screen.getByRole('button', { name: 'Redo' }))

    await waitFor(() => expect(relinkMock.result).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.getByTestId('French')).toHaveTextContent(
        'frJourneyId|frQrCodeId'
      )
    )
    expect(linkMock.result).toHaveBeenCalledTimes(1)
  })

  it('undoes a swap by writing the previous journey back by id and re-applying the snapshot text the author had edited', async () => {
    const swapMock = updateMock(
      eurEnglish.id,
      { url: FRENCH_URL },
      swappedEnglish
    )
    const swapBackMock = {
      ...updateMock(eurEnglish.id, { journeyId: 'eurJourneyId' }, eurEnglish),
      delay: 50
    }
    const restoreSnapshotMock = updateMock(
      eurEnglish.id,
      {
        title: 'My Outreach title',
        description: 'A journey for Europe.',
        snapshotEdited: true
      },
      editedEnglish
    )
    renderHarness([swapMock, swapBackMock, restoreSnapshotMock], editedCampaign)
    expect(await screen.findByTestId('English')).toHaveTextContent(
      'eurJourneyId|My Outreach title|true'
    )

    fireEvent.click(screen.getByRole('button', { name: 'Swap English' }))

    await waitFor(() =>
      expect(screen.getByTestId('English')).toHaveTextContent(
        'frJourneyId|Campagne en Europe|false'
      )
    )
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    await waitFor(() => expect(restoreSnapshotMock.result).toHaveBeenCalled())
    expect(swapBackMock.result).toHaveBeenCalled()
    expect(swapBackMock.result.mock.invocationCallOrder[0]).toBeLessThan(
      restoreSnapshotMock.result.mock.invocationCallOrder[0]
    )
    await waitFor(() =>
      expect(screen.getByTestId('English')).toHaveTextContent(
        'eurJourneyId|My Outreach title|true'
      )
    )
  })

  it('rejects the promise link returns when the API refuses the link, and adds nothing to undo', async () => {
    const refused = refusedMock(eurFrench.id, { url: REFUSED_URL })
    renderHarness([refused])
    await screen.findByTestId('French')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Link French to an unpublished journey'
      })
    )

    expect(await screen.findByTestId('PasteError')).toHaveTextContent(
      'Journey not found or not published'
    )
    expect(refused.result).toHaveBeenCalled()
    expect(screen.getByTestId('CommandCount')).toHaveTextContent('0')
    expect(screen.getByTestId('French')).toHaveTextContent(/^\|$/)
  })

  it('shows the API’s message in the snackbar when an undo is refused', async () => {
    const linkMock = updateMock(eurFrench.id, { url: FRENCH_URL }, linkedFrench)
    const refusedUnlink = {
      ...refusedMock(eurFrench.id, { journeyId: null }),
      result: vi.fn(() => ({
        errors: [
          new GraphQLError('You do not have permission to edit this campaign', {
            extensions: { code: 'FORBIDDEN' }
          })
        ]
      }))
    }
    renderHarness([linkMock, refusedUnlink])
    await screen.findByTestId('French')

    fireEvent.click(screen.getByRole('button', { name: 'Link French' }))
    await waitFor(() =>
      expect(screen.getByTestId('CommandCount')).toHaveTextContent('1')
    )

    fireEvent.click(screen.getByRole('button', { name: 'Undo' }))

    expect(
      await screen.findByText(
        'You do not have permission to edit this campaign'
      )
    ).toBeInTheDocument()
    expect(refusedUnlink.result).toHaveBeenCalled()
    expect(screen.queryByTestId('PasteError')).not.toBeInTheDocument()
  })
})
